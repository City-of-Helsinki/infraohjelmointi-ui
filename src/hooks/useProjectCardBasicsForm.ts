import { FormField, HookFormControlType, IForm } from '@/interfaces/formInterfaces';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAppSelector } from './common';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import _ from 'lodash';

/**
 * Creates form fields for the project card, in order for the labels to work the 'fi.json'-translations need
 * to have the same name as the field name.
 *
 * @param control react-hook-form control to add to the fields
 * @returns IProjectCard
 */
const buildProjectCardBasicsFormFields = (
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

  const projectCardBasicsFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`projectCardBasicsForm.${formField.name}`),
    fieldSet: formField.fieldSet?.map((fieldSetField) => ({
      ...fieldSetField,
      control,
      label: translate(`projectCardBasicsForm.${fieldSetField.name}`),
    })),
  }));

  return projectCardBasicsFormFields;
};

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * projectCard which can be needed to check for updates.
 *
 * @returns formValues, projectCard
 */
const useProjectCardBasicsValues = () => {
  const projectCard = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard,
    _.isEqual,
  );
  const { t } = useTranslation();

  const formValues: IProjectCardBasicsForm = useMemo(
    () => ({
      type: listItemToOption(projectCard?.type, t),
      description: projectCard?.description || '',
      area: listItemToOption(projectCard?.area, t),
      hkrId: projectCard?.hkrId || '',
      sapProject: projectCard?.sapProject || '',
      sapNetwork: projectCard?.sapNetwork || [],
      entityName: projectCard?.entityName || '',
      hashTags: projectCard?.hashTags || [],
      estPlanningStart: projectCard?.estPlanningStart || '',
      estPlanningEnd: projectCard?.estPlanningEnd || '',
      estConstructionStart: projectCard?.estConstructionStart || '',
      estConstructionEnd: projectCard?.estConstructionEnd || '',
      presenceStart: projectCard?.presenceStart || '',
      presenceEnd: projectCard?.presenceEnd || '',
      visibilityStart: projectCard?.visibilityStart || '',
      visibilityEnd: projectCard?.visibilityEnd || '',
      phase: listItemToOption(projectCard?.phase, t),
      programmed: projectCard?.programmed || false,
      constructionPhaseDetail: listItemToOption(projectCard?.constructionPhaseDetail, t),
      louhi: projectCard?.louhi || false,
      gravel: projectCard?.gravel || false,
      category: listItemToOption(projectCard?.category, t),
      projectWorkQuantity: projectCard?.projectWorkQuantity,
      projectQualityLevel: listItemToOption(projectCard?.projectQualityLevel, t),
      projectCostForecast: projectCard?.projectCostForecast,
      planningCostForecast: projectCard?.planningCostForecast || '',
      planningPhase: listItemToOption(projectCard?.planningPhase, t),
      planningWorkQuantity: projectCard?.planningWorkQuantity || '',
      constructionCostForecast: projectCard?.constructionCostForecast || '',
      constructionPhase: listItemToOption(projectCard?.constructionPhase, t),
      constructionWorkQuantity: projectCard?.constructionWorkQuantity || '',
      budget: projectCard?.budget || '',
      realizedCost: projectCard?.realizedCost || '',
      comittedCost: projectCard?.comittedCost || '',
      spentCost: projectCard?.spentCost || '',
      budgetOverrunYear: projectCard?.budgetOverrunYear || '',
      budgetOverrunAmount: projectCard?.budgetOverrunAmount || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectCard],
  );

  return { formValues, projectCard };
};

/**
 * This hook initializes a react-hook-form control for a project card basics form. It will keep the
 * form up to date with the selectedProjectCard from redux and return all needed functions to handle
 * the form.
 *
 * It will also return formFields, which can be passed to the FormFieldCreator component to generate
 * the visual form.
 *
 * @returns handleSubmit, reset, formFields, dirtyFields
 */
const useProjectCardBasicsForm = () => {
  const { t } = useTranslation();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const { formValues } = useProjectCardBasicsValues();

  const formMethods = useForm<IProjectCardBasicsForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control, reset } = formMethods;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formFields = useMemo(() => buildProjectCardBasicsFormFields(control, t), [control]);

  // Updates
  useEffect(() => {
    if (projectCard) {
      reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCard, formValues]);

  return { formFields, formMethods };
};

export default useProjectCardBasicsForm;
