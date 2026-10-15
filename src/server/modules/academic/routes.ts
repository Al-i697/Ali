import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  addAssignmentSchema,
  cloneStructureSchema,
  createSectionSchema,
  createSubjectSchema,
  createYearSchema,
  updateAssignmentSchema,
  updateSectionSchema,
  updateSubjectSchema,
  updateTermSchema,
  updateYearSchema,
} from '../../../shared/schemas/academic';
import { idSchema } from '../../../shared/schemas/common';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });
const forceQuery = z.object({ force: z.enum(['true', 'false']).optional() });
const yearQuery = z.object({ yearId: idSchema });
const assignmentsQuery = z.object({ yearId: idSchema.optional(), sectionId: idSchema.optional() });

export const academicModule: FastifyPluginAsync = async (app) => {
  // ───────── السنوات والفصول ─────────
  app.get('/years', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listYears(db, ownerId);
  });

  app.post('/years', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const year = svc.createYear(db, ownerId, parse(createYearSchema, req.body));
    audit(req, { action: 'year_created', entityType: 'year', entityId: year.id });
    return reply.code(201).send(year);
  });

  app.patch('/years/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateYear(db, ownerId, id, parse(updateYearSchema, req.body));
  });

  app.post('/years/:id/current', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.setCurrentYear(db, ownerId, id);
  });

  app.delete('/years/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    svc.deleteYear(db, ownerId, id);
    audit(req, { action: 'year_deleted', entityType: 'year', entityId: id });
    return { ok: true };
  });

  app.patch('/terms/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateTerm(db, ownerId, id, parse(updateTermSchema, req.body));
  });

  app.post('/years/clone-structure', async (req) => {
    const { db, ownerId } = getCtx(req);
    const body = parse(cloneStructureSchema, req.body);
    const result = svc.cloneStructure(db, ownerId, body.fromYearId, body.toYearId);
    audit(req, { action: 'structure_cloned', meta: result });
    return result;
  });

  // ───────── المواد ─────────
  app.get('/subjects', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listSubjects(db, ownerId);
  });

  app.post('/subjects', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    return reply.code(201).send(svc.createSubject(db, ownerId, parse(createSubjectSchema, req.body)));
  });

  app.patch('/subjects/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateSubject(db, ownerId, id, parse(updateSubjectSchema, req.body));
  });

  app.delete('/subjects/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    svc.deleteSubject(db, ownerId, id);
    return { ok: true };
  });

  // ───────── الشعب ─────────
  app.get('/sections', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { yearId } = parse(yearQuery, req.query);
    return svc.listSections(db, ownerId, yearId);
  });

  app.post('/sections', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const section = svc.createSection(db, ownerId, parse(createSectionSchema, req.body));
    audit(req, { action: 'section_created', entityType: 'section', entityId: section.id });
    return reply.code(201).send(section);
  });

  app.get('/sections/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.getSection(db, ownerId, id);
  });

  app.patch('/sections/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateSection(db, ownerId, id, parse(updateSectionSchema, req.body));
  });

  app.get('/sections/:id/impact', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.sectionImpact(db, ownerId, id);
  });

  app.delete('/sections/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { force } = parse(forceQuery, req.query);
    svc.deleteSection(db, ownerId, id, force === 'true');
    audit(req, { action: 'section_deleted', entityType: 'section', entityId: id });
    return { ok: true };
  });

  // ───────── مقررات الشعب (شعبة × مادة) ─────────
  app.get('/assignments', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listAssignmentInfos(db, ownerId, parse(assignmentsQuery, req.query));
  });

  app.post('/sections/:id/assignments', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return reply.code(201).send(svc.addAssignment(db, ownerId, id, parse(addAssignmentSchema, req.body)));
  });

  app.patch('/assignments/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateAssignment(db, ownerId, id, parse(updateAssignmentSchema, req.body));
  });

  app.get('/assignments/:id/impact', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.assignmentImpact(db, ownerId, id);
  });

  app.delete('/assignments/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { force } = parse(forceQuery, req.query);
    svc.deleteAssignment(db, ownerId, id, force === 'true');
    audit(req, { action: 'assignment_deleted', entityType: 'assignment', entityId: id });
    return { ok: true };
  });
};
