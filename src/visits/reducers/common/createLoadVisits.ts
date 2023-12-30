import { range, splitEvery } from '@shlinkio/data-manipulation';
import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkPaginator, ShlinkVisit, ShlinkVisits } from '../../../api-contract';

const ITEMS_PER_PAGE = 5000;
const PARALLEL_REQUESTS_COUNT = 4;
const PARALLEL_STARTING_PAGE = 2;

const isLastPage = ({ currentPage, pagesCount }: ShlinkPaginator): boolean => currentPage >= pagesCount;
const calcProgress = (total: number, current: number): number => (current * 100) / total;

export type VisitsLoader = (page: number, itemsPerPage: number) => Promise<ShlinkVisits>;
export type LastVisitLoader = (excludeBots?: boolean) => Promise<ShlinkVisit | undefined>;

/**
 * Creates a callback used to load visits in batches, using provided visits loader as the source of visits, and
 * notifying progress changes when needed.
 * Batches are parallelized as much as possible, without triggering too many concurrent requests.
 *
 * @param visitsLoader Used to load visits for a specific page and number of items, which represent a batch
 * @param shouldCancel Invoked before loading a new batch, can be used to stop loading more batches if it returns true
 * @param progressChanged When a lot of batches need to be loaded, this callback is invoked with a value from 0 to 100
 */
export const createLoadVisits = (
  visitsLoader: VisitsLoader,
  shouldCancel: () => boolean,
  progressChanged: (progress: number) => void,
) => {
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

  return async (page = 1): Promise<ShlinkVisit[]> => {
    const { pagination, data } = await visitsLoader(page, ITEMS_PER_PAGE);

    // If pagination was not returned, then this is an old shlink version. Just return data
    if (!pagination || isLastPage(pagination)) {
      return data;
    }

    // If there are more pages, make requests in blocks of 4
    const pagesRange = range(PARALLEL_STARTING_PAGE, pagination.pagesCount + 1);
    const pagesBlocks = splitEvery(pagesRange, PARALLEL_REQUESTS_COUNT);

    if (pagination.pagesCount - 1 > PARALLEL_REQUESTS_COUNT) {
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
