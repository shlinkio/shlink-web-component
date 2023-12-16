import { createContext, useCallback, useContext, useState } from 'react';

export type VisitsComparisonItem = {
  name: string;
  query: string;
};

export type VisitsComparison = {
  itemsToCompare: VisitsComparisonItem[];
  addItemToCompare: (item: VisitsComparisonItem) => void;
  removeItemToCompare: (item: VisitsComparisonItem) => void;
  clearItemsToCompare: () => void;
};

const VisitsComparisonContext = createContext<VisitsComparison | undefined>(undefined);

export const { Provider: VisitsComparisonProvider } = VisitsComparisonContext;

export const useVisitsToCompare = (): VisitsComparison | undefined => {
  const context = useContext(VisitsComparisonContext);
  return context as VisitsComparison | undefined;
};

export const useVisitsComparison = (): VisitsComparison => {
  const [itemsToCompare, setItemToCompare] = useState<VisitsComparisonItem[]>([]);
  const addItemToCompare = useCallback(
    (item: VisitsComparisonItem) => setItemToCompare((prev) => [...prev, item]),
    [],
  );
  const removeItemToCompare = useCallback(
    (item: VisitsComparisonItem) => setItemToCompare((prev) => prev.filter((i) => i !== item)),
    [],
  );
  const clearItemsToCompare = useCallback(() => setItemToCompare([]), []);

  return { itemsToCompare, addItemToCompare, removeItemToCompare, clearItemsToCompare };
};
