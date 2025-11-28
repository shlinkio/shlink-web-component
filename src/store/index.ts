import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { IContainer } from 'bottlejs';
import { useDispatch, useSelector } from 'react-redux';
import type { DomainsList } from '../domains/reducers/domainsList';
import type { MercureInfo } from '../mercure/reducers/mercureInfo';
import { mercureInfoReducer } from '../mercure/reducers/mercureInfo';
import type { SetShortUrlRedirectRules } from '../redirect-rules/reducers/setShortUrlRedirectRules';
import type { ShortUrlRedirectRules } from '../redirect-rules/reducers/shortUrlRedirectRules';
import { shortUrlRedirectRulesReducer } from '../redirect-rules/reducers/shortUrlRedirectRules';
import type { ShortUrlCreation } from '../short-urls/reducers/shortUrlCreation';
import { shortUrlCreationReducer } from '../short-urls/reducers/shortUrlCreation';
import type { ShortUrlDeletion } from '../short-urls/reducers/shortUrlDeletion';
import { shortUrlDeletionReducer } from '../short-urls/reducers/shortUrlDeletion';
import type { ShortUrlEdition } from '../short-urls/reducers/shortUrlEdition';
import { shortUrlEditionReducer } from '../short-urls/reducers/shortUrlEdition';
import type { ShortUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import type { ShortUrlsList } from '../short-urls/reducers/shortUrlsList';
import { shortUrlsListReducer } from '../short-urls/reducers/shortUrlsList';
import type { TagDeletion } from '../tags/reducers/tagDelete';
import { tagDeleteReducer } from '../tags/reducers/tagDelete';
import type { TagEdition } from '../tags/reducers/tagEdit';
import { tagEditReducer } from '../tags/reducers/tagEdit';
import type { TagsList } from '../tags/reducers/tagsList';
import type { DomainVisits } from '../visits/reducers/domainVisits';
import type { OrphanVisitsDeletion } from '../visits/reducers/orphanVisitsDeletion';
import type { ShortUrlVisits } from '../visits/reducers/shortUrlVisits';
import type { ShortUrlVisitsDeletion } from '../visits/reducers/shortUrlVisitsDeletion';
import type { TagVisits } from '../visits/reducers/tagVisits';
import type { VisitsInfo } from '../visits/reducers/types';
import type { VisitsOverview } from '../visits/reducers/visitsOverview';
import type { VisitsComparisonInfo } from '../visits/visits-comparison/reducers/types';

// @ts-expect-error process is actually available in vite
const isProduction = process.env.NODE_ENV === 'production';

export const setUpStore = (container: IContainer, preloadedState?: any) => configureStore<RootState>({
  devTools: !isProduction,
  reducer: combineReducers({
    mercureInfo: mercureInfoReducer,
    shortUrlsList: shortUrlsListReducer,
    shortUrlCreation: shortUrlCreationReducer,
    shortUrlDeletion: shortUrlDeletionReducer,
    shortUrlEdition: shortUrlEditionReducer,
    shortUrlsDetails: container.shortUrlsDetailsReducer as ShortUrlsDetails,
    shortUrlVisits: container.shortUrlVisitsReducer as ShortUrlVisits,
    shortUrlVisitsDeletion: container.shortUrlVisitsDeletionReducer as ShortUrlVisitsDeletion,
    shortUrlVisitsComparison: container.shortUrlVisitsComparisonReducer as VisitsComparisonInfo,
    tagVisits: container.tagVisitsReducer as TagVisits,
    tagVisitsComparison: container.tagVisitsComparisonReducer as VisitsComparisonInfo,
    domainVisits: container.domainVisitsReducer as DomainVisits,
    domainVisitsComparison: container.domainVisitsComparisonReducer as VisitsComparisonInfo,
    orphanVisits: container.orphanVisitsReducer as VisitsInfo,
    orphanVisitsDeletion: container.orphanVisitsDeletionReducer as OrphanVisitsDeletion,
    nonOrphanVisits: container.nonOrphanVisitsReducer as VisitsInfo,
    tagsList: container.tagsListReducer as TagsList,
    tagDelete: tagDeleteReducer,
    tagEdit: tagEditReducer,
    domainsList: container.domainsListReducer as DomainsList,
    visitsOverview: container.visitsOverviewReducer as VisitsOverview,
    shortUrlRedirectRules: shortUrlRedirectRulesReducer,
    shortUrlRedirectRulesSaving: container.setShortUrlRedirectRulesReducer as SetShortUrlRedirectRules,
  } as const),
  preloadedState,
  middleware: (defaultMiddlewaresIncludingReduxThunk) => defaultMiddlewaresIncludingReduxThunk({
    // State is too big for these
    immutableCheck: false,
    serializableCheck: false,
  }),
});

export type StoreType = ReturnType<typeof setUpStore>;
export type AppDispatch = StoreType['dispatch'];

// FIXME Replace with `export type RootState = ReturnType<StoreType['getState']>` When reducers are no longer pulled
//       from container
export type RootState = {
  mercureInfo: MercureInfo;
  shortUrlsList: ShortUrlsList;
  shortUrlCreation: ShortUrlCreation;
  shortUrlDeletion: ShortUrlDeletion;
  shortUrlEdition: ShortUrlEdition;
  shortUrlsDetails: ShortUrlsDetails;
  shortUrlVisits: ShortUrlVisits;
  shortUrlVisitsDeletion: ShortUrlVisitsDeletion;
  shortUrlVisitsComparison: VisitsComparisonInfo;
  tagVisits: TagVisits;
  tagVisitsComparison: VisitsComparisonInfo;
  domainVisits: DomainVisits;
  domainVisitsComparison: VisitsComparisonInfo;
  orphanVisits: VisitsInfo;
  orphanVisitsDeletion: OrphanVisitsDeletion;
  nonOrphanVisits: VisitsInfo;
  tagsList: TagsList;
  tagDelete: TagDeletion;
  tagEdit: TagEdition;
  domainsList: DomainsList;
  visitsOverview: VisitsOverview;
  shortUrlRedirectRules: ShortUrlRedirectRules;
  shortUrlRedirectRulesSaving: SetShortUrlRedirectRules;
};

// Typed versions of useDispatch() and useSelector()
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
