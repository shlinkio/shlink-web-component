import type { CSSProperties } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type VisitsComparisonItem = {
  name: string;
  query: string;
  style?: CSSProperties;
};

export type VisitsComparison = {
  itemsToCompare: VisitsComparisonItem[];
  addItemToCompare: (item: VisitsComparisonItem) => void;
  canAddItemWithName: (name: VisitsComparisonItem['name']) => boolean;
  removeItemToCompare: (item: VisitsComparisonItem) => void;
  clearItemsToCompare: () => void;
};

const VisitsComparisonContext = createContext<VisitsComparison | undefined>(undefined);

export const { Provider: VisitsComparisonProvider } = VisitsComparisonContext;

export const useVisitsComparisonContext = (): VisitsComparison | undefined => {
  const context = useContext(VisitsComparisonContext);
  return context as VisitsComparison | undefined;
};

const MAX_ITEMS = 5;

export const useVisitsComparison = (): VisitsComparison => {
  const [itemsToCompare, setItemsToCompare] = useState<VisitsComparisonItem[]>([]);
  const maxItemsReached = useMemo(() => itemsToCompare.length >= MAX_ITEMS, [itemsToCompare.length]);
  const addItemToCompare = useCallback(
    (item: VisitsComparisonItem) => !maxItemsReached && setItemsToCompare((prev) => [...prev, item]),
    [maxItemsReached],
  );
  const canAddItemWithName = useCallback(
    (name: VisitsComparisonItem['name']) => !maxItemsReached && itemsToCompare.every((item) => item.name !== name),
    [itemsToCompare, maxItemsReached],
  );
  const removeItemToCompare = useCallback(
    (item: VisitsComparisonItem) => setItemsToCompare((prev) => prev.filter((i) => i !== item)),
    [],
  );
  const clearItemsToCompare = useCallback(() => setItemsToCompare([]), []);

  return { itemsToCompare, addItemToCompare, removeItemToCompare, clearItemsToCompare, canAddItemWithName };
};
