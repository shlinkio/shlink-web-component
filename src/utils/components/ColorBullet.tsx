import './ColorBullet.scss';

interface ColorBulletProps {
  color: string;
}

export const ColorBullet = ({ color }: ColorBulletProps) => (
  <div style={{ backgroundColor: color }} className="color-bullet" />
);
