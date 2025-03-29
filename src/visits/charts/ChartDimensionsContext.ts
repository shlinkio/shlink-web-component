import { createContext, Fragment , useContext, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';

export type Dimensions = {
  width: number;
  height: number;
};

export type WrapperDimensions = {
  width?: '100%';
  height?: number;
};

export type ChartWrapperType = typeof ResponsiveContainer | typeof Fragment;

const ChartDimensionsContext = createContext<Dimensions | null>(null);

export const { Provider: ChartDimensionsProvider } = ChartDimensionsContext;

export type ChartDimensions = {
  ChartWrapper: ChartWrapperType;
  dimensions?: Dimensions;
  wrapperDimensions: WrapperDimensions;
};

export const useChartDimensions = (defaultHeight: number): ChartDimensions => {
  const dimensions = useContext(ChartDimensionsContext) ?? undefined;
  const wrapperDimensions = useMemo(() => dimensions ? {} : {
    width: '100%' as const,
    height: defaultHeight,
  }, [defaultHeight, dimensions]);
  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;

  return { ChartWrapper, dimensions, wrapperDimensions };
};
