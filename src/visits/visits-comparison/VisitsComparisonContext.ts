import type { CSSProperties } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

export type VisitsComparisonItem = {
  name: string;
  query: string;
  style?: CSSProperties;
};

export type VisitsComparison = {
  itemsToCompare: VisitsComparisonItem[];
  addItemToCompare: (item: VisitsComparisonItem) => void;
  removeItemToCompare: (item: VisitsComparisonItem) => void;
  clearItemsToCompare: () => void;
};

const VisitsComparisonContext = createContext<VisitsComparison | undefined>(undefined);

export const { Provider: VisitsComparisonProvider } = VisitsComparisonContext;

export const useVisitsComparisonContext = (): VisitsComparison | undefined => {
  const context = useContext(VisitsComparisonContext);
  return context as VisitsComparison | undefined;
};

export const useVisitsComparison = (): VisitsComparison => {
  const [itemsToCompare, setItemsToCompare] = useState<VisitsComparisonItem[]>([]);
  const addItemToCompare = useCallback(
    (item: VisitsComparisonItem) => setItemsToCompare((prev) => [...prev, item]),
    [],
  );
  const removeItemToCompare = useCallback(
    (item: VisitsComparisonItem) => setItemsToCompare((prev) => prev.filter((i) => i !== item)),
    [],
  );
  const clearItemsToCompare = useCallback(() => setItemsToCompare([]), []);

  return { itemsToCompare, addItemToCompare, removeItemToCompare, clearItemsToCompare };
};
