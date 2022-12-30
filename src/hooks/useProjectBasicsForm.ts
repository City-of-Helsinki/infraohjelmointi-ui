import { FormField, HookFormControlType, IForm } from '@/interfaces/formInterfaces';
import { IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAppSelector } from './common';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import _ from 'lodash';

/**
 * Creates form fields for the project, in order for the labels to work the 'fi.json'-translations need
 * to have the same name as the field name.
 *
 * @param control react-hook-form control to add to the fields
 * @returns IProject
 */
const buildProjectBasicsFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    // Basic info
    {
      name: 'basics',
      type: FormField.Title,
    },
    {
      name: 'type',
      rules: { required: 'Hankkeen tyyppi on pakollinen tieto.' },
      type: FormField.Select,
    },
    {
      name: 'hkrId',
      rules: {
        maxLength: {
          value: '9223372036854775807'.length - 1,
          message: 'Maksimipituus on 18 numeroa',
        },
      },
      type: FormField.Number,
    },
    {
      name: 'entityName',
      type: FormField.Text,
      rules: { maxLength: { value: 30, message: 'Nimi voi olla enintään 30 merkkiä.' } },
    },
    {
      name: 'sapProject',
      type: FormField.Text,
    },
    {
      name: 'description',
      rules: { required: 'Kuvaus on pakollinen tieto.' },
      type: FormField.Text,
    },
    {
      name: 'sapNetwork',
      type: FormField.ListField,
      readOnly: true,
    },
    {
      name: 'area',
      type: FormField.Select,
    },
    {
      name: 'hashTags',
      type: FormField.TagsForm,
    },
    // Status
    {
      name: 'status',
      type: FormField.Title,
    },
    {
      name: 'phase',
      type: FormField.Select,
      rules: { required: 'Vaihe on pakollinen tieto.' },
    },
    {
      name: 'constructionPhaseDetail',
      type: FormField.Select,
    },
    {
      name: 'programmed',
      type: FormField.RadioCheckbox,
    },
    {
      name: 'planningStartYear',
      type: FormField.Number,
      rules: {
        min: {
          value: 0,
          message: 'Arvon on oltava suurempi tai yhtä suuri kuin 0',
        },
        max: {
          value: 3000,
          message: 'Arvon on oltava pienempi tai yhtä suuri kuin 3000',
        },
      },
    },
    {
      name: 'constructionEndYear',
      type: FormField.Number,
      rules: {
        min: {
          value: 0,
          message: 'Arvon on oltava suurempi tai yhtä suuri kuin 0',
        },
        max: {
          value: 3000,
          message: 'Arvon on oltava pienempi tai yhtä suuri kuin 3000',
        },
      },
    },
    {
      name: 'louhi',
      type: FormField.RadioCheckbox,
    },
    {
      name: 'gravel',
      type: FormField.RadioCheckbox,
    },
    {
      name: 'category',
      type: FormField.Select,
    },
    {
      name: 'effectHousing',
      type: FormField.RadioCheckbox,
    },
    {
      name: 'riskAssessment',
      type: FormField.Select,
    },
    // Schedule
    {
      name: 'schedule',
      type: FormField.Title,
    },
    {
      name: 'planning',
      type: FormField.FieldSet,
      fieldSet: [
        { name: 'estPlanningStart', type: FormField.Date },
        { name: 'estPlanningEnd', type: FormField.Date },
        { name: 'presenceStart', type: FormField.Date },
        { name: 'presenceEnd', type: FormField.Date },
        { name: 'visibilityStart', type: FormField.Date },
        { name: 'visibilityEnd', type: FormField.Date },
      ],
    },
    {
      name: 'construction',
      type: FormField.FieldSet,
      fieldSet: [
        { name: 'estConstructionStart', type: FormField.Date },
        { name: 'estConstructionEnd', type: FormField.Date },
      ],
    },
    { name: 'financial', type: FormField.Title },
    { name: 'masterClass', type: FormField.Select },
    { name: 'class', type: FormField.Select },
    { name: 'subClass', type: FormField.Select },
    { name: 'projectCostForecast', type: FormField.Number, tooltip: 'keur' },
    { name: 'projectQualityLevel', type: FormField.Select, hideLabel: true },
    { name: 'projectWorkQuantity', type: FormField.Number, tooltip: 'm²' },
    { name: 'planningCostForecast', type: FormField.Number, tooltip: 'keur' },
    { name: 'planningPhase', type: FormField.Select, hideLabel: true },
    { name: 'planningWorkQuantity', type: FormField.Number, tooltip: 'm²' },
    { name: 'constructionCostForecast', type: FormField.Number, tooltip: 'keur' },
    { name: 'constructionPhase', type: FormField.Select, hideLabel: true },
    { name: 'constructionWorkQuantity', type: FormField.Number, tooltip: 'm²' },
    {
      name: 'realizedCostLabel',
      type: FormField.ListField,
      fieldSet: [
        { name: 'budget', type: FormField.Number },
        { name: 'realizedCost', type: FormField.Number, readOnly: true },
        { name: 'comittedCost', type: FormField.Number, readOnly: true },
        { name: 'spentCost', type: FormField.Number, readOnly: true },
      ],
    },
    {
      name: 'overrunRight',
      type: FormField.OverrunRight,
      fieldSet: [
        { name: 'budgetOverrunYear', type: FormField.Number, hideLabel: true },
        { name: 'budgetOverrunAmount', type: FormField.Number, hideLabel: true },
      ],
    },
    { name: 'preliminaryBudgetDivision', type: FormField.ListField, readOnly: true },
  ];

  const projectBasicsFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`projectBasicsForm.${formField.name}`),
    fieldSet: formField.fieldSet?.map((fieldSetField) => ({
      ...fieldSetField,
      control,
      label: translate(`projectBasicsForm.${fieldSetField.name}`),
    })),
  }));

  return projectBasicsFormFields;
};

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * project which can be needed to check for updates.
 *
 * @returns formValues, project
 */
const useProjectBasicsValues = () => {
  const project = useAppSelector((state: RootState) => state.project.selectedProject, _.isEqual);
  const { t } = useTranslation();
  const value = (value: string | undefined) => value || '';

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project],
  );

  return { formValues, project };
};

/**
 * This hook initializes a react-hook-form control for a project basics form. It will keep the
 * form up to date with the selectedProject from redux and return all needed functions to handle
 * the form.
 *
 * It will also return formFields, which can be passed to the FormFieldCreator component to generate
 * the visual form.
 *
 * @returns handleSubmit, reset, formFields, dirtyFields
 */
const useProjectBasicsForm = () => {
  const { t } = useTranslation();
  const project = useAppSelector((state: RootState) => state.project.selectedProject);
  const { formValues } = useProjectBasicsValues();

  const formMethods = useForm<IProjectBasicsForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control, reset } = formMethods;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formFields = useMemo(() => buildProjectBasicsFormFields(control, t), [control]);

  // Updates
  useEffect(() => {
    if (project) {
      reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, formValues]);

  return { formFields, formMethods };
};

export default useProjectBasicsForm;
