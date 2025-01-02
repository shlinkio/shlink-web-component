import { faArrowAltCircleRight as linkIcon } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren, ReactNode, RefObject } from 'react';
import { Link } from 'react-router';
import { Card, CardText, CardTitle, UncontrolledTooltip } from 'reactstrap';
import './HighlightCard.scss';

export type HighlightCardProps = PropsWithChildren<{
  title: string;
  link: string;
  tooltip?: ReactNode;
}>;

export const HighlightCard: FC<HighlightCardProps> = ({ children, title, link, tooltip }) => {
  const ref = useElementRef<HTMLElement>();

  return (
    <>
      <Card innerRef={ref} className="highlight-card" body tag={Link} to={link}>
        <FontAwesomeIcon size="3x" className="highlight-card__link-icon" icon={linkIcon} />
        <CardTitle className="lh-sm fw-semibold text-uppercase fs-5 highlight-card__title">{title}</CardTitle>
        <CardText className="fs-2 fw-semibold lh-sm">{children}</CardText>
      </Card>
      {tooltip && (
        <UncontrolledTooltip target={ref as RefObject<HTMLElement>} placement="bottom">{tooltip}</UncontrolledTooltip>
      )}
    </>
  );
};
