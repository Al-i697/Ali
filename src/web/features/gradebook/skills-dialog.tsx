import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Check, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import type { SkillDto } from '@shared/dto';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Badge, Button, EmptyState, IconButton, Input, Modal, PageLoader, useConfirm } from '@/components/ui';

/** إدارة مهارات المادة: تُربط بالتقويمات ويُتتبَّع إتقان كل طالب لها */
export function SkillsDialog({ open, onOpenChange, subjectId, subjectName }: { open: boolean; onOpenChange: (o: boolean) => void; subjectId: string; subjectName: string }) {
  const confirm = useConfirm();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [edit, setEdit] = useState<{ id: string; title: string; code: string } | null>(null);
  const q = useQuery({ queryKey: [...qk.skills(subjectId), 'all'], queryFn: () => api.get<SkillDto[]>('/skills', { subjectId, includeArchived: true }), enabled: open });
  const inv = [qk.skills(subjectId), [...qk.skills(subjectId), 'all'] as const];
  const add = useAppMutation(() => api.post('/skills', { subjectId, title: title.trim(), code: code.trim() || null }), { invalidate: inv, onSuccess: () => { setTitle(''); setCode(''); } });
  const update = useAppMutation((v: { id: string; patch: Partial<{ title: string; code: string | null; isArchived: boolean }> }) => api.patch(`/skills/${v.id}`, v.patch), { invalidate: [...inv, ['gradebook']], onSuccess: () => setEdit(null) });
  const remove = useAppMutation((id: string) => api.del(`/skills/${id}`), { invalidate: [...inv, ['gradebook'], ['assessments']], success: 'حُذفت المهارة' });

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="md" title={`مهارات ${subjectName}`} description="اربط التقويمات بهذه المهارات ليظهر إتقان كل طالب لها في ملفه وفي تقارير الشعبة.">
      <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(); }}>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="الرمز" aria-label="رمز المهارة" className="w-24 text-center" maxLength={20} />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="وصف المهارة، مثل: استخدام المجهر الضوئي" aria-label="وصف المهارة" maxLength={200} />
        <Button type="submit" variant="primary" icon={<Plus className="size-4" />} disabled={!title.trim()} loading={add.isPending}>إضافة</Button>
      </form>
      {q.isPending ? <PageLoader /> : !q.data?.length ? (
        <EmptyState icon={<Target className="size-6" />} title="لا مهارات بعد" description="أضف مهارات المادة (مثل مهارات المختبر أو القراءة أو حل المسائل)." className="py-8" />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {q.data.map((s) => (
            <li key={s.id} className={cn('flex items-center gap-3 px-3.5 py-2.5', s.isArchived && 'opacity-60')}>
              {edit?.id === s.id ? (
                <form className="flex flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); update.mutate({ id: s.id, patch: { title: edit.title.trim(), code: edit.code.trim() || null } }); }}>
                  <Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} className="h-9 w-20 text-center" aria-label="الرمز" />
                  <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="h-9" aria-label="الوصف" autoFocus />
                  <IconButton label="حفظ" type="submit" variant="soft" size="iconSm"><Check className="size-4" /></IconButton>
                  <IconButton label="إلغاء" size="iconSm" onClick={() => setEdit(null)}><X className="size-4" /></IconButton>
                </form>
              ) : (
                <>
                  {s.code ? <Badge tone="brand" className="tnum">{s.code}</Badge> : null}
                  <span className="min-w-0 flex-1 text-[15px]">{s.title}</span>
                  {s.isArchived ? <Badge>مؤرشفة</Badge> : null}
                  <IconButton label="تعديل" size="iconSm" onClick={() => setEdit({ id: s.id, title: s.title, code: s.code ?? '' })}><Pencil className="size-4" /></IconButton>
                  <IconButton label={s.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'} size="iconSm" onClick={() => update.mutate({ id: s.id, patch: { isArchived: !s.isArchived } })}>{s.isArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}</IconButton>
                  <IconButton label="حذف" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: 'حذف المهارة؟', description: 'يُفكّ ارتباطها بالتقويمات. الدرجات نفسها لا تتأثر.', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(s.id); }}><Trash2 className="size-4" /></IconButton>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
