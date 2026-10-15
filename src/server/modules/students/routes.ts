import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idSchema } from '../../../shared/schemas/common';
import {
  addStudentsSchema,
  createNoteSchema,
  createStudentSchema,
  enrollExistingSchema,
  importCommitSchema,
  moveStudentSchema,
  reorderStudentsSchema,
  studentsQuery,
  updateNoteSchema,
  updateStudentSchema,
} from '../../../shared/schemas/students';
import { LIMITS } from '../../../shared/constants';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { AppError, badRequest } from '../../lib/errors';
import { parse } from '../../lib/validate';
import { extractStudents, readFileRows, readPastedText } from './import';
import * as svc from './service';
import { buildStudentProfile } from './profile';

const idParam = z.object({ id: idSchema });
const sectionStudentParams = z.object({ id: idSchema, studentId: idSchema });
const forceQuery = z.object({ force: z.enum(['true', 'false']).optional() });
const profileQuery = z.object({ yearId: idSchema.optional(), termId: idSchema.optional() });
const pasteSchema = z.object({ text: z.string().min(1).max(500_000) });

export const studentsModule: FastifyPluginAsync = async (app) => {
  // ───────── الطلاب ─────────
  app.get('/students', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listStudents(db, ownerId, parse(studentsQuery, req.query));
  });

  app.post('/students', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const student = svc.createStudent(db, ownerId, parse(createStudentSchema, req.body));
    return reply.code(201).send(student);
  });

  app.get('/students/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getStudentDto(db, ownerId, parse(idParam, req.params).id);
  });

  app.patch('/students/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateStudent(db, ownerId, id, parse(updateStudentSchema, req.body));
  });

  app.delete('/students/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { force } = parse(forceQuery, req.query);
    svc.deleteStudent(db, ownerId, id, force === 'true');
    audit(req, { action: 'student_deleted', entityType: 'student', entityId: id });
    return { ok: true };
  });

  app.get('/students/:id/profile', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return buildStudentProfile(db, ownerId, id, parse(profileQuery, req.query));
  });

  app.post('/students/:id/move', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { sectionId } = parse(moveStudentSchema, req.body);
    svc.moveStudent(db, ownerId, id, sectionId);
    audit(req, { action: 'student_moved', entityType: 'student', entityId: id, meta: { sectionId } });
    return svc.getStudentDto(db, ownerId, id);
  });

  // ───────── ملاحظات الطالب ─────────
  app.get('/students/:id/notes', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listNotes(db, ownerId, parse(idParam, req.params).id);
  });

  app.post('/students/:id/notes', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return reply.code(201).send(svc.createNote(db, ownerId, id, parse(createNoteSchema, req.body)));
  });

  app.patch('/notes/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateNote(db, ownerId, id, parse(updateNoteSchema, req.body));
  });

  app.delete('/notes/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    svc.deleteNote(db, ownerId, parse(idParam, req.params).id);
    return { ok: true };
  });

  // ───────── قائمة الشعبة ─────────
  app.get('/sections/:id/students', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getRoster(db, ownerId, parse(idParam, req.params).id);
  });

  app.post('/sections/:id/students', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { students } = parse(addStudentsSchema, req.body);
    const roster = svc.addStudentsToSection(db, ownerId, id, students);
    audit(req, { action: 'students_added', entityType: 'section', entityId: id, meta: { count: students.length } });
    return reply.code(201).send(roster);
  });

  app.post('/sections/:id/students/enroll', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { studentIds } = parse(enrollExistingSchema, req.body);
    const result = svc.enrollExisting(db, ownerId, id, studentIds);
    audit(req, { action: 'students_enrolled', entityType: 'section', entityId: id, meta: { enrolled: result.enrolled } });
    return result;
  });

  app.delete('/sections/:id/students/:studentId', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id, studentId } = parse(sectionStudentParams, req.params);
    svc.unenroll(db, ownerId, id, studentId);
    return { ok: true };
  });

  app.post('/sections/:id/students/reorder', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.reorderSection(db, ownerId, id, parse(reorderStudentsSchema, req.body));
  });

  // ───────── الاستيراد: معاينة ثم تأكيد ─────────
  app.post('/sections/:id/students/import/preview', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    let rows;
    if (req.isMultipart()) {
      const file = await req.file({ limits: { fileSize: LIMITS.importMaxBytes, files: 1 } });
      if (!file) throw badRequest('لم يُرفع أي ملف');
      const buffer = await file.toBuffer();
      if (file.file.truncated) throw new AppError(413, 'TOO_LARGE', 'حجم الملف أكبر من 5 ميغابايت');
      rows = await readFileRows(buffer, file.filename);
    } else {
      rows = readPastedText(parse(pasteSchema, req.body).text);
    }
    const { rows: raw, detected } = extractStudents(rows);
    return svc.previewImport(db, ownerId, id, raw, detected);
  });

  app.post('/sections/:id/students/import/commit', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { rows } = parse(importCommitSchema, req.body);
    const result = svc.commitImport(db, ownerId, id, rows);
    audit(req, { action: 'students_imported', entityType: 'section', entityId: id, meta: { created: result.created, linked: result.linked } });
    return reply.code(201).send(result);
  });
};
