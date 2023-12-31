import { range, splitEvery } from '@shlinkio/data-manipulation';
import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkPaginator, ShlinkVisit, ShlinkVisits } from '../../../api-contract';

const ITEMS_PER_PAGE = 5000;
const DEFAULT_BATCH_SIZE = 4;
const PARALLEL_STARTING_PAGE = 2;

const isLastPage = ({ currentPage, pagesCount }: ShlinkPaginator): boolean => currentPage >= pagesCount;
const calcProgress = (total: number, current: number): number => (current * 100) / total;

export type VisitsLoader = (page: number, itemsPerPage: number) => Promise<ShlinkVisits>;
export type LastVisitLoader = (excludeBots?: boolean) => Promise<ShlinkVisit | undefined>;

type CreateLoadVisitsOptions = {
  /** Used to load visits for a specific page and number of items */
  visitsLoader: VisitsLoader;
  /** Invoked before loading a batch, can be used to stop loading more batches if it returns true */
  shouldCancel: () => boolean;
  /**
   * When a lot of batches need to be loaded, this callback is invoked with a value from 0 to 100, so that callers know
   * the actual progress.
   */
  progressChanged: (progress: number) => void;
  /** Max amount of parallel loadings in the same batch */
  batchSize?: number;
};

/**
 * Creates a callback used to load visits in batches, using provided visits loader as the source of visits, and
 * notifying progress changes when needed.
 */
export const createLoadVisits = ({
  visitsLoader,
  shouldCancel,
  progressChanged,
  batchSize = DEFAULT_BATCH_SIZE,
}: CreateLoadVisitsOptions) => {
  const loadVisitsInParallel = async (pages: number[]): Promise<ShlinkVisit[]> =>
    Promise.all(
      pages.map(async (page) => visitsLoader(page, ITEMS_PER_PAGE)
        .then(({ data }) => data)),
    ).then((result) => result.flat());

  const loadPagesBlocks = async (pagesBlocks: number[][], index = 0): Promise<ShlinkVisit[]> => {
    if (shouldCancel()) {
      return [];
    }

    const data = await loadVisitsInParallel(pagesBlocks[index]);

    progressChanged(calcProgress(pagesBlocks.length, index + 1));

    if (index < pagesBlocks.length - 1) {
      return data.concat(await loadPagesBlocks(pagesBlocks, index + 1));
    }

    return data;
  };

  return async (): Promise<ShlinkVisit[]> => {
    // Start by loading first page
    const { pagination, data } = await visitsLoader(1, ITEMS_PER_PAGE);
    // If there are no more pages, just return data
    if (isLastPage(pagination)) {
      return data;
    }

    // If there are more pages, calculate how many page blocks (AKA batches) are needed, and trigger them
    const pagesRange = range(PARALLEL_STARTING_PAGE, pagination.pagesCount + 1);
    const pagesBlocks = splitEvery(pagesRange, batchSize);

    if (pagination.pagesCount - 1 > batchSize) {
      progressChanged(0);
    }

    return data.concat(await loadPagesBlocks(pagesBlocks));
  };
};

export const lastVisitLoaderForLoader = (
  doIntervalFallback: boolean,
  loader: (params: ShlinkVisitsParams) => Promise<ShlinkVisits>,
): LastVisitLoader => async (excludeBots?: boolean) => (
  !doIntervalFallback
    ? Promise.resolve(undefined)
    : loader({ page: 1, itemsPerPage: 1, excludeBots }).then(({ data }) => data[0])
);
