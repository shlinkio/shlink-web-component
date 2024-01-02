import type { ShlinkVisit } from '@shlinkio/shlink-js-sdk/api-contract';
import type { VisitsLoader } from '../../../reducers/common';
import { createLoadVisits } from '../../../reducers/common';

type CreateLoadVisitsForComparisonOptions = {
  /** Used to load visits for a specific page and number of items */
  visitsLoaders: Record<string, VisitsLoader>;
  /** Invoked before loading a batch, can be used to stop loading more batches if it returns true */
  shouldCancel: () => boolean;
  /**
   * When a lot of batches need to be loaded, this callback is invoked with a value from 0 to 100, so that callers know
   * the actual progress.
   */
  progressChanged: (progress: number) => void;
};

/**
 * Creates a callback used to load visits in batches, using provided visits loader as the source of visits, and
 * notifying progress changes when needed.
 */
export const createLoadVisitsForComparison = ({
  visitsLoaders,
  shouldCancel,
  progressChanged,
}: CreateLoadVisitsForComparisonOptions) => {
  const keys = Object.keys(visitsLoaders);
  const batchSize = Math.max(1, Math.round(4 / keys.length));
  const progresses = Object.fromEntries(keys.map((key) => [key, 0]));
  const computeProgress = (key: string, progress: number) => {
    progresses[key] = progress;

    const values = Object.values(progresses);
    const sum = values.reduce((a, b) => a + b, 0);
    progressChanged(sum / values.length);
  };

  const loadVisitsEntries = Object.entries(visitsLoaders).map(
    ([key, visitsLoader]): [string, () => Promise<ShlinkVisit[]>] => [
      key,
      createLoadVisits({
        visitsLoader,
        batchSize,
        shouldCancel,
        progressChanged: (progress) => computeProgress(key, progress),
      }),
    ],
  );

  return async (): Promise<Record<string, ShlinkVisit[]>> => {
    // TODO Every loadVisits has a built-in batching logic, which is more or less "optimized" here by provided batchSize
    //      However, this Promise.all(...) may also need some batching if a large list of items is passed.
    const visitsEntries = await Promise.all(loadVisitsEntries.map(async ([key, loadVisits]) => {
      const visits = await loadVisits();
      return [key, visits];
    }));

    return Object.fromEntries(visitsEntries);
  };
};
