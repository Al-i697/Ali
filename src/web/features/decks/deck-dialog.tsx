import { useEffect, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { DECK_LIMITS } from '@shared/constants';
import type { DeckDto } from '@shared/dto';
import { createDeckSchema } from '@shared/schemas/decks';
import { api, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { useSubjects } from '@/lib/queries';
import { Alert, Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';
import { sizeLabel, suggestTitle } from './shared';

const MAX_MB = DECK_LIMITS.maxBytes / (1024 * 1024);

/** رفع درس جديد، أو تعديل بيانات درس قائم (مع استبدال صفحته اختياريًا) */
export function DeckDialog({ open, onOpenChange, deck }: { open: boolean; onOpenChange: (o: boolean) => void; deck: DeckDto | null }) {
  const fmt = useFmt();
  const subjects = useSubjects();
  const fileInput = useRef<HTMLInputElement>(null);
  const [v, setV] = useState({ title: '', description: '', subjectId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setFile(null);
    setTitleTouched(!!deck);
    setV(deck ? { title: deck.title, description: deck.description ?? '', subjectId: deck.subjectId ?? '' } : { title: '', description: '', subjectId: '' });
  }, [open, deck]);

  const pick = async (f: File | null) => {
    setError(null);
    if (f && f.size > DECK_LIMITS.maxBytes) {
      setFile(null);
      setError(`حجم الملف أكبر من ${MAX_MB} ميغابايت`);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    setFile(f);
    if (f && !titleTouched) {
      const t = await suggestTitle(f);
      setV((x) => (titleTouched || x.title.trim() ? x : { ...x, title: t }));
    }
  };

  const body = { title: v.title.trim(), description: v.description.trim() || null, subjectId: v.subjectId || null };
  const parsed = createDeckSchema.safeParse(body);
  const ready = parsed.success && (deck ? true : !!file);

  const form = () => {
    const f = new FormData();
    f.append('title', body.title);
    if (body.description) f.append('description', body.description);
    if (body.subjectId) f.append('subjectId', body.subjectId);
    f.append('file', file!); // الملف آخر حقل: يقرأ الخادم الحقول النصية قبله
    return f;
  };

  const save = useAppMutation(
    async () => {
      if (!deck) return api.upload<DeckDto>('/decks', form());
      const updated = await api.patch<DeckDto>(`/decks/${deck.id}`, body);
      if (!file) return updated;
      const f = new FormData();
      f.append('file', file);
      return api.putUpload<DeckDto>(`/decks/${deck.id}/file`, f);
    },
    {
      invalidate: [['decks']],
      success: deck ? 'حُفظ الدرس' : 'رُفع الدرس إلى مكتبتك',
      silentError: true,
      onSuccess: () => onOpenChange(false),
      onError: (e) => setError(errorMessage(e)),
    },
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={deck ? 'تعديل الدرس' : 'رفع درس تفاعلي'}
      description="صفحة HTML واحدة بكل أصولها (مثل دروس «الكتل النسبية» و«المول»). تُعرض في إطار معزول فلا تصل إلى بياناتك."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" disabled={!ready} loading={save.isPending} onClick={() => save.mutate()}>{deck ? 'حفظ' : 'رفع الدرس'}</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (ready) save.mutate(); }}>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label={deck ? 'استبدال صفحة الدرس (اختياري)' : 'ملف الدرس'} required={!deck} hint={`ملف html أو htm بحجم أقصاه ${MAX_MB} ميغابايت${deck ? ' — اتركه فارغًا للإبقاء على الصفحة الحالية' : ''}`}>
          {(p) => (
            <div className="flex items-center gap-3">
              <Button type="button" variant="soft" icon={<FileUp className="size-4" />} onClick={() => fileInput.current?.click()}>اختيار ملف</Button>
              <span className="min-w-0 truncate text-[14px] text-muted" dir="auto">
                {file ? `${file.name} — ${sizeLabel(file.size, fmt.num)}` : deck ? `الحالي: ${sizeLabel(deck.bytes, fmt.num)}` : 'لم يُختر ملف'}
              </span>
              <input ref={fileInput} id={p.id} aria-describedby={p['aria-describedby']} type="file" accept=".html,.htm,text/html" className="sr-only" onChange={(e) => void pick(e.target.files?.[0] ?? null)} />
            </div>
          )}
        </Field>
        <Field label="عنوان الدرس" required>
          {(p) => <Input {...p} value={v.title} onChange={(e) => { setTitleTouched(true); setV({ ...v, title: e.target.value }); }} maxLength={DECK_LIMITS.title} placeholder="مثال: الكتل النسبية ٣-١" />}
        </Field>
        <Field label="المادة" hint="اختيارية — لتصفية المكتبة">
          {(p) => (
            <Select {...p} value={v.subjectId} onChange={(e) => setV({ ...v, subjectId: e.target.value })}>
              <option value="">بلا مادة</option>
              {(subjects.data ?? []).filter((s) => !s.isArchived || s.id === deck?.subjectId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          )}
        </Field>
        <Field label="وصف" hint="اختياري">
          {(p) => <Textarea {...p} rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} maxLength={DECK_LIMITS.description} />}
        </Field>
      </form>
    </Modal>
  );
}
