import useProjectBasicsForm from '@/forms/useProjectBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import {
  FormSectionTitle,
  ListField,
  NumberField,
  OverrunRightField,
  SelectField,
  TextField,
} from '../../shared';
import { selectProject, silentPatchProjectThunk } from '@/reducers/projectSlice';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { ProjectHashTags } from '../ProjectHashTags';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import { Fieldset } from 'hds-react/components/Fieldset';
import DateField from '@/components/shared/DateField';
import { useTranslation } from 'react-i18next';
import TextAreaField from '@/components/shared/TextAreaField';
import { useOptions } from '@/hooks/useOptions';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';
import './styles.css';

const ProjectBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { formMethods } = useProjectBasicsForm();
  const { t } = useTranslation();
  const projectId = useAppSelector(selectProject)?.id;
  const projectClass = useAppSelector(selectProject)?.projectClass;
  const projectLocation = useAppSelector(selectProject)?.projectLocation;

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    control,
  } = formMethods;

  const types = useOptions('types');
  const areas = useOptions('areas');
  const phases = useOptions('phases');
  const constructionPhaseDetails = useOptions('constructionPhaseDetails');
  const categories = useOptions('categories');
  const riskAssessments = useOptions('riskAssessments');
  const projectQualityLevels = useOptions('projectQualityLevels');
  const planningPhases = useOptions('planningPhases');
  const constructionPhases = useOptions('constructionPhases');
  const responsibleZones = useOptions('responsibleZones');
  const responsiblePersons = useOptions('responsiblePersons');
  const { masterClasses, classes, subClasses } = useClassOptions(projectClass);
  const { districts, divisions, subDivisions } = useLocationOptions(projectLocation);

  const onSubmit = useCallback(
    (form: IProjectBasicsForm) => {
      const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);
      projectId && dispatch(silentPatchProjectThunk({ id: projectId, data }));
    },
    [dirtyFields, projectId, dispatch],
  );

  return (
    <div className="basics-form">
      <form onBlur={isDirty ? (handleSubmit(onSubmit) as SubmitHandler<FieldValues>) : undefined}>
        <div className="basic-info-form">
          {/* SECTION 1 - BASIC INFO */}
          <FormSectionTitle name="basics" label="projectBasicsForm.basics" />
          <SelectField
            name="type"
            label="projectBasicsForm.type"
            rules={{ required: 'Hankkeen tyyppi on pakollinen tieto.' }}
            control={control}
            options={types}
          />
          <NumberField
            name="hkrId"
            label="projectBasicsForm.hkrId"
            control={control}
            rules={{
              maxLength: {
                value: '9223372036854775807'.length - 1,
                message: 'Maksimipituus on 18 numeroa',
              },
            }}
          />
          <TextField
            name="entityName"
            label="projectBasicsForm.entityName"
            rules={{ maxLength: { value: 30, message: 'Nimi voi olla enintään 30 merkkiä.' } }}
            control={control}
          />
          <TextField name="sapProject" label="projectBasicsForm.sapProject" control={control} />
          <TextField
            name="description"
            label="projectBasicsForm.description"
            control={control}
            rules={{ required: 'Kuvaus on pakollinen tieto.' }}
          />
          <ListField name="sapNetwork" label="projectBasicsForm.sapNetwork" readOnly={true} />
          <SelectField
            name="area"
            label="projectBasicsForm.area"
            control={control}
            options={areas}
          />
          <ProjectHashTags name="hashTags" label="projectBasicsForm.hashTags" control={control} />
          {/* SECTION 2 - STATUS */}
          <FormSectionTitle name="status" label="projectBasicsForm.status" />
          <SelectField
            name="phase"
            label="projectBasicsForm.phase"
            control={control}
            rules={{ required: 'Vaihe on pakollinen tieto.' }}
            options={phases}
          />
          <SelectField
            name="constructionPhaseDetail"
            label="projectBasicsForm.constructionPhaseDetail"
            control={control}
            options={constructionPhaseDetails}
          />
          <RadioCheckboxField
            name="programmed"
            label="projectBasicsForm.programmed"
            control={control}
          />
          <NumberField
            name="planningStartYear"
            label="projectBasicsForm.planningStartYear"
            control={control}
            rules={{
              min: {
                value: 0,
                message: 'Arvon on oltava suurempi tai yhtä suuri kuin 0',
              },
              max: {
                value: 3000,
                message: 'Arvon on oltava pienempi tai yhtä suuri kuin 3000',
              },
            }}
          />
          <NumberField
            name="constructionEndYear"
            label="projectBasicsForm.constructionEndYear"
            control={control}
            rules={{
              min: {
                value: 0,
                message: 'Arvon on oltava suurempi tai yhtä suuri kuin 0',
              },
              max: {
                value: 3000,
                message: 'Arvon on oltava pienempi tai yhtä suuri kuin 3000',
              },
            }}
          />
          <RadioCheckboxField name="louhi" label="projectBasicsForm.louhi" control={control} />
          <RadioCheckboxField name="gravel" label="projectBasicsForm.gravel" control={control} />
          <SelectField
            name="category"
            label="projectBasicsForm.category"
            control={control}
            options={categories}
          />
          <RadioCheckboxField
            name="effectHousing"
            label="projectBasicsForm.effectHousing"
            control={control}
          />
          <SelectField
            name="riskAssessment"
            label="projectBasicsForm.riskAssessment"
            control={control}
            options={riskAssessments}
          />
          {/* SECTION 3 - SCHEDULE */}
          <FormSectionTitle name="schedule" label="projectBasicsForm.schedule" />
          <Fieldset
            heading={t('projectBasicsForm.planning')}
            className="custom-fieldset"
            id="planning"
          >
            <DateField
              name="estPlanningStart"
              label="projectBasicsForm.estPlanningStart"
              control={control}
            />
            <DateField
              name="estPlanningEnd"
              label="projectBasicsForm.estPlanningEnd"
              control={control}
            />
            <DateField
              name="presenceStart"
              label="projectBasicsForm.presenceStart"
              control={control}
            />
            <DateField name="presenceEnd" label="projectBasicsForm.presenceEnd" control={control} />
            <DateField
              name="visibilityStart"
              label="projectBasicsForm.visibilityStart"
              control={control}
            />
            <DateField
              name="visibilityEnd"
              label="projectBasicsForm.visibilityEnd"
              control={control}
            />
          </Fieldset>
          <Fieldset
            heading={t('projectBasicsForm.construction')}
            className="custom-fieldset"
            id="construction"
          >
            <DateField
              name="estConstructionStart"
              label="projectBasicsForm.estConstructionStart"
              control={control}
            />
            <DateField
              name="estConstructionEnd"
              label="projectBasicsForm.estConstructionEnd"
              control={control}
            />
          </Fieldset>
          {/* SECTION 4 - FINANCIALS */}
          <FormSectionTitle name="financial" label="projectBasicsForm.financial" />
          <SelectField
            name="masterClass"
            label="projectBasicsForm.masterClass"
            control={control}
            options={masterClasses}
          />
          <SelectField
            name="class"
            label="projectBasicsForm.class"
            control={control}
            options={classes}
          />
          <SelectField
            name="subClass"
            label="projectBasicsForm.subClass"
            control={control}
            options={subClasses}
          />
          <NumberField
            name="projectCostForecast"
            label="projectBasicsForm.projectCostForecast"
            control={control}
            tooltip="keur"
          />
          <SelectField
            name="projectQualityLevel"
            label="projectBasicsForm.projectQualityLevel"
            control={control}
            hideLabel={true}
            options={projectQualityLevels}
          />
          <NumberField
            name="projectWorkQuantity"
            label="projectBasicsForm.projectWorkQuantity"
            control={control}
            tooltip="keur"
          />
          <NumberField
            name="planningCostForecast"
            label="projectBasicsForm.planningCostForecast"
            control={control}
            tooltip="keur"
          />
          <SelectField
            name="planningPhase"
            label="projectBasicsForm.planningPhase"
            control={control}
            hideLabel={true}
            options={planningPhases}
          />
          <NumberField
            name="planningWorkQuantity"
            label="projectBasicsForm.planningWorkQuantity"
            control={control}
            tooltip="keur"
          />
          <NumberField
            name="constructionCostForecast"
            label="projectBasicsForm.constructionCostForecast"
            control={control}
            tooltip="keur"
          />
          <SelectField
            name="constructionPhase"
            label="projectBasicsForm.constructionPhase"
            control={control}
            hideLabel={true}
            options={constructionPhases}
          />
          <NumberField
            name="constructionWorkQuantity"
            label="projectBasicsForm.constructionWorkQuantity"
            control={control}
            tooltip="keur"
          />
          <ListField
            name="realizedCostLabel"
            label="projectBasicsForm.realizedCostLabel"
            fields={[
              { name: 'budget', control: control, label: 'projectBasicsForm.budget' },
              {
                name: 'realizedCost',
                control: control,
                label: 'projectBasicsForm.realizedCost',
                readOnly: true,
              },
              {
                name: 'comittedCost',
                control: control,
                label: 'projectBasicsForm.comittedCost',
                readOnly: true,
              },
              {
                name: 'spentCost',
                control: control,
                label: 'projectBasicsForm.spentCost',
                readOnly: true,
              },
            ]}
          />
          <OverrunRightField control={control} />
          <ListField
            name="preliminaryBudgetDivision"
            label="projectBasicsForm.preliminaryBudgetDivision"
            readOnly={true}
          />
          {/* SECTION 5 - RESPONSIBLE PERSONS */}
          <FormSectionTitle
            name="responsiblePersons"
            label="projectBasicsForm.responsiblePersons"
          />
          <SelectField
            name="personPlanning"
            label="projectBasicsForm.personPlanning"
            control={control}
            icon="person"
            options={responsiblePersons}
          />
          <SelectField
            name="personConstruction"
            label="projectBasicsForm.personConstruction"
            control={control}
            icon="person"
            options={responsiblePersons}
          />
          <SelectField
            name="personProgramming"
            label="projectBasicsForm.personProgramming"
            control={control}
            icon="person"
            options={responsiblePersons}
          />
          <TextField name="otherPersons" label="projectBasicsForm.otherPersons" control={control} />
          {/* SECTION 6 - LOCATION */}
          <FormSectionTitle name="location" label="projectBasicsForm.location" />
          <SelectField
            name="responsibleZone"
            label="projectBasicsForm.responsibleZone"
            control={control}
            options={responsibleZones}
          />
          <SelectField
            name="district"
            label="projectBasicsForm.district"
            control={control}
            icon="location"
            options={districts}
          />
          <SelectField
            name="division"
            label="projectBasicsForm.division"
            control={control}
            icon="location"
            options={divisions}
          />
          <SelectField
            name="subDivision"
            label="projectBasicsForm.subDivision"
            control={control}
            icon="location"
            options={subDivisions}
          />
          <TextField
            name="masterPlanAreaNumber"
            label="projectBasicsForm.masterPlanAreaNumber"
            control={control}
          />
          <TextField
            name="trafficPlanNumber"
            label="projectBasicsForm.trafficPlanNumber"
            control={control}
          />
          <TextField name="bridgeNumber" label="projectBasicsForm.bridgeNumber" control={control} />
          {/* SECTION 7 - PROJECT PROGRAM */}
          <FormSectionTitle
            name="projectProgramTitle"
            label="projectBasicsForm.projectProgramTitle"
          />
          <TextAreaField
            name="projectProgram"
            label="projectBasicsForm.projectProgram"
            control={control}
          />
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectBasicsForm);
