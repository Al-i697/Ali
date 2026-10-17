import { useCallback, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ClassRecordKind } from '@shared/constants';
import { sessionTotals } from '@shared/classroom';
import type { ClassRecordDto, ClassSessionDto, ClassSessionStudentDto } from '@shared/dto';
import { api, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { qk } from '@/lib/queries';

/** الحصة: مقرر + تاريخ + رقم حصة اختياري */
export type SessionRef = { assignmentId: string; date: string; period: number | null };

/** رسالة قصيرة بعد عملية: الصفحة الكاملة تعرضها إشعارًا منبثقًا، واللوحة العائمة (ونافذتها المنفصلة) داخل اللوحة نفسها */
export type Notice = { tone: 'good' | 'bad' | 'info'; text: string; action?: { label: string; run: () => void } };
export type Notify = (n: Notice) => void;

const toastNotify: Notify = (n) => {
  if (n.tone === 'bad') toast.error(n.text);
  else if (n.action) toast(n.text, { action: { label: n.action.label, onClick: n.action.run } });
  else toast.success(n.text);
};

export type NewRecord = { studentId: string; kind: ClassRecordKind; reason: string | null; note?: string | null };

const patchStudent = (cur: ClassSessionDto | undefined, studentId: string, fn: (s: ClassSessionStudentDto) => ClassSessionStudentDto): ClassSessionDto | undefined =>
  cur && { ...cur, students: cur.students.map((s) => (s.studentId === studentId ? fn(s) : s)) };

/**
 * منطق تسجيل حصة (يشترك فيه صفحة الحصة الكاملة واللوحة العائمة): الاستعلام، والمشاركة بالحالة المطلوبة،
 * وإضافة التسجيلات وحذفها مع «تراجع»، و«لم يشارك» لمن تبقّى، ومسح الحصة.
 *
 * كل الكتابات تُرسل بالترتيب نفسه الذي ضغطها به المعلم، وتُطبَّق على الذاكرة المؤقتة فورًا (أو بردّ الخادم) بلا إعادة جلب للحصة،
 * فلا يرتدّ ضغط سريع تالٍ بنتيجة جلب سبقت حفظه.
 */
export function useClassSession(ref: SessionRef | null, opts: { notify?: Notify } = {}) {
  const qc = useQueryClient();
  const fmt = useFmt();
  const assignmentId = ref?.assignmentId ?? '';
  const date = ref?.date ?? '';
  const period = ref?.period ?? null;
  const key = qk.classSession(assignmentId, date, period);

  const notifyRef = useRef<Notify>(opts.notify ?? toastNotify);
  notifyRef.current = opts.notify ?? toastNotify;
  const say = useCallback((n: Notice) => notifyRef.current(n), []);

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.get<ClassSessionDto>('/class/session', { assignmentId, date, period }),
    enabled: !!assignmentId,
  });
  const data = query.data;

  // كل ما عدا الحصة نفسها يُبطَل بعد التسجيل (الحصة تُحدَّث محليًا فلا ترتدّ الأرقام)
  const refreshAround = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['class'], predicate: (qy) => qy.queryKey[1] !== 'session' });
    void qc.invalidateQueries({ queryKey: qk.dashboard });
  }, [qc]);

  // سلسلة الكتابات: كل طلب ينتظر سابقه (نجح أو فشل) فيصل الخادم بالترتيب نفسه
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = useCallback(<T>(run: () => Promise<T>): Promise<T> => {
    const next = chain.current.then(run, run);
    chain.current = next.catch(() => undefined);
    return next;
  }, []);

  const setPart = useMutation({
    mutationFn: (v: { studentId: string; count: number | null }) => enqueue(() => api.put<ClassSessionStudentDto>('/class/participation', { assignmentId, date, period, studentId: v.studentId, count: v.count })),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      qc.setQueryData<ClassSessionDto>(key, (cur) => patchStudent(cur, v.studentId, (s) => ({ ...s, participation: v.count })));
    },
    onError: (err) => {
      say({ tone: 'bad', text: errorMessage(err) });
      void qc.invalidateQueries({ queryKey: key }); // نعيد الحقيقة من الخادم
    },
    onSettled: refreshAround,
  });
  // نعتمد على mutate (ثابتة الهوية) لا على كائن الطفرة (يتجدد كل رسم) كي لا يُعاد رسم كل صفوف الشعبة عند كل ضغطة
  const { mutate: mutatePart } = setPart;
  const setParticipation = useCallback((studentId: string, count: number | null) => mutatePart({ studentId, count }), [mutatePart]);

  const add = useMutation({
    mutationFn: (v: NewRecord) => enqueue(() => api.post<ClassRecordDto>('/class/records', { assignmentId, date, period, studentId: v.studentId, kind: v.kind, reason: v.reason, note: v.note ?? null })),
    onSuccess: (rec) => {
      qc.setQueryData<ClassSessionDto>(key, (cur) => patchStudent(cur, rec.studentId, (s) => ({ ...s, records: [...s.records, rec] })));
      refreshAround();
    },
    onError: (e) => say({ tone: 'bad', text: errorMessage(e) }),
  });

  const restore = useMutation({
    mutationFn: (r: ClassRecordDto) => enqueue(() => api.post<ClassRecordDto>('/class/records', { assignmentId: r.assignmentId ?? assignmentId, date: r.date, period: r.period, studentId: r.studentId, kind: r.kind, reason: r.reason, note: r.note })),
    onSuccess: (rec) => {
      qc.setQueryData<ClassSessionDto>(key, (cur) => patchStudent(cur, rec.studentId, (s) => ({ ...s, records: [...s.records, rec] })));
      refreshAround();
    },
    onError: (e) => say({ tone: 'bad', text: errorMessage(e) }),
  });

  const remove = useMutation({
    mutationFn: (r: ClassRecordDto) => enqueue(() => api.del(`/class/records/${r.id}`)),
    onMutate: (r) => {
      qc.setQueryData<ClassSessionDto>(key, (cur) => patchStudent(cur, r.studentId, (s) => ({ ...s, records: s.records.filter((x) => x.id !== r.id) })));
    },
    onSuccess: (_d, r) => {
      refreshAround();
      say({ tone: 'info', text: 'حُذف التسجيل', action: { label: 'تراجع', run: () => restore.mutate(r) } });
    },
    onError: (e) => {
      say({ tone: 'bad', text: errorMessage(e) });
      void qc.invalidateQueries({ queryKey: key });
    },
  });

  const fill = useMutation({
    mutationFn: () => enqueue(() => api.post<{ added: number; session: ClassSessionDto }>('/class/session/mark-rest', { assignmentId, date, period })),
    onSuccess: (r) => {
      qc.setQueryData(key, r.session);
      refreshAround();
      say({ tone: 'good', text: r.added ? `سُجِّل «لم يشارك» لـ ${fmt.num(r.added, 0)} ${r.added === 1 ? 'طالب' : 'طلاب'}` : 'لا طلاب بلا تسجيل' });
    },
    onError: (e) => say({ tone: 'bad', text: errorMessage(e) }),
  });

  const clear = useMutation({
    mutationFn: () => enqueue(() => api.del('/class/session', { assignmentId, date, period })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['class'] });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      say({ tone: 'good', text: 'مُسحت تسجيلات هذه الحصة' });
    },
    onError: (e) => say({ tone: 'bad', text: errorMessage(e) }),
  });

  const students = useMemo(() => data?.students ?? [], [data]);
  const totals = useMemo(() => sessionTotals(students), [students]);
  const { mutate: removeRecord } = remove;

  return { key, query, data, students, totals, setParticipation, addRecord: add, removeRecord, fill, clear };
}
