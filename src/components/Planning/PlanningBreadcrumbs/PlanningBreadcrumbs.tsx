import { useAppSelector } from '@/hooks/common';
import {
  selectSelectedClass,
  selectSelectedMasterClass,
  selectSelectedSubClass,
} from '@/reducers/classSlice';
import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
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
  const selectedMasterClass = useAppSelector(selectSelectedMasterClass);
  const selectedClass = useAppSelector(selectSelectedClass);
  const selectedSubClass = useAppSelector(selectSelectedSubClass);

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

export default memo(PlanningBreadcrumbs);
