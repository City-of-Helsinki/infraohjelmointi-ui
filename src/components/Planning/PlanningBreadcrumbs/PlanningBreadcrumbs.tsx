import { IconAngleRight } from 'hds-react/icons';
import { t } from 'i18next';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectMode, selectSelections } from '@/reducers/planningSlice';
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
    selectedCollectiveDistrict,
    selectedOtherClassification,
  } = useAppSelector(selectSelections);

  const mode = useAppSelector(selectMode);

  return (
    <ul className="breadcrumbs-list">
      <li>
        <Link to="" data-testid="programming-breadcrumb">
          {t(`nav.${mode}`)}
        </Link>
      </li>

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
          id="district"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel.id}`}
          value={selectedCollectiveSubLevel.name}
        />
      )}
      {selectedCollectiveDistrict && (
        <Breadcrumb
          id="district"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel?.id}&collectiveDistrict=${selectedCollectiveDistrict.id}`}
          value={selectedCollectiveDistrict.name}
        />
      )}
      {selectedOtherClassification && (
        <Breadcrumb
          id="district"
          path={`?masterClass=${selectedMasterClass?.id}&class=${selectedClass?.id}&subClass=${selectedSubClass?.id}&district=${selectedDistrict?.id}&collectiveSubLevel=${selectedCollectiveSubLevel?.id}&collectiveDistrict=${selectedCollectiveDistrict?.id}&otherClassification=${selectedOtherClassification.id}`}
          value={selectedOtherClassification.name}
        />
      )}
    </ul>
  );
};

export default memo(PlanningBreadcrumbs);
