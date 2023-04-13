import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import { FC, memo } from 'react';
import { Link } from 'react-router-dom';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import './styles.css';

const Breadcrumb = memo(({ value, path, id }: { value: string; path: string; id: string }) => (
  <>
    <IconAngleRight />
    <li data-testid={`${id}-breadcrumbs`}>
      <Link to={path}>{value}</Link>
    </li>
  </>
));

Breadcrumb.displayName = 'Breadcrumb';

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

  return (
    <ul className="breadcrumbs-list">
      <li data-testid="programming-breadcrumb">
        <Link to="">{t('enums.programming')}</Link>
      </li>

      {selectedMasterClass && (
        <Breadcrumb
          id="masterClass"
          path={`${selectedMasterClass?.id}`}
          value={selectedMasterClass.name}
        />
      )}
      {selectedClass && (
        <Breadcrumb
          id="class"
          path={`${selectedMasterClass?.id}/${selectedClass?.id}`}
          value={selectedClass.name}
        />
      )}
      {selectedSubClass && (
        <Breadcrumb
          id="subClass"
          path={`${selectedMasterClass?.id}/${selectedClass?.id}/${selectedSubClass.id}`}
          value={selectedSubClass.name}
        />
      )}
      {selectedDistrict && (
        <Breadcrumb
          id="district"
          path={`${selectedMasterClass?.id}/${selectedClass?.id}/${selectedSubClass?.id}/${selectedDistrict.id}`}
          value={selectedDistrict.name}
        />
      )}
    </ul>
  );
};

export default memo(PlanningBreadcrumbs);
