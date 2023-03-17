import { ISearchResultListItem } from '@/interfaces/searchInterfaces';
import { IconAngleRight, IconLayers, IconPaperclip, IconCrossCircle } from 'hds-react/icons';
import { FC, memo, useMemo } from 'react';

import './styles.css';

interface ISelectedProjectCardProps {
  name: string;
  breadCrumbs: Array<string>;
}
const SelectedProjectCard: FC<ISelectedProjectCardProps> = ({ name, breadCrumbs }) => {
  return (
    <div className="search-result-card">
      {/* Title */}
      <div className="search-result-title-container">
        <div className="search-result-title">
          <span>{name}</span>
        </div>
        <div>
          <IconCrossCircle />
        </div>
      </div>
      {/* Breadcrumbs */}
      <div className="search-result-breadcrumbs">
        {breadCrumbs?.map((b, i) => (
          <div key={b}>
            <span>{b}</span>
            {breadCrumbs.length > i + 1 && <IconAngleRight size="xs" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(SelectedProjectCard);
