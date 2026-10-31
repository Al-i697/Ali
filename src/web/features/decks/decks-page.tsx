import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Play, Plus, Presentation, Search, Trash2 } from 'lucide-react';
import type { DeckDto } from '@shared/dto';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebounced, useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useSubjects } from '@/lib/queries';
import { Button, ButtonLink, Card, EmptyState, IconButton, Input, Menu, MenuItem, MenuSeparator, PageHeader, PageLoader, QueryError, Select, SubjectChip, useConfirm } from '@/components/ui';
import { DeckDialog } from './deck-dialog';
import { sizeLabel } from './shared';

function DeckCard({ deck, color, onEdit, onDelete }: { deck: DeckDto; color: string | null; onEdit: () => void; onDelete: () => void }) {
  const fmt = useFmt();
  return (
    <Card className={cn('relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-pop', color && `subj-${color}`)}>
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden>
          <Presentation className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/decks/${deck.id}/present`}
            className="block truncate text-[16.5px] font-semibold leading-6 text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand"
            title={deck.title}
          >
            {deck.title}
          </Link>
          {deck.description ? <p className="mt-0.5 line-clamp-2 text-[14px] text-muted">{deck.description}</p> : null}
        </div>
        <div className="relative z-10">
          <Menu align="end" trigger={<IconButton label={`خيارات «${deck.title}»`} size="iconSm"><MoreHorizontal className="size-[18px]" /></IconButton>}>
            <MenuItem icon={<Pencil className="size-4" />} onSelect={onEdit}>تعديل أو استبدال الصفحة</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Trash2 className="size-4" />} danger onSelect={onDelete}>حذف</MenuItem>
          </Menu>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
        {deck.subjectName && color ? <SubjectChip name={deck.subjectName} color={color} /> : null}
        <span className="tnum">{sizeLabel(deck.bytes, fmt.num)}</span>
        <span>أُضيف {fmt.date(deck.createdAt.slice(0, 10), 'medium')}</span>
        <span className="relative z-10 ms-auto">
          <ButtonLink to={`/decks/${deck.id}/present`} variant="primary" size="sm" icon={<Play className="size-4" />}>عرض في الحصة</ButtonLink>
        </span>
      </div>
    </Card>
  );
}

export default function DecksPage() {
  const confirm = useConfirm();
  const subjects = useSubjects();
  const [q, setQ] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const dq = useDebounced(q.trim(), 250);
  const [dialog, setDialog] = useState<{ deck: DeckDto | null } | null>(null);

  const params = { q: dq || undefined, subjectId: subjectId || undefined };
  const query = useQuery({ queryKey: qk.decks(params), queryFn: () => api.get<DeckDto[]>('/decks', params), placeholderData: (p) => p });
  const colors = useMemo(() => new Map((subjects.data ?? []).map((s) => [s.id, s.color])), [subjects.data]);
  const remove = useAppMutation((id: string) => api.del(`/decks/${id}`), { invalidate: [['decks']], success: 'حُذف الدرس' });

  const askDelete = async (d: DeckDto) => {
    const ok = await confirm({ title: `حذف «${d.title}»؟`, description: 'تُحذف صفحة الدرس من مكتبتك، ولا يمكن التراجع (احتفظ بنسخة من الملف الأصلي إن احتجته).', confirmLabel: 'حذف', tone: 'danger' });
    if (ok) remove.mutate(d.id);
  };

  const decks = query.data ?? [];
  const filtered = !!(dq || subjectId);

  return (
    <>
      <PageHeader
        title="الدروس التفاعلية"
        description="ارفع دروسك التفاعلية مرة واحدة وافتحها من هنا أثناء الحصة: تظهر عليها لوحة المشاركة العائمة لتسجّل مشاركة طلابك وأنت تشرح، وتُحفظ في سجلّك مع بقية بياناتهم."
        actions={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({ deck: null })}>رفع درس</Button>}
      />

      {decks.length > 0 || filtered ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-faint" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في العناوين…" aria-label="بحث في الدروس" className="ps-10" />
          </div>
          <div className="w-48">
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} aria-label="تصفية بالمادة">
              <option value="">كل المواد</option>
              {(subjects.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
        </div>
      ) : null}

      <h2 className="sr-only">{filtered ? 'نتائج البحث في الدروس' : 'دروسك التفاعلية'}</h2>
      {query.isPending ? (
        <PageLoader />
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      ) : decks.length === 0 ? (
        filtered ? (
          <EmptyState title="لا دروس مطابقة" description="جرّب كلمة أخرى أو اعرض كل المواد." action={<Button variant="soft" onClick={() => { setQ(''); setSubjectId(''); }}>مسح التصفية</Button>} />
        ) : (
          <EmptyState
            icon={<Presentation className="size-7" />}
            title="مكتبتك فارغة"
            description="ارفع أول درس تفاعلي (ملف HTML واحد). بعدها تفتحه في الحصة وتسجّل المشاركة من اللوحة العائمة فوقه."
            action={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({ deck: null })}>رفع درس</Button>}
          />
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {decks.map((d) => (
            <li key={d.id} className="flex">
              <DeckCard deck={d} color={d.subjectId ? colors.get(d.subjectId) ?? null : null} onEdit={() => setDialog({ deck: d })} onDelete={() => void askDelete(d)} />
            </li>
          ))}
        </ul>
      )}

      <DeckDialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)} deck={dialog?.deck ?? null} />
    </>
  );
}
