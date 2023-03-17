import { ISearchResultListItem } from '@/interfaces/searchInterfaces';
import { IconAngleRight, IconLayers, IconPaperclip, IconCrossCircle } from 'hds-react/icons';
import { FC, memo, useMemo } from 'react';

import './styles.css';

interface ISelectedProjectCardProps {
  name: string;
  breadCrumbs: Array<string>;
  handleDelete: (name: string) => void;
}
const SelectedProjectCard: FC<ISelectedProjectCardProps> = ({
  name,
  breadCrumbs,
  handleDelete,
}) => {
  return (
    <div className="search-result-card">
      {/* Title */}
      <div className="search-result-title-container">
        <div className="search-result-title">
          <span>{name}</span>
        </div>
        <div className="cross-icon">
          <IconCrossCircle onClick={() => handleDelete(name)} />
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
