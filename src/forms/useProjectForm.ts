import { IProjectForm } from '@/interfaces/formInterfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { listItemToOption } from '@/utils/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import { selectProjectMode, selectProject } from '@/reducers/projectSlice';
import {
  selectPlanningClasses,
  selectAllPlanningClasses,
  selectPlanningSubClasses,
} from '@/reducers/classSlice';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';
import { IPerson } from '@/interfaces/personsInterfaces';
import {
  selectProjectDistricts,
  selectProjectDivisions,
  selectProjectSubDivisions,
} from '@/reducers/listsSlice';
import _ from 'lodash';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { notifyInfo } from '@/reducers/notificationSlice';
import { selectIsLoading, selectIsProjectCardLoading } from '@/reducers/loaderSlice';
import { useLocationBasedProgrammer } from '@/hooks/useLocationBasedProgrammer';

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * project which can be needed to check for updates.
 *
 * @returns formValues, project
 */
const useProjectFormValues = () => {
  const project = useAppSelector(selectProject);

  const masterClasses = useAppSelector(selectAllPlanningClasses);
  const classes = useAppSelector(selectPlanningClasses);
  const subClasses = useAppSelector(selectPlanningSubClasses);

  const districts = useAppSelector(selectProjectDistricts);
  const divisions = useAppSelector(selectProjectDivisions);
  const subDivisions = useAppSelector(selectProjectSubDivisions);

  const value = (value: string | undefined | null) => value ?? '';

  /**
   * There are three project classes, but only one id is saved. We create a list item of each class based on the id.
   */
  const getProjectClassFields = useCallback(
    (project: IProject | null) => {
      const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
        id: projectClass?.id ?? '',
        value: projectClass?.name ?? '',
      });

      const selectedSubClass = project
        ? subClasses.find(({ id }) => id === project.projectClass)
        : undefined;

      const projectClassId = selectedSubClass?.parent ?? project?.projectClass;

      const selectedClass = projectClassId
        ? classes.find(({ id }) => id === projectClassId)
        : undefined;

      const masterClassId = selectedClass?.parent ?? project?.projectClass;

      const selectedMasterClass = masterClassId
        ? masterClasses.find(({ id }) => id === masterClassId)
        : undefined;

      return {
        masterClass: listItemToOption(classAsListItem(selectedMasterClass) ?? []),
        class: listItemToOption(classAsListItem(selectedClass) ?? []),
        subClass: listItemToOption(classAsListItem(selectedSubClass) ?? []),
      };
    },
    [classes, subClasses, masterClasses],
  );

  const getSelectedLocation = useCallback(
    (locationList: IListItem[] | undefined, parentId?: string, locationId?: string) => {
      if (!locationList) return undefined;
      return (
        locationList.find(({ id }) => id === parentId) ??
        locationList.find(({ id }) => id === locationId)
      );
    },
    [],
  );

  /**
   * There are three project locations, but only one id is saved. We create a list item of each location based on the id.
   */
  const getProjectLocationFields = useCallback(
    (project: IProject | null) => {
      const locationAsListItem = (projectLocation: IListItem | undefined): IListItem => ({
        id: projectLocation?.id ?? '',
        value: projectLocation?.value ?? '',
      });

      const selectedSubDivision = getSelectedLocation(subDivisions, project?.projectDistrict);

      const selectedDivision = getSelectedLocation(
        divisions,
        selectedSubDivision?.parent,
        project?.projectDistrict,
      );

      const selectedDistrict = getSelectedLocation(
        districts,
        selectedDivision?.parent,
        project?.projectDistrict,
      );

      return {
        district: listItemToOption(locationAsListItem(selectedDistrict) ?? []),
        division: listItemToOption(locationAsListItem(selectedDivision) ?? []),
        subDivision: listItemToOption(locationAsListItem(selectedSubDivision) ?? []),
      };
    },
    [districts, divisions, subDivisions, getSelectedLocation],
  );

  const personToOption = (person?: IPerson): IOption => ({
    label: person ? `${person.firstName} ${person.lastName}` : '',
    value: person ? person.id : '',
  });

  const formValues: IProjectForm = useMemo(
    () => ({
      type: listItemToOption(project?.type),
      name: value(project?.name),
      description: value(project?.description),
      area: listItemToOption(project?.area),
      hkrId: value(project?.hkrId),
      sapProject: value(project?.sapProject),
      sapNetwork:
        project?.sapNetwork && project.sapNetwork.length > 0 ? project?.sapNetwork[0] : '',
      entityName: value(project?.entityName),
      hashTags: project?.hashTags ?? [],
      estPlanningStart: value(project?.estPlanningStart),
      estPlanningEnd: value(project?.estPlanningEnd),
      estConstructionStart: value(project?.estConstructionStart),
      estConstructionEnd: value(project?.estConstructionEnd),
      estWarrantyPhaseStart: value(project?.estWarrantyPhaseStart),
      estWarrantyPhaseEnd: value(project?.estWarrantyPhaseEnd),
      presenceStart: value(project?.presenceStart),
      presenceEnd: value(project?.presenceEnd),
      visibilityStart: value(project?.visibilityStart),
      visibilityEnd: value(project?.visibilityEnd),
      phase: listItemToOption(project?.phase),
      programmed: project?.programmed ?? false,
      constructionPhaseDetail: listItemToOption(project?.constructionPhaseDetail),
      louhi: project?.louhi ?? false,
      gravel: project?.gravel ?? false,
      category: listItemToOption(project?.category),
      effectHousing: project?.effectHousing ?? false,
      riskAssessment: listItemToOption(project?.riskAssessment),
      constructionEndYear: value(project?.constructionEndYear?.toString()),
      planningStartYear: value(project?.planningStartYear?.toString()),
      ...getProjectClassFields(project),
      ...getProjectLocationFields(project),
      projectWorkQuantity: value(project?.projectWorkQuantity?.toString()),
      projectQualityLevel: listItemToOption(project?.projectQualityLevel),
      projectCostForecast: value(project?.projectCostForecast?.toString()),
      planningCostForecast: value(project?.planningCostForecast),
      planningPhase: listItemToOption(project?.planningPhase),
      planningWorkQuantity: value(project?.planningWorkQuantity),
      constructionCostForecast: value(project?.constructionCostForecast),
      constructionPhase: listItemToOption(project?.constructionPhase),
      constructionWorkQuantity: value(project?.constructionWorkQuantity),
      costForecast: value(project?.costForecast),
      sapCurrentYear: value(project?.sapCurrentYear),
      realizedCost: value(project?.realizedCost),
      comittedCost: value(project?.comittedCost),
      spentCost: value(project?.spentCost),
      responsibleZone: listItemToOption(project?.responsibleZone),
      masterPlanAreaNumber: value(project?.masterPlanAreaNumber),
      trafficPlanNumber: value(project?.trafficPlanNumber),
      bridgeNumber: value(project?.bridgeNumber),
      projectProgram: value(project?.projectProgram),
      personPlanning: personToOption(project?.personPlanning),
      personConstruction: personToOption(project?.personConstruction),
      personProgramming: personToOption(project?.personProgramming),
      otherPersons: value(project?.otherPersons),
      budgetOverrunReason: listItemToOption(project?.budgetOverrunReason),
      otherBudgetOverrunReason: value(project?.otherBudgetOverrunReason),
      onSchedule: project?.onSchedule,
    }),
    [project, getProjectClassFields, getProjectLocationFields],
  );

  return {
    formValues,
    project,
    classes,
    subClasses,
    masterClasses,
    districts,
    divisions,
    subDivisions,
  };
};

