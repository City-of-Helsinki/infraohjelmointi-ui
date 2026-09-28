import { ISearchResultListItem } from '@/interfaces/searchInterfaces';
import { IconAngleRight, IconScrollGroup, IconSize } from 'hds-react/icons';
import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CustomTag } from '../shared';
import './styles.css';
import optionIcon from '@/utils/optionIcon';
import { Button } from 'hds-react';

const SearchResultsCard: FC<ISearchResultListItem> = ({
  name,
  type,
  hashTags,
  phase,
  breadCrumbs,
  links,
  programmed,
}) => {
  const { t } = useTranslation();
  const iconGroup = useMemo(() => <IconScrollGroup size={IconSize.ExtraSmall} />, []);

  return (
    <div className="search-result-card">
      {/* Title */}
      <div className="search-result-title-container">
        <div className="search-result-title">
          <Link
            to={links.defaultLink}
            className="search-result-card-stretched-link color-black no-underline"
          >
            {name}
          </Link>
          {type === 'groups' && (
            <CustomTag
              color={'var(--color-bus-medium-light	)'}
              icon={iconGroup}
              text={t(`searchTag.${type}`)}
            />
          )}
          {type === 'projects' && !programmed && (
            <CustomTag color={'var(--color-bus-light	)'} text={t(`searchTag.notProgrammed`)} />
          )}
        </div>
        <div className="search-result-tag-container">
          {links.projectFormLink && (
            <Link to={links.projectFormLink} className="search-result-card-secondary-link">
              <Button className="ml-auto">{t('goToProjectForm')}</Button>
            </Link>
          )}
          {phase && (
            <CustomTag
              icon={optionIcon[phase as keyof typeof optionIcon]}
              text={t(`option.${phase}`)}
              color={'var(--color-suomenlinna-medium-light)'}
            />
          )}
        </div>
      </div>
      {/* Breadcrumbs */}
      <div className="search-result-breadcrumbs">
        {breadCrumbs?.map((b, i) => (
          <div key={b}>
            <span>{b}</span>
            {breadCrumbs.length > i + 1 && <IconAngleRight size={IconSize.ExtraSmall} />}
          </div>
        ))}
      </div>
      {hashTags && hashTags.length > 0 && (
        <div className="mt-3 flex" data-testid="search-result-hashtags">
          {hashTags?.map((h) => (
            <CustomTag key={h.id} text={`#${h.value}`} color={'var(--color-gold-medium-light)'} />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(SearchResultsCard);
