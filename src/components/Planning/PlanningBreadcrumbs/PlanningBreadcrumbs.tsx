import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectPlanningMode, selectSelections } from '@/reducers/planningSlice';
import './styles.css';

const Breadcrumb = memo(({ value, path, id }: { value: string; path: string; id: string }) => (
  <>
    <IconAngleRight data-testid="breadcrumb-arrow" />
    <li className="breadcrumb">
      <Link data-testid={`${id}-breadcrumb`} to={path}>
        {value}
      </Link>
    </li>
  </>
));

Breadcrumb.displayName = 'Breadcrumb';

const PlanningBreadcrumbs = () => {
  const {
    selectedMasterClass,
    selectedClass,
    selectedSubClass,
    selectedDistrict,
    selectedCollectiveSubLevel,
    selectedSubLevelDistrict,
    selectedOtherClassification,
  } = useAppSelector(selectSelections);

  const mode = useAppSelector(selectPlanningMode);

  return (
    <ul className="breadcrumbs-list" data-testid="planning-breadcrumbs">
      <Link to="" data-testid={`${mode}-breadcrumb`}>
        {t(`nav.${mode}`)}
      </Link>

      {selectedMasterClass && (
        <Breadcrumb
          id="masterClass"
          path={`?masterClass=${selectedMasterClass?.id}`}
          value={selectedMasterClass.name}
        />
      )}
      {selectedClass && (
        <Breadcrumb
          id="class"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}`}
          value={selectedClass.name}
        />
      )}
      {selectedSubClass && (
        <Breadcrumb
          id="subClass"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass.id}`}
          value={selectedSubClass.name}
        />
      )}
      {selectedDistrict && (
        <Breadcrumb
          id="district"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict.id}`}
          value={selectedDistrict.name}
        />
      )}
      {selectedCollectiveSubLevel && (
        <Breadcrumb
          id="collectiveSubLevel"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel.id}`}
          value={selectedCollectiveSubLevel.name}
        />
      )}
      {selectedSubLevelDistrict && (
        <Breadcrumb
          id="subLevelDistrict"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel?.id}&subLevelDistrict=${selectedSubLevelDistrict.id}`}
          value={selectedSubLevelDistrict.name}
        />
      )}
      {selectedOtherClassification && (
        <Breadcrumb
          id="otherClassification"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel?.id}&subLevelDistrict=${selectedSubLevelDistrict?.id}&otherClassification=${selectedOtherClassification.id}`}
          value={selectedOtherClassification.name}
        />
      )}
    </ul>
  );
};

export default memo(PlanningBreadcrumbs);
