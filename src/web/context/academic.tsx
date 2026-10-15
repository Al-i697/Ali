import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TermDto, YearDto } from '@shared/dto';
import { pickCurrentTerm } from '@shared/academic';
import { todayISO } from '@shared/dates';
import { useLocalState } from '@/lib/hooks';
import { useYears } from '@/lib/queries';

type AcademicValue = {
  years: YearDto[];
  year: YearDto | null;
  term: TermDto | null;
  setYearId: (id: string) => void;
  setTermId: (id: string) => void;
  isLoading: boolean;
};

const AcademicContext = createContext<AcademicValue | null>(null);

type Stored = { yearId?: string; termId?: string };

/** العام والفصل المختاران حاليًا: يحدّدان ما تعرضه الصفحات. الافتراضي: العام الحالي والفصل الذي نحن فيه. */
export function AcademicProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useYears();
  const [stored, setStored] = useLocalState<Stored>('sijilli-ctx', {});
  const years = useMemo(() => data ?? [], [data]);

  const value = useMemo<AcademicValue>(() => {
    const year = years.find((y) => y.id === stored.yearId) ?? years.find((y) => y.isCurrent) ?? years[0] ?? null;
    const term =
      (year && year.terms.find((t) => t.id === stored.termId)) ?? (year ? pickCurrentTerm(year.terms, todayISO()) : null);
    return {
      years,
      year,
      term,
      isLoading,
      setYearId: (id: string) => setStored({ yearId: id }),
      setTermId: (id: string) => setStored({ ...stored, yearId: year?.id, termId: id }),
    };
  }, [years, stored, isLoading, setStored]);

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic(): AcademicValue {
  const v = useContext(AcademicContext);
  if (!v) throw new Error('useAcademic يتطلب AcademicProvider');
  return v;
}
