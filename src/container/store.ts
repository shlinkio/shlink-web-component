import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { IContainer } from 'bottlejs';
import type { DomainsList } from '../domains/reducers/domainsList';
import type { MercureInfo } from '../mercure/reducers/mercureInfo';
import type { ShortUrlCreation } from '../short-urls/reducers/shortUrlCreation';
import type { ShortUrlDeletion } from '../short-urls/reducers/shortUrlDeletion';
import type { ShortUrlEdition } from '../short-urls/reducers/shortUrlEdition';
import type { ShortUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import type { ShortUrlsList } from '../short-urls/reducers/shortUrlsList';
import type { TagDeletion } from '../tags/reducers/tagDelete';
import type { TagEdition } from '../tags/reducers/tagEdit';
import type { TagsList } from '../tags/reducers/tagsList';
import type { DomainVisits } from '../visits/reducers/domainVisits';
import type { OrphanVisitsDeletion } from '../visits/reducers/orphanVisitsDeletion';
import type { ShortUrlVisits } from '../visits/reducers/shortUrlVisits';
import type { ShortUrlVisitsDeletion } from '../visits/reducers/shortUrlVisitsDeletion';
import type { TagVisits } from '../visits/reducers/tagVisits';
import type { VisitsInfo } from '../visits/reducers/types';
import type { VisitsOverview } from '../visits/reducers/visitsOverview';
import type { VisitsComparisonInfo } from '../visits/visits-comparison/reducers/types';

const isProduction = process.env.NODE_ENV === 'production';

export type RootState = {
  shortUrlsList: ShortUrlsList;
  shortUrlCreation: ShortUrlCreation;
  shortUrlDeletion: ShortUrlDeletion;
  shortUrlEdition: ShortUrlEdition;
  shortUrlVisits: ShortUrlVisits;
  shortUrlVisitsDeletion: ShortUrlVisitsDeletion;
  tagVisits: TagVisits;
  tagVisitsComparison: VisitsComparisonInfo;
  domainVisits: DomainVisits;
  domainVisitsComparison: VisitsComparisonInfo;
  orphanVisits: VisitsInfo;
  orphanVisitsDeletion: OrphanVisitsDeletion;
  nonOrphanVisits: VisitsInfo;
  shortUrlsDetails: ShortUrlsDetails;
  tagsList: TagsList;
  tagDelete: TagDeletion;
  tagEdit: TagEdition;
  mercureInfo: MercureInfo;
  domainsList: DomainsList;
  visitsOverview: VisitsOverview;
};

export const setUpStore = (container: IContainer) => configureStore({
  devTools: !isProduction,
  reducer: combineReducers({
    mercureInfo: container.mercureInfoReducer,
    shortUrlsList: container.shortUrlsListReducer,
    shortUrlCreation: container.shortUrlCreationReducer,
    shortUrlDeletion: container.shortUrlDeletionReducer,
    shortUrlEdition: container.shortUrlEditionReducer,
    shortUrlsDetails: container.shortUrlsDetailsReducer,
    shortUrlVisits: container.shortUrlVisitsReducer,
    shortUrlVisitsDeletion: container.shortUrlVisitsDeletionReducer,
    tagVisits: container.tagVisitsReducer,
    tagVisitsComparison: container.tagVisitsComparisonReducer,
    domainVisits: container.domainVisitsReducer,
    domainVisitsComparison: container.domainVisitsComparisonReducer,
    orphanVisits: container.orphanVisitsReducer,
    orphanVisitsDeletion: container.orphanVisitsDeletionReducer,
    nonOrphanVisits: container.nonOrphanVisitsReducer,
    tagsList: container.tagsListReducer,
    tagDelete: container.tagDeleteReducer,
    tagEdit: container.tagEditReducer,
    domainsList: container.domainsListReducer,
    visitsOverview: container.visitsOverviewReducer,
  } satisfies RootState),
  middleware: (defaultMiddlewaresIncludingReduxThunk) => defaultMiddlewaresIncludingReduxThunk({
    // State is too big for these
    immutableCheck: false,
    serializableCheck: false,
  }),
});
