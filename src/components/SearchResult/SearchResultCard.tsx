import { ISearchResultListItem } from '@/interfaces/searchInterfaces';
import { IconAngleRight, IconLayers, IconPaperclip } from 'hds-react/icons';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CustomTag } from '../shared';
import './styles.css';

const SearchResultCard: FC<ISearchResultListItem> = ({
  name,
  path,
  type,
  hashTags,
  phase,
  breadCrumbs,
}) => {
  const { t } = useTranslation();

  return (
    <Link to={`/planning/coordinator/${path}`} className="search-result-card-wrapper">
      <div className="search-result-card">
        {/* Title */}
        <div className="search-result-title-container">
          <div className="search-result-title">
            {name}
            {type !== 'projects' && (
              <CustomTag
                color={'var(--color-bus-medium-light	)'}
                icon={<IconLayers size="xs" />}
                text={t(`searchTag.${type}`)}
              />
            )}
          </div>
          {phase && (
            <CustomTag
              icon={<IconPaperclip size="xs" />}
              text={t(`enums.${phase}`)}
              color={'var(--color-suomenlinna-medium-light)'}
            />
          )}
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
        {hashTags && hashTags.length > 0 && (
          <div className="search-result-hashtags">
            {hashTags?.map((h) => (
              <CustomTag key={h.id} text={`#${h.value}`} color={'var(--color-gold-medium-light	)'} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default SearchResultCard;
