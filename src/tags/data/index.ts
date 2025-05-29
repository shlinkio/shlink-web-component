import type { ShlinkTagsStats } from '../../api-contract';

export type TagStats = Omit<ShlinkTagsStats, 'tag'>;

export interface TagModalProps {
  tag: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface SimplifiedTag {
  tag: string;
  shortUrls: number;
  visits: number;
}
