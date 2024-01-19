import { ColorBullet } from '../../utils/components/ColorBullet';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

interface TagBulletProps {
  tag: string;
  colorGenerator: ColorGenerator;
}

export const TagBullet = ({ tag, colorGenerator }: TagBulletProps) => (
  <ColorBullet color={colorGenerator.getColorForKey(tag)} />
);
