import { IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../hooks/common';
import { listItemToOption } from '@/utils/common';
import { IPerson, IProject } from '@/interfaces/projectInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectProject } from '@/reducers/projectSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * project which can be needed to check for updates.
 *
 * @returns formValues, project
 */
const useProjectBasicsValues = () => {
  const project = useAppSelector(selectProject);

  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);

  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);
  const subDivisions = useAppSelector(selectSubDivisions);

  const { t } = useTranslation();
  const value = (value: string | undefined | null) => value || '';

  /**
   * There are three project classes, but only one id is saved. We create a list item of each class based on the id.
   */
  const getProjectClassFields = (project: IProject | null) => {
    const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
      id: projectClass?.id || '',
      value: projectClass?.name || '',
    });

    const selectedSubClass = project
      ? subClasses.find(({ id }) => id === project.projectClass)
      : undefined;

    const projectClassId = selectedSubClass?.parent || project?.projectClass;

    const selectedClass = projectClassId
      ? classes.find(({ id }) => id === projectClassId)
      : undefined;

    const masterClassId = selectedClass?.parent || project?.projectClass;

    const selectedMasterClass = masterClassId
      ? masterClasses.find(({ id }) => id === masterClassId)
      : undefined;

    return {
      masterClass: listItemToOption(classAsListItem(selectedMasterClass) || []),
      class: listItemToOption(classAsListItem(selectedClass) || []),
      subClass: listItemToOption(classAsListItem(selectedSubClass) || []),
    };
  };

  /**
   * There are three project locations, but only one id is saved. We create a list item of each location based on the id.
   */
  const getProjectLocationFields = (project: IProject | null) => {
    const locationAsListItem = (projectLocation: ILocation | undefined): IListItem => ({
      id: projectLocation?.id || '',
      value: projectLocation?.name || '',
    });

    const selectedSubDivision = project
      ? subDivisions.find(({ id }) => id === project.projectLocation)
      : undefined;

    const projectLocationId = selectedSubDivision?.parent || project?.projectLocation;

    const selectedDivision = projectLocationId
      ? divisions.find(({ id }) => id === projectLocationId)
      : undefined;

    const districtId = selectedDivision?.parent || project?.projectLocation;

    const selectedDistrict = districtId ? districts.find(({ id }) => id === districtId) : undefined;

    return {
      district: listItemToOption(locationAsListItem(selectedDistrict) || []),
      division: listItemToOption(locationAsListItem(selectedDivision) || []),
      subDivision: listItemToOption(locationAsListItem(selectedSubDivision) || []),
    };
  };

  const personToOption = (person?: IPerson): IOption => ({
    label: person ? `${person.firstName} ${person.lastName}` : '',
    value: person ? person.id : '',
  });

  const formValues: IProjectBasicsForm = useMemo(
    () => ({
      type: listItemToOption(project?.type, t),
      description: value(project?.description),
      area: listItemToOption(project?.area, t),
      hkrId: value(project?.hkrId),
      sapProject: value(project?.sapProject),
      sapNetwork: project?.sapNetwork || [],
      entityName: value(project?.entityName),
      hashTags: project?.hashTags || [],
      estPlanningStart: value(project?.estPlanningStart),
      estPlanningEnd: value(project?.estPlanningEnd),
      estConstructionStart: value(project?.estConstructionStart),
      estConstructionEnd: value(project?.estConstructionEnd),
      presenceStart: value(project?.presenceStart),
      presenceEnd: value(project?.presenceEnd),
      visibilityStart: value(project?.visibilityStart),
      visibilityEnd: value(project?.visibilityEnd),
      phase: listItemToOption(project?.phase, t),
      programmed: project?.programmed || false,
      constructionPhaseDetail: listItemToOption(project?.constructionPhaseDetail, t),
      louhi: project?.louhi || false,
      gravel: project?.gravel || false,
      category: listItemToOption(project?.category, t),
      effectHousing: project?.effectHousing || false,
      riskAssessment: listItemToOption(project?.riskAssessment, t),
      constructionEndYear: value(project?.constructionEndYear),
      planningStartYear: value(project?.planningStartYear),
      ...getProjectClassFields(project),
      ...getProjectLocationFields(project),
      projectWorkQuantity: project?.projectWorkQuantity,
      projectQualityLevel: listItemToOption(project?.projectQualityLevel, t),
      projectCostForecast: project?.projectCostForecast,
      planningCostForecast: value(project?.planningCostForecast),
      planningPhase: listItemToOption(project?.planningPhase, t),
      planningWorkQuantity: value(project?.planningWorkQuantity),
      constructionCostForecast: value(project?.constructionCostForecast),
      constructionPhase: listItemToOption(project?.constructionPhase, t),
      constructionWorkQuantity: value(project?.constructionWorkQuantity),
      budget: value(project?.budget),
      realizedCost: value(project?.realizedCost),
      comittedCost: value(project?.comittedCost),
      spentCost: value(project?.spentCost),
      budgetOverrunYear: value(project?.budgetOverrunYear),
      budgetOverrunAmount: value(project?.budgetOverrunAmount),
      responsibleZone: listItemToOption(project?.responsibleZone, t),
      masterPlanAreaNumber: value(project?.masterPlanAreaNumber),
      trafficPlanNumber: value(project?.trafficPlanNumber),
      bridgeNumber: value(project?.bridgeNumber),
      projectProgram: value(project?.projectProgram),
      personPlanning: personToOption(project?.personPlanning),
      personConstruction: personToOption(project?.personConstruction),
      personProgramming: personToOption(project?.personProgramming),
      otherPersons: value(project?.otherPersons),
    }),

    [project],
  );

  return { formValues, project };
};

/**
 * This hook initializes a react-hook-form control for a project basics form. It will keep the
 * form up to date with the selectedProject from redux and return all needed functions to handle
 * the form.
 *
 * @returns handleSubmit, reset, formFields, dirtyFields
 */
const useProjectBasicsForm = () => {
  const project = useAppSelector(selectProject);
  const { formValues } = useProjectBasicsValues();

  const formMethods = useForm<IProjectBasicsForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  // control,
  const { reset } = formMethods;

  const classOptions = useClassOptions(project?.projectClass);
  const locationOptions = useLocationOptions(project?.projectLocation, project?.projectClass);

  // Updates
  useEffect(() => {
    if (project) {
      reset(formValues);
    }
  }, [project]);

  // formFields,
  return { formMethods, classOptions, locationOptions };
};

export default useProjectBasicsForm;
