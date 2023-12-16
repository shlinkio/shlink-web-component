import { createContext, useCallback, useContext, useState } from 'react';

export type VisitsComparisonItem = {
  name: string;
  query: string;
};

export type VisitsComparison = {
  visitsToCompare: VisitsComparisonItem[];
  addVisitToCompare: (item: VisitsComparisonItem) => void;
  removeVisitToCompare: (item: VisitsComparisonItem) => void;
  clearVisitsToCompare: () => void;
};

const VisitsComparisonContext = createContext<VisitsComparison | undefined>(undefined);

export const { Provider: VisitsComparisonProvider } = VisitsComparisonContext;

export const useVisitsToCompare = (): VisitsComparison | undefined => {
  const context = useContext(VisitsComparisonContext);
  return context as VisitsComparison | undefined;
};

export const useVisitsComparison = (): VisitsComparison => {
  const [visitsToCompare, setVisitsToCompare] = useState<VisitsComparisonItem[]>([]);
  const addVisitToCompare = useCallback(
    (item: VisitsComparisonItem) => setVisitsToCompare((prev) => [...prev, item]),
    [],
  );
  const removeVisitToCompare = useCallback(
    (item: VisitsComparisonItem) => setVisitsToCompare((prev) => prev.filter((i) => i !== item)),
    [],
  );
  const clearVisitsToCompare = useCallback(() => setVisitsToCompare([]), []);

  return { visitsToCompare, addVisitToCompare, removeVisitToCompare, clearVisitsToCompare };
};
