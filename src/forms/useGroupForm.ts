import { IGroupForm } from '@/interfaces/formInterfaces';

import { useForm } from 'react-hook-form';

import { useEffect, useMemo, useState } from 'react';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';
import { IGroup } from '@/interfaces/groupInterfaces';
import { selectGroups } from '@/reducers/groupSlice';
import { useAppSelector } from '../hooks/common';
import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { IClass } from '@/interfaces/classInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { listItemToOption } from '@/utils/common';
import { ILocation } from '@/interfaces/locationInterfaces';
interface ISelectionState {
  selectedClass: string | undefined;
  selectedLocation: string | undefined;
}

const useGroupValues = (id: string | null,projects:IOption[]) => {
  const group = useAppSelector(selectGroups).find((g) => g.id === id) || null;
  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);

  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);
  const subDivisions = useAppSelector(selectSubDivisions);

  /**
   * There are three project classes, but only one id is saved. We create a list item of each class based on the id.
   */
  const getGroupClassFields = (group: IGroup | null) => {
    const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
      id: projectClass?.id ?? '',
      value: projectClass?.name ?? '',
    });

    const selectedSubClass = group
      ? subClasses.find(({ id }) => id === group.classRelation)
      : undefined;

    const projectClassId = selectedSubClass?.parent ?? group?.classRelation;

    const selectedClass = projectClassId
      ? classes.find(({ id }) => id === projectClassId)
      : undefined;

    const masterClassId = selectedClass?.parent ?? group?.classRelation;

    const selectedMasterClass = masterClassId
      ? masterClasses.find(({ id }) => id === masterClassId)
      : undefined;

    return {
      masterClass: listItemToOption(classAsListItem(selectedMasterClass) ?? []),
      class: listItemToOption(classAsListItem(selectedClass) ?? []),
      subClass: listItemToOption(classAsListItem(selectedSubClass) ?? []),
    };
  };

  /**
   * There are three project locations, but only one id is saved. We create a list item of each location based on the id.
   */
  const getGroupLocationFields = (group: IGroup | null) => {
    const locationAsListItem = (projectLocation: ILocation | undefined): IListItem => ({
      id: projectLocation?.id ?? '',
      value: projectLocation?.name ?? '',
    });

    const selectedSubDivision = group
      ? subDivisions.find(({ id }) => id === group.locationRelation)
      : undefined;

    const projectLocationId = selectedSubDivision?.parent ?? group?.locationRelation;

    const selectedDivision = projectLocationId
      ? divisions.find(({ id }) => id === projectLocationId)
      : undefined;

    const districtId = selectedDivision?.parent ?? group?.locationRelation;

    const selectedDistrict = districtId ? districts.find(({ id }) => id === districtId) : undefined;

    return {
      district: listItemToOption(locationAsListItem(selectedDistrict) ?? []),
      division: listItemToOption(locationAsListItem(selectedDivision) ?? []),
      subDivision: listItemToOption(locationAsListItem(selectedSubDivision) ?? []),
    };
  };

  const formValues: IGroupForm = useMemo(
    () => ({
      name: group?.name || '',
      ...getGroupClassFields(group),
      ...getGroupLocationFields(group),
      projectsForSubmit: projects.length > 0 ? projects: [],
    }),
    [group,projects],
  );

  return { formValues, group };
};

const useGroupForm = (id: string | null,projects: IOption[]) => {
  const { formValues, group } = useGroupValues(id,projects);

  const [selections, setSelections] = useState<ISelectionState>({
    selectedClass: '',
    selectedLocation: '',
  });
  
  const { selectedClass, selectedLocation } = selections;
  const classOptions = useClassOptions(selectedClass);
  const locationOptions = useLocationOptions(selectedLocation, selectedClass);

  const formMethods = useForm<IGroupForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onSubmit',
  });
  useEffect(()=>{
    setSelections((current) => ({ ...current, selectedClass: formValues.subClass.value, selectedLocation: formValues.division.value || formValues.district.value }));
  },[formValues.subClass.value,formValues.division.value,formValues.district.value])
  const { watch, setValue, reset } = formMethods;

  useEffect(() => {
    if (group) {
      reset(formValues);
    }
  }, [group,projects]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      switch (name) {
        case 'masterClass':
        case 'class':
        case 'subClass':
          if (value[name]?.value) {
            setSelections((current) => ({ ...current, selectedClass: value[name]?.value }));
          }
          if (name === 'masterClass') {
            setValue('class', { label: '', value: '' });
          }
          if (name === 'masterClass' || name === 'class') {
            setValue('subClass', { label: '', value: '' });
          }
          setValue('district', { label: '', value: '' });
          setValue('division', { label: '', value: '' });
          setValue('subDivision', { label: '', value: '' });
          setValue('projectsForSubmit', []);
          break;
        case 'district':
        case 'division':
        case 'subDivision':
          if (value[name]?.value) {
            setSelections((current) => ({ ...current, selectedLocation: value[name]?.value }));
          }
          if (name === 'district') {
            setValue('division', { label: '', value: '' });
          }
          if (name === 'district' || name === 'division') {
            setValue('subDivision', { label: '', value: '' });
          }
          setValue('projectsForSubmit', []);
          break;
        default:
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return {
    formMethods,
    formValues,
    classOptions,
    locationOptions,
  };
};

export default useGroupForm;
