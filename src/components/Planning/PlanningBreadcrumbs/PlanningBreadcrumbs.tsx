import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectSelections } from '@/reducers/planningSlice';
import './styles.css';

const Breadcrumb = memo(({ value, path, id }: { value: string; path: string; id: string }) => (
  <>
    <IconAngleRight data-testid="breadcrumb-arrow" />
    <li>
      <Link data-testid={`${id}-breadcrumb`} to={path}>
        {value}
      </Link>
    </li>
  </>
));

Breadcrumb.displayName = 'Breadcrumb';

const PlanningBreadcrumbs = () => {
  const { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict } =
    useAppSelector(selectSelections);

  return (
    <ul className="breadcrumbs-list">
      <li>
        <Link to="" data-testid="programming-breadcrumb">
          {t('option.programming')}
        </Link>
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
