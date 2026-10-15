import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { SUBJECT_COLORS, SUBJECT_PRESETS } from '@shared/constants';
import type { SubjectDto } from '@shared/dto';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useAppMutation } from '@/lib/mutation';
import { qk, useSubjects } from '@/lib/queries';
import { Badge, Button, EmptyState, IconButton, Input, Modal, PageLoader, SubjectChip, useConfirm } from '@/components/ui';
import { BookOpenCheck } from 'lucide-react';

function ColorDots({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="لون المادة">
      {SUBJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(`subj-${c} grid size-6 place-items-center rounded-full bg-[var(--c)] ring-offset-2 ring-offset-surface transition`, value === c && 'ring-2 ring-[var(--c)]')}
        >
          {value === c ? <Check className="size-3.5 text-white" /> : null}
        </button>
      ))}
    </div>
  );
}

/** إدارة مواد المعلم: إضافة سريعة من قائمة جاهزة، إعادة تسمية، لون، أرشفة، حذف */
export function SubjectManager({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: subjects, isPending } = useSubjects();
  const confirm = useConfirm();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const add = useAppMutation((n: string) => api.post<SubjectDto>('/subjects', { name: n }), {
    invalidate: [qk.subjects],
    onSuccess: () => setName(''),
  });
  const update = useAppMutation((v: { id: string; patch: Partial<Pick<SubjectDto, 'name' | 'color' | 'isArchived'>> }) => api.patch<SubjectDto>(`/subjects/${v.id}`, v.patch), {
    invalidate: [qk.subjects, ['sections'], ['assignments']],
    onSuccess: () => setEditing(null),
  });
  const remove = useAppMutation((id: string) => api.del(`/subjects/${id}`), { invalidate: [qk.subjects], success: 'حُذفت المادة' });

  const existing = new Set((subjects ?? []).map((s) => s.name));
  const suggestions = SUBJECT_PRESETS.filter((p) => !existing.has(p));

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="md" title="المواد التي تدرّسها" description="تُستخدم المادة عند إنشاء الشعب والتحضير والتقويم. لكل مادة لون يميّزها في الواجهة.">
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) add.mutate(name.trim());
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم مادة جديدة…" aria-label="اسم المادة" maxLength={80} />
        <Button type="submit" variant="primary" icon={<Plus className="size-4" />} loading={add.isPending} disabled={!name.trim()}>إضافة</Button>
      </form>

      {suggestions.length ? (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <span className="me-1 text-[13px] text-muted">اقتراحات:</span>
          {suggestions.slice(0, 10).map((s) => (
            <button key={s} onClick={() => add.mutate(s)} className="rounded-full border border-dashed border-line-strong px-2.5 py-0.5 text-[13px] text-muted hover:border-brand hover:bg-brand-soft hover:text-brand">
              + {s}
            </button>
          ))}
        </div>
      ) : null}

      {isPending ? (
        <PageLoader />
      ) : !subjects?.length ? (
        <EmptyState icon={<BookOpenCheck className="size-6" />} title="لا مواد بعد" description="أضف مادتك الأولى من الأعلى." className="py-8" />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {subjects.map((s) => (
            <li key={s.id} className={cn('flex flex-wrap items-center gap-3 px-3.5 py-2.5', s.isArchived && 'opacity-60')}>
              {editing?.id === s.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editing.name.trim()) update.mutate({ id: s.id, patch: { name: editing.name.trim() } });
                  }}
                >
                  <Input autoFocus value={editing.name} onChange={(e) => setEditing({ id: s.id, name: e.target.value })} aria-label="اسم المادة" maxLength={80} />
                  <IconButton label="حفظ" type="submit" variant="soft"><Check className="size-4" /></IconButton>
                  <IconButton label="إلغاء" onClick={() => setEditing(null)}><X className="size-4" /></IconButton>
                </form>
              ) : (
                <>
                  <SubjectChip name={s.name} color={s.color} className="text-[14.5px]" />
                  <span className="text-[13px] text-muted">{s.assignmentCount ? `${s.assignmentCount} شعبة` : 'غير مستخدمة'}</span>
                  {s.isArchived ? <Badge>مؤرشفة</Badge> : null}
                  <div className="ms-auto flex items-center gap-1">
                    <ColorDots value={s.color} onChange={(c) => update.mutate({ id: s.id, patch: { color: c } })} />
                    <IconButton label="إعادة تسمية" size="iconSm" onClick={() => setEditing({ id: s.id, name: s.name })}><Pencil className="size-4" /></IconButton>
                    <IconButton label={s.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'} size="iconSm" onClick={() => update.mutate({ id: s.id, patch: { isArchived: !s.isArchived } })}>
                      {s.isArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                    </IconButton>
                    <IconButton
                      label="حذف"
                      size="iconSm"
                      className="hover:text-bad"
                      onClick={async () => {
                        if (await confirm({ title: `حذف «${s.name}»؟`, description: 'لا يمكن حذف مادة مستخدمة في شعب. أرشفها بدلًا من ذلك.', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(s.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
