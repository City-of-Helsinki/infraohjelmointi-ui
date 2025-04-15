import { IProjectForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../hooks/common';
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
import { selectProjectDistricts, selectProjectDivisions, selectProjectSubDivisions } from '@/reducers/listsSlice';
import _ from 'lodash';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { notifyInfo } from '@/reducers/notificationSlice';
import { selectIsProjectCardLoading } from '@/reducers/loaderSlice';

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
  const getProjectClassFields = (project: IProject | null) => {
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
  };

  const getSelectedLocation = (locationList: IListItem[], parentId?: string, locationId?: string) => {
    return locationList.find(({ id }) => id === parentId) ?? locationList.find(({ id }) => id === locationId);
  };

  /**
   * There are three project locations, but only one id is saved. We create a list item of each location based on the id.
   */
  const getProjectLocationFields = (project: IProject | null) => {
    const locationAsListItem = (projectLocation: IListItem | undefined): IListItem => ({
      id: projectLocation?.id ?? '',
      value: projectLocation?.value ?? '',
    });

    const selectedSubDivision = getSelectedLocation(subDivisions, project?.projectDistrict);

    const selectedDivision = getSelectedLocation(divisions, selectedSubDivision?.parent, project?.projectDistrict);

    const selectedDistrict = getSelectedLocation(districts, selectedDivision?.parent, project?.projectDistrict);

    return {
      district: listItemToOption(locationAsListItem(selectedDistrict) ?? []),
      division: listItemToOption(locationAsListItem(selectedDivision) ?? []),
      subDivision: listItemToOption(locationAsListItem(selectedSubDivision) ?? []),
    };
  };

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
      projectWorkQuantity: project?.projectWorkQuantity,
      projectQualityLevel: listItemToOption(project?.projectQualityLevel),
      projectCostForecast: project?.projectCostForecast,
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
      budgetOverrunYear: value(project?.budgetOverrunYear),
      budgetOverrunAmount: value(project?.budgetOverrunAmount),
      responsibleZone: listItemToOption(project?.responsibleZone),
      masterPlanAreaNumber: value(project?.masterPlanAreaNumber),
      trafficPlanNumber: value(project?.trafficPlanNumber),
      bridgeNumber: value(project?.bridgeNumber),
      projectProgram: value(project?.projectProgram),
      personPlanning: personToOption(project?.personPlanning),
      personConstruction: personToOption(project?.personConstruction),
      personProgramming: personToOption(project?.personProgramming),
      otherPersons: value(project?.otherPersons),
    }),

    [project, classes, subClasses, masterClasses, districts, divisions, subDivisions ],
  );

  return { formValues, project, classes, subClasses, masterClasses, districts, divisions, subDivisions };
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
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });
  const isProjectCardLoading = useAppSelector(selectIsProjectCardLoading);

  const [selections, setSelections] = useState({ selectedClass: project?.projectClass, selectedLocation: project?.projectDistrict });

  // control,
  const { reset, watch, setValue, getValues, formState } = formMethods;

  const selectedMasterClassName = formValues.masterClass.label;

  const classOptions = useClassOptions(selections?.selectedClass);

  const locationOptions = useLocationOptions(
    selections?.selectedLocation,
  );

  // Set the selected class and empty the other selected classes if a parent class is selected
  const setSelectedClass = (name: string, form: IProjectForm) => {
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
  };

  const setLocationSubClass = (name: string) => {
    const newSubClass = classOptions.subClasses.find(({label}) => label.includes(name));
    if (newSubClass) {
      setValue('subClass', newSubClass);
      setSelections((current) => ({
        ...current,
        selectedClass: newSubClass.value,
      }));
    }
  }

  // Set the selected location and empty the other locations if a parent location is selected
  const setSelectedLocation = (name: string, form: IProjectForm) => {
    const optionValue = (form[name as unknown as keyof IProjectForm] as IOption)?.value;

    if (name === 'district') {
      setValue('division', { label: '', value: '' });
      if (["suurpiiri", "östersundom"].some(substring => formValues.subClass.label.includes(substring))) {
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
    }
  };

  // Listent to changes in the form value and set selected class or location if those properties are changed
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
  }, [watch, setValue]);

  const dispatch = useAppDispatch();
  // Updates form with the selectedProject from redux
  useEffect(() => {
    const currentState = getValues();
    const inComingState = formValues;
    const isSubmitting = formState.isSubmitting;
    const sameValuesInStates = _.isEqual(currentState, inComingState);
    const projectUpdateMatchesCurrentProject = project?.id === projectUpdate?.project.id;
    /*
      Finance-update and project-update cause problems to the project form. If the budgets of some project are updated
      in the programming view and some user has a project form open, the values of the form will always be updated and for
      that reason we need to check if the project in projectUpdate is the same as the one that is opened and for the notification
      to work properly it's necessary to check the states also.

      The 'new' mode must be checked also, otherwise the project creation doesn't seem to go through in the UI even though it does.
    */
    if ((projectMode === 'edit' && projectUpdateMatchesCurrentProject && !sameValuesInStates) || (selectedProject !== null && projectMode === 'new')) {
      reset(formValues);
      if (projectMode === 'edit' && !isSubmitting) {
        dispatch(notifyInfo({ title: 'update', message: 'projectUpdated', type: 'toast', duration: 3500 }));
      }
    }
    /*
      Only these dependencies should be here, otherwise when project is in the edit mode and someone is editing the budgets,
      the if sentence's conditions' states come "one step behind" and for that reason the form values are sometimes
      emptied when the budgets of some other project are changed.
    */
  }, [project, projectUpdate]);

  useEffect(() => {
    if (!isProjectCardLoading) {
      reset(formValues);
    }
  }, [isProjectCardLoading]);

  return { formMethods, classOptions, locationOptions, selectedMasterClassName };
};

export default useProjectForm;
