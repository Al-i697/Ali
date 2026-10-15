import { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, FileUp, ClipboardPaste, TriangleAlert } from 'lucide-react';
import type { ImportPreviewDto, ImportRowDto, RosterEntryDto } from '@shared/dto';
import { LIMITS } from '@shared/constants';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { Alert, Badge, Button, Checkbox, Modal, Segmented, Textarea } from '@/components/ui';

type Mode = 'paste' | 'file';

const actionLabel: Record<ImportRowDto['action'], { text: string; tone: 'good' | 'info' | 'neutral' }> = {
  create: { text: 'طالب جديد', tone: 'good' },
  link: { text: 'ربط بطالب سابق', tone: 'info' },
  skip: { text: 'تخطّي', tone: 'neutral' },
};

/**
 * استيراد الطلاب إلى شعبة: لصق أسماء أو رفع Excel/CSV ← معاينة (لا كتابة بعد) ← تأكيد.
 * المعاينة تكشف المكرر والموجود مسبقًا فلا تتكرر سجلات الطلاب.
 */
export function ImportDialog({ open, onOpenChange, sectionId, sectionLabel }: { open: boolean; onOpenChange: (o: boolean) => void; sectionId: string; sectionLabel: string }) {
  const fmt = useFmt();
  const [mode, setMode] = useState<Mode>('paste');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMode('paste');
    setText('');
    setFile(null);
    setPreview(null);
    setSkipped(new Set());
  }, [open]);

  const previewMut = useAppMutation(
    async () => {
      if (mode === 'file' && file) {
        const form = new FormData();
        form.append('file', file);
        return api.upload<ImportPreviewDto>(`/sections/${sectionId}/students/import/preview`, form);
      }
      return api.post<ImportPreviewDto>(`/sections/${sectionId}/students/import/preview`, { text });
    },
    { onSuccess: (p) => { setPreview(p); setSkipped(new Set()); } },
  );

  const included = (preview?.rows ?? []).filter((r) => r.action !== 'skip' && !skipped.has(r.rowNumber));
  const commit = useAppMutation(
    () =>
      api.post<{ created: number; linked: number; roster: RosterEntryDto[] }>(`/sections/${sectionId}/students/import/commit`, {
        rows: included.map((r) => ({ fullName: r.fullName, studentNumber: r.studentNumber, gender: r.gender, linkStudentId: r.linkStudentId })),
      }),
    {
      invalidate: ['academic'],
      success: (r) => `أُضيف ${fmt.num(r.created + r.linked)} طالبًا إلى الشعبة${r.linked ? ` (منهم ${fmt.num(r.linked)} من سجلات سابقة)` : ''}`,
      onSuccess: () => onOpenChange(false),
    },
  );

  const canPreview = mode === 'paste' ? text.trim().length > 0 : !!file;
  const counts = {
    create: included.filter((r) => r.action === 'create').length,
    link: included.filter((r) => r.action === 'link').length,
    skip: (preview?.rows.length ?? 0) - included.length,
  };

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > LIMITS.importMaxBytes) return;
    setFile(f);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size={preview ? 'lg' : 'md'}
      title={preview ? 'معاينة الاستيراد' : `استيراد طلاب إلى ${sectionLabel}`}
      description={preview ? 'راجع الصفوف قبل الحفظ. لن يُحفظ شيء حتى تضغط «تأكيد الاستيراد».' : 'الصق قائمة الأسماء أو ارفع ملف Excel/CSV. يُكتشف عمودا الاسم والرقم تلقائيًا.'}
      footer={
        preview ? (
          <>
            <Button variant="ghost" onClick={() => setPreview(null)}>رجوع</Button>
            <Button variant="primary" disabled={included.length === 0} loading={commit.isPending} onClick={() => commit.mutate()}>
              تأكيد استيراد {fmt.num(included.length)} طالبًا
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button variant="primary" disabled={!canPreview} loading={previewMut.isPending} onClick={() => previewMut.mutate()}>معاينة</Button>
          </>
        )
      }
    >
      {!preview ? (
        <div className="space-y-4">
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            label="طريقة الاستيراد"
            options={[
              { value: 'paste', label: 'لصق أسماء', icon: <ClipboardPaste className="size-4" /> },
              { value: 'file', label: 'ملف Excel / CSV', icon: <FileSpreadsheet className="size-4" /> },
            ]}
          />
          {mode === 'paste' ? (
            <div>
              <Textarea
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={'أحمد بن سالم الحارثي\nفاطمة بنت خالد البلوشية\nسعيد بن ناصر الهنائي\n…'}
                aria-label="قائمة الأسماء"
                className="font-[inherit] leading-7"
                autoFocus
              />
              <p className="mt-1.5 text-[13px] text-muted">سطر لكل طالب. يمكنك إضافة الرقم بعد الاسم مفصولًا بـ Tab أو فاصلة. يُتجاهل الترقيم في بداية السطر (1. 2. …).</p>
            </div>
          ) : (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
                className={cn('grid place-items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors', dragging ? 'border-brand bg-brand-soft' : 'border-line-strong bg-surface-2')}
              >
                <FileUp className="mb-2 size-8 text-brand" />
                {file ? (
                  <div>
                    <div className="font-medium text-ink">{file.name}</div>
                    <div className="text-[13px] text-muted">{fmt.num(file.size / 1024, 0)} ك.ب</div>
                  </div>
                ) : (
                  <div className="text-[15px] text-ink-2">اسحب الملف هنا أو</div>
                )}
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>{file ? 'اختيار ملف آخر' : 'اختيار ملف'}</Button>
                <input ref={inputRef} type="file" hidden accept=".xlsx,.csv,.tsv,.txt" onChange={(e) => pickFile(e.target.files?.[0])} aria-label="ملف الطلاب" />
              </div>
              <p className="mt-2 text-[13px] text-muted">الصيغ المدعومة: xlsx وCSV (حتى 5 ميغابايت و{fmt.num(LIMITS.importMaxRows)} طالب). ملفات xls القديمة: احفظها بصيغة xlsx أولًا.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <Badge tone="good">{fmt.num(counts.create)} جديد</Badge>
            {counts.link ? <Badge tone="info">{fmt.num(counts.link)} ربط بسجل سابق</Badge> : null}
            {counts.skip ? <Badge>{fmt.num(counts.skip)} مُتخطّى</Badge> : null}
            {preview.detected.headerRow ? <span className="text-muted">· تم التعرف على الأعمدة من الصف {fmt.num(preview.detected.headerRow)}</span> : null}
          </div>
          {preview.rows.some((r) => r.action === 'link') ? (
            <Alert tone="info">الصفوف «ربط بسجل سابق» لطلاب موجودين لديك (مثلًا من العام الماضي): يُسجَّلون في الشعبة دون إنشاء نسخة مكررة، فيحتفظ كل طالب بتاريخه الأكاديمي.</Alert>
          ) : null}
          <div className="max-h-[46vh] overflow-auto rounded-xl border border-line">
            <table className="w-full text-[14.5px]">
              <thead className="sticky top-0 bg-surface-3 text-[13px] text-muted">
                <tr>
                  <th className="w-12 px-3 py-2 text-start font-medium">✓</th>
                  <th className="px-3 py-2 text-start font-medium">الاسم</th>
                  <th className="px-3 py-2 text-start font-medium">الرقم</th>
                  <th className="px-3 py-2 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {preview.rows.map((r) => {
                  const off = r.action === 'skip' || skipped.has(r.rowNumber);
                  return (
                    <tr key={r.rowNumber} className={cn(off && 'bg-surface-2 text-muted')}>
                      <td className="px-3 py-2">
                        <Checkbox
                          aria-label={`استيراد ${r.fullName}`}
                          disabled={r.action === 'skip'}
                          checked={!off}
                          onChange={(e) => setSkipped((s) => { const n = new Set(s); if (e.target.checked) n.delete(r.rowNumber); else n.add(r.rowNumber); return n; })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className={cn(off && 'line-through')}>{r.fullName}</div>
                        {r.issues.length ? <div className="mt-0.5 flex items-start gap-1 text-[12.5px] text-warn"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" />{r.issues.join(' · ')}</div> : null}
                      </td>
                      <td className="px-3 py-2 tnum" dir="ltr">{r.studentNumber ?? '—'}</td>
                      <td className="px-3 py-2"><Badge tone={actionLabel[r.action].tone}>{actionLabel[r.action].text}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
