import { FormField, HookFormControlType, IForm, IGroupForm } from '@/interfaces/formInterfaces';

import { useForm, UseFormGetValues } from 'react-hook-form';

import { t, TFunction } from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/hooks/common';
import { IClass } from '@/interfaces/classInterfaces';
import { IListItem } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectMasterClasses, selectClasses, selectSubClasses } from '@/reducers/classSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { listItemToOption } from '@/utils/common';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';

interface ISelectionState {
  selectedClass: string | undefined;
  selectedLocation: string | undefined;
}
const useGroupValues = () => {
  const formValues = useMemo(
    () => ({
      name: '',
      masterClass: {},
      class: {},
      subClass: {},
      district: {},
      division: {},
      subDivision: {},
      projectsForSubmit: [],
    }),
    [],
  );
  return { formValues };
};

const useGroupForm = () => {
  const allMasterClasses = useAppSelector(selectMasterClasses);
  const allClasses = useAppSelector(selectClasses);
  const allSubClasses = useAppSelector(selectSubClasses);
  const allDistricts = useAppSelector(selectDistricts);
  const allDivisions = useAppSelector(selectDivisions);
  const allSubDivisions = useAppSelector(selectSubDivisions);

  const getReverseLocationHierarchy = useCallback(
    (subDivisionId: string | undefined) => {
      const classAsListItem = (projectLocation: ILocation | undefined): IListItem => ({
        id: projectLocation?.id || '',
        value: projectLocation?.name || '',
      });

      const selectedSubDivision = allSubDivisions.find((sd) => sd.id === subDivisionId);

      const selectedDivision = allDivisions.find((d) => d.id === selectedSubDivision?.parent);

      const selectedDistrict = allDistricts.find(
        (D) => D.id === selectedDivision?.parent && D.parent === null,
      );
      return {
        division: listItemToOption(classAsListItem(selectedDivision) || []),
        subDivision: listItemToOption(classAsListItem(selectedSubDivision) || []),
        district: listItemToOption(classAsListItem(selectedDistrict) || []),
      };
    },
    [allDivisions, allDistricts, allSubDivisions],
  );

  const getReverseClassHierarchy = useCallback(
    (subClassId: string | undefined) => {
      const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
        id: projectClass?.id || '',
        value: projectClass?.name || '',
      });

      const selectedSubClass = allSubClasses.find((sc) => sc.id === subClassId);

      const selectedClass = allClasses.find((c) => c.id === selectedSubClass?.parent);

      const selectedMasterClass = allMasterClasses.find(
        (mc) => mc.id === selectedClass?.parent && mc.parent === null,
      );
      return {
        _class: listItemToOption(classAsListItem(selectedClass) || []),
        subClass: listItemToOption(classAsListItem(selectedSubClass) || []),
        masterClass: listItemToOption(classAsListItem(selectedMasterClass) || []),
      };
    },
    [allClasses, allMasterClasses, allSubClasses],
  );
  const [selections, setSelections] = useState<ISelectionState>({
    selectedClass: '',
    selectedLocation: '',
  });
  const { selectedClass, selectedLocation } = selections;
  const { masterClasses, classes, subClasses } = useClassOptions(selectedClass);
  const { districts, divisions, subDivisions } = useLocationOptions(selectedLocation);
  const { formValues } = useGroupValues();

  const formMethods = useForm<IGroupForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onSubmit',
  });

  const { control, watch, setValue } = formMethods;
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'masterClass' && value.masterClass?.value) {
        setSelections((current) => ({ ...current, selectedClass: value.masterClass?.value }));
        setValue('class', { label: '', value: '' });
        setValue('subClass', { label: '', value: '' });
      } else if (name === 'class' && value.class?.value) {
        setSelections((current) => ({ ...current, selectedClass: value.class?.value }));
        setValue('subClass', { label: '', value: '' });
      } else if (name === 'subClass' && value.subClass?.value) {
        setSelections((current) => ({ ...current, selectedClass: value.subClass?.value }));
        if (!value.class?.value || !value.masterClass?.value) {
          const { _class, subClass, masterClass } = getReverseClassHierarchy(value.subClass?.value);
          setValue('masterClass', masterClass);
          setValue('class', _class);
          setValue('subClass', subClass);
        }
      }

      if (name === 'district' && value.district?.value) {
        setSelections((current) => ({ ...current, selectedLocation: value.district?.value }));
        setValue('division', { label: '', value: '' });
        setValue('subDivision', { label: '', value: '' });
      } else if (name === 'division' && value.division?.value) {
        setSelections((current) => ({ ...current, selectedLocation: value.division?.value }));
        setValue('subDivision', { label: '', value: '' });
      } else if (name === 'subDivision' && value.subDivision?.value) {
        setSelections((current) => ({ ...current, selectedLocation: value.subDivision?.value }));
        if (!value.division?.value || !value.district?.value) {
          const { division, subDivision, district } = getReverseLocationHierarchy(
            value.subDivision?.value,
          );
          setValue('district', district);
          setValue('division', division);
          setValue('subDivision', subDivision);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, getReverseClassHierarchy, getReverseLocationHierarchy]);

  return {
    formMethods,
    formValues,
    masterClasses,
    classes,
    subClasses,
    districts,
    divisions,
    subDivisions,
  };
};

export default useGroupForm;
