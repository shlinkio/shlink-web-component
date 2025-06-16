import type { FC } from 'react';
import { Tag } from '../../tags/helpers/Tag';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

interface TagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  colorGenerator: ColorGenerator;
}

export const Tags: FC<TagsProps> = ({ tags, onTagClick, colorGenerator }) => {
  if (tags.length === 0) {
    return <i className="whitespace-nowrap"><small>No tags</small></i>;
  }

  return (
    <div className="inline-flex flex-wrap gap-1 items-center">
      {tags.map((tag) => (
        <Tag
          key={tag}
          text={tag}
          colorGenerator={colorGenerator}
          onClick={() => onTagClick?.(tag)}
        />
      ))}
    </div>
  );
};
