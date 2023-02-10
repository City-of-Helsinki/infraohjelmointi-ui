import { IconAngleRight, IconPaperclip } from 'hds-react/icons';
import { FC } from 'react';
import { CustomTag } from '../shared';
import './styles.css';

interface ISearchResultCardProps {
  title: string;
}

const SearchResultCard: FC<ISearchResultCardProps> = ({ title }) => {
  return (
    <div className="search-result-card">
      {/* Title */}
      <div className="search-result-title-container">
        <div className="search-result-title">
          {title}
          <CustomTag text={'#tunniste'} />
        </div>
        <CustomTag
          icon={<IconPaperclip size="xs" />}
          text={'Suunnittelussa'}
          color={'var(--color-suomenlinna-medium-light)'}
        />
      </div>
      {/* Breadcrumbs */}
      <div className="search-result-breadcrumbs">
        <span>{'803 Kadut, liikenneväylät'}</span>
        <IconAngleRight size="xs" />
        <span>{'Uudisrakentaminen'}</span>
        <IconAngleRight size="xs" />
        <span>{'Pohjoinen suurpiiri'}</span>
      </div>
    </div>
  );
};

export default SearchResultCard;
