// منطق أكاديمي مشترك: تحديد الفصل الحالي وتقسيم العام تلقائيًا.
import { addDays, diffDays } from './dates';

type TermLike = { id: string; number: number; startDate: string; endDate: string };

/** الفصل الذي يقع فيه التاريخ، وإلا القادم، وإلا الأخير */
export function pickCurrentTerm<T extends TermLike>(terms: readonly T[], today: string): T | null {
  if (terms.length === 0) return null;
  const sorted = [...terms].sort((a, b) => a.number - b.number);
  return (
    sorted.find((t) => today >= t.startDate && today <= t.endDate) ??
    sorted.find((t) => t.startDate > today) ??
    sorted[sorted.length - 1]!
  );
}

/** تقسيم العام الدراسي إلى فصلين متتاليين عند منتصفه (قابل للتعديل لاحقًا) */
export function splitYearIntoTerms(start: string, end: string) {
  const total = diffDays(start, end);
  const mid = addDays(start, Math.floor(total / 2));
  return [
    { number: 1, name: 'الفصل الدراسي الأول', startDate: start, endDate: mid },
    { number: 2, name: 'الفصل الدراسي الثاني', startDate: addDays(mid, 1), endDate: end },
  ] as const;
}
