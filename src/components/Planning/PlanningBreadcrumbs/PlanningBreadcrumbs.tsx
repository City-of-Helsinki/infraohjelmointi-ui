import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import _ from 'lodash';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const BreadCrumb = memo(({ value, path }: { value: string; path: string }) => (
  <>
    <IconAngleRight />
    <li>
      <Link to={path}>{value}</Link>
    </li>
  </>
));

BreadCrumb.displayName = 'BreadCrumb';

const PlanningBreadcrumbs = () => {
  const selectedMasterClass = useAppSelector(
    (state: RootState) => state.class.selectedMasterClass,
    _.isEqual,
  );
  const selectedClass = useAppSelector((state: RootState) => state.class.selectedClass, _.isEqual);
  const selectedSubClass = useAppSelector(
    (state: RootState) => state.class.selectedSubClass,
    _.isEqual,
  );

  return (
    <div className="breadcrumbs-container">
      <ul>
        <li>
          <Link to="">{t('enums.programming')}</Link>
        </li>
        {selectedMasterClass && (
          <BreadCrumb path={`${selectedMasterClass?.id}`} value={selectedMasterClass.name} />
        )}
        {selectedClass && (
          <BreadCrumb
            path={`${selectedMasterClass?.id}/${selectedClass?.id}`}
            value={selectedClass.name}
          />
        )}
        {selectedSubClass && (
          <BreadCrumb
            path={`${selectedMasterClass?.id}/${selectedClass?.id}/${selectedSubClass.id}`}
            value={selectedSubClass.name}
          />
        )}
      </ul>
    </div>
  );
};

export default PlanningBreadcrumbs;
