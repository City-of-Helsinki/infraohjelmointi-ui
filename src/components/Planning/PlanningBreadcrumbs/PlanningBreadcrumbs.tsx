import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import { FC, memo } from 'react';
import { Link } from 'react-router-dom';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
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

interface PlanningBreadcrumbs {
  selections: {
    selectedMasterClass: IClass | null;
    selectedClass: IClass | null;
    selectedSubClass: IClass | null;
    selectedDistrict: ILocation | null;
  };
}

const PlanningBreadcrumbs: FC<PlanningBreadcrumbs> = ({ selections }) => {
  const { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict } = selections;

  console.log('Selected subclass: ', selectedSubClass);

  return (
    <ul className="breadcrumbs-list">
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
      {selectedDistrict && (
        <BreadCrumb
          path={`${selectedMasterClass?.id}/${selectedClass?.id}/${selectedSubClass?.id}/${selectedDistrict.id}`}
          value={selectedDistrict.name}
        />
      )}
    </ul>
  );
};

export default memo(PlanningBreadcrumbs);
