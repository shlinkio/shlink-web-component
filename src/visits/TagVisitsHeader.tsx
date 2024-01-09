import { Tag } from '../tags/helpers/Tag';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import type { TagVisits } from './reducers/tagVisits';
import { VisitsHeader } from './VisitsHeader';
import './ShortUrlVisitsHeader.scss';

interface TagVisitsHeaderProps {
  tagVisits: TagVisits;
  colorGenerator: ColorGenerator;
}

export const TagVisitsHeader = ({ tagVisits, colorGenerator }: TagVisitsHeaderProps) => {
  const { visits, tag } = tagVisits;
  const visitsStatsTitle = (
    <span className="d-flex align-items-center justify-content-center">
      <span className="me-2">Visits for</span>
      <Tag text={tag} colorGenerator={colorGenerator} />
    </span>
  );

  return <VisitsHeader title={visitsStatsTitle} visits={visits} />;
};