/**
 * This hook initializes a react-hook-form control for the project form. It will keep the
 * form up to date with the selectedProject from redux and return all needed functions to handle
 * the form.
 *
 * @returns handleSubmit, reset, formFields, dirtyFields
 */
const useProjectForm = () => {
  const selectedProject = useAppSelector(selectProject);
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const { formValues, project } = useProjectFormValues();
  const projectMode = useAppSelector(selectProjectMode);
  const formMethods = useForm<IProjectForm>({
    defaultValues: formValues,
    mode: 'onBlur',
  });
  const isProjectCardLoading = useAppSelector(selectIsProjectCardLoading);
  const isLoading = useAppSelector(selectIsLoading);

  const [selections, setSelections] = useState({
    selectedClass: project?.projectClass,
    selectedLocation: project?.projectDistrict,
  });

  // control,
  const { reset, watch, setValue, getValues, formState } = formMethods;

  const selectedMasterClassName = formValues.masterClass.label;

  const classOptions = useClassOptions(selections?.selectedClass);

  const locationOptions = useLocationOptions(selections?.selectedLocation);

  // Get class-based programmer logic
  const { getDefaultProgrammerFromClassHierarchy } = useLocationBasedProgrammer();

  // Set the default programmer based on class hierarchy
  const setDefaultProgrammerForClassHierarchy = useCallback(
    (masterClassId?: string, classId?: string, subClassId?: string) => {
      const defaultProgrammer = getDefaultProgrammerFromClassHierarchy(
        masterClassId,
        classId,
        subClassId,
      );

      if (defaultProgrammer) {
        // Convert the programmer to an option format
        const programmerOption = {
          value: defaultProgrammer.id,
          label: defaultProgrammer.value,
        };
        setValue('personProgramming', programmerOption);
      } else {
        // No default programmer found, leave field empty
        setValue('personProgramming', null);
      }
    },
    [getDefaultProgrammerFromClassHierarchy, setValue],
  );

  // Set the selected class and empty the other selected classes if a parent class is selected
  const setSelectedClass = useCallback(
    (name: string, form: IProjectForm) => {
      const optionValue = (form[name as unknown as keyof IProjectForm] as IOption)?.value;

      if (name === 'masterClass') {
        setValue('class', { label: '', value: '' });
      }
      if (name === 'masterClass' || name === 'class') {
        setValue('subClass', { label: '', value: '' });
      }
      if (optionValue) {
        setSelections((current) => ({
          ...current,
          selectedClass: optionValue,
        }));
      }

      // After setting the class, determine and set the default programmer
      const currentForm = getValues();
      const masterClassId = currentForm.masterClass?.value || '';
      const classId = currentForm.class?.value || '';
      const subClassId = currentForm.subClass?.value || '';

      // Set default programmer based on class hierarchy
      setDefaultProgrammerForClassHierarchy(masterClassId, classId, subClassId);
    },
    [setValue, getValues, setDefaultProgrammerForClassHierarchy],
  );

  const setLocationSubClass = useCallback(
    (name: string) => {
      const newSubClass = classOptions.subClasses.find(({ label }) => label.includes(name));
      if (newSubClass) {
        setValue('subClass', newSubClass);
        setSelections((current) => ({
          ...current,
          selectedClass: newSubClass.value,
        }));
      }
    },
    [setValue, classOptions.subClasses],
  );

  // Set the selected location and empty the other locations if a parent location is selected
  const setSelectedLocation = useCallback(
    (name: string, form: IProjectForm) => {
      const optionValue = (form[name as unknown as keyof IProjectForm] as IOption)?.value;

      if (name === 'district') {
        setValue('division', { label: '', value: '' });
        if (
          ['suurpiiri', 'östersundom'].some((substring) =>
            formValues.subClass.label.includes(substring),
          )
        ) {
          setLocationSubClass(form.district.label);
        }
      }
      if (name === 'district' || name === 'division') {
        setValue('subDivision', { label: '', value: '' });
      }
      if (optionValue) {
        setSelections((current) => ({
          ...current,
          selectedLocation: optionValue,
        }));

        // Set default programmer based on current class hierarchy
        const currentForm = getValues();
        const masterClassId = currentForm.masterClass?.value || '';
        const classId = currentForm.class?.value || '';
        const subClassId = currentForm.subClass?.value || '';
        setDefaultProgrammerForClassHierarchy(masterClassId, classId, subClassId);
      }
    },
    [setValue, formValues, setLocationSubClass, getValues, setDefaultProgrammerForClassHierarchy],
  );

  // Listen to changes in the form value and set selected class or location if those properties are changed
  useEffect(() => {
    const subscription = watch((form, { name }) => {
      if (name) {
        if (['masterClass', 'class', 'subClass'].includes(name)) {
          setSelectedClass(name, form as IProjectForm);
        }
        if (['district', 'division', 'subDivision'].includes(name)) {
          setSelectedLocation(name, form as IProjectForm);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, setSelectedClass, setSelectedLocation]);

  const dispatch = useAppDispatch();

  // Track previous values to avoid unnecessary resets
  const [prevValues, setPrevValues] = useState(formValues);

  // Updates form with the selectedProject from redux
  useEffect(() => {
    const currentState = getValues();
    const inComingState = formValues;
    const isSubmitting = formState.isSubmitting;
    const sameValuesInStates = _.isEqual(currentState, inComingState);
    const projectUpdateMatchesCurrentProject = project?.id === projectUpdate?.project?.id;

    // Only reset if values have actually changed
    if (!_.isEqual(prevValues, formValues)) {
      setPrevValues(formValues);

      if (
        (projectMode === 'edit' && projectUpdateMatchesCurrentProject && !sameValuesInStates) ||
        (selectedProject !== null && projectMode === 'new')
      ) {
        reset(formValues);
        if (projectMode === 'edit' && !isSubmitting) {
          dispatch(
            notifyInfo({
              title: 'update',
              message: 'projectUpdated',
              type: 'toast',
              duration: 3500,
            }),
          );
        }
      }
    }
  }, [
    project,
    projectUpdate,
    dispatch,
    formState.isSubmitting,
    formValues,
    getValues,
    projectMode,
    reset,
    selectedProject,
    prevValues,
  ]);

  // Reset form values when loading states change - with comprehensive safeguards
  useEffect(() => {
    if (!isProjectCardLoading && !isLoading) {
      // Only reset if ALL conditions are met:
      // 1. Values have actually changed
      // 2. Form is not dirty (no user changes)
      // 3. Not currently submitting
      // 4. We have legitimate new data to populate (not empty formValues)
      // This prevents resetting user-entered data on page refresh or during user interaction
      
      const formIsDirty = formState.isDirty;
      const hasLegitimateData = Object.values(formValues).some(value => {
        if (typeof value === 'string') return value.length > 0;
        if (typeof value === 'object' && value !== null) {
          return 'value' in value ? String(value.value).length > 0 : false;
        }
        return value !== null && value !== undefined;
      });
      
      if (
        !_.isEqual(prevValues, formValues) &&
        !formIsDirty &&
        !formState.isSubmitting &&
        hasLegitimateData
      ) {
        setPrevValues(formValues);
        reset(formValues);
      }
    }
  }, [
    isProjectCardLoading,
    isLoading,
    formValues,
    reset,
    prevValues,
    formState.isDirty,
    formState.isSubmitting,
  ]);

  return {
    formMethods,
    classOptions,
    locationOptions,
    selectedMasterClassName,
  };
};

export default useProjectForm;
