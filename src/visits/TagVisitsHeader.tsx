import { Tag } from '../tags/helpers/Tag';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import type { TagVisits } from './reducers/tagVisits';
import { VisitsHeader } from './VisitsHeader';

interface TagVisitsHeaderProps {
  tagVisits: TagVisits;
  colorGenerator: ColorGenerator;
}

export const TagVisitsHeader = ({ tagVisits, colorGenerator }: TagVisitsHeaderProps) => {
  const { tag, visits = [] } = tagVisits.status === 'loaded' ? tagVisits : {};
  const visitsStatsTitle = (
    <span className="flex items-center justify-center">
      <span className="mr-2">Visits for</span>
      {tag && <Tag text={tag} colorGenerator={colorGenerator} />}
    </span>
  );

  return <VisitsHeader title={visitsStatsTitle} visits={visits} />;
};
