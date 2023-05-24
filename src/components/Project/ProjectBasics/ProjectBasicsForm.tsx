import useProjectBasicsForm from '@/forms/useProjectBasicsForm';
import { useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback, useState } from 'react';
import {
  FormSectionTitle,
  ListField,
  NumberField,
  OverrunRightField,
  SelectField,
  TextField,
} from '../../shared';
import { selectProject } from '@/reducers/projectSlice';
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
import { patchProject } from '@/services/projectServices';
import { isBefore } from '@/utils/dates';
import './styles.css';
import { IOption } from '@/interfaces/common';

const ProjectBasicsForm: FC = () => {
  const { formMethods, classOptions, locationOptions } = useProjectBasicsForm();
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const [formSaved, setFormSaved] = useState(false);

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    control,
    getValues,
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
  const responsiblePersons = useOptions('responsiblePersons', true);
  const { masterClasses, classes, subClasses } = classOptions;
  const { districts, divisions, subDivisions } = locationOptions;

  const handleSetFormSaved = useCallback((value: boolean) => {
    setFormSaved(value);
  }, []);

  const onSubmit = useCallback(
    async (form: IProjectBasicsForm) => {
      if (!project?.id) {
        return;
      }
      const data: IProjectRequest = dirtyFieldsToRequestObject(
        dirtyFields,
        form as IAppForms,
        phases,
      );

      await patchProject({ id: project.id, data })
        .then(() => {
          handleSetFormSaved(true);
          setTimeout(() => {
            handleSetFormSaved(false);
          }, 0);
        })
        .catch(Promise.reject);
    },
    [project?.id, dirtyFields, phases, handleSetFormSaved],
  );

  const formProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `projectBasicsForm.${name}`,
        control: control,
      };
    },
    [control],
  );

  const validateBeforeEndDate = useCallback(
    (startLabel: string, endLabel: string, compareKey: string) => {
      return {
        validate: {
          isBeforeEndDate: (startDate: string | null) =>
            isBefore(startDate, getValues(compareKey as keyof IProjectBasicsForm) as string)
              ? true
              : t('isBefore', { start: startLabel, end: t(endLabel) }),
        },
      };
    },
    [getValues],
  );

  const validatePhase = useCallback(() => {
    const programmedPhase = phases[2].value;

    return {
      required: t('required', { value: 'Vaihe' }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          const phaseToSubmit = phase.value;
          if (
            phaseToSubmit === programmedPhase &&
            !getValues('planningStartYear') &&
            !getValues('constructionEndYear')
          ) {
            return "Suunnittelun aloitusvuosi ja rakentamisen päättymisvuosi on täytettävä kun hankkeen vaihe on 'Ohjelmointi'";
          }
          return true;
        },
      },
    };
  }, [getValues, phases]);

  return (
    <div className="basic-form-container" data-testid="project-basics-form">
      <form onBlur={isDirty ? (handleSubmit(onSubmit) as SubmitHandler<FieldValues>) : undefined}>
        <div className="basic-info-form">
          {/* SECTION 1 - BASIC INFO */}
          <FormSectionTitle {...formProps('basics')} />
          <SelectField
            {...formProps('type')}
            options={types}
            rules={{ required: t('required', { value: 'Hankkeen tyyppi' }) ?? '' }}
          />
          <NumberField
            {...formProps('hkrId')}
            rules={{ maxLength: { value: 18, message: t('maxLength', { value: '18' }) } }}
          />
          <TextField
            {...formProps('entityName')}
            rules={{ maxLength: { value: 30, message: t('maxLength', { value: '30' }) } }}
          />
          <TextField {...formProps('sapProject')} control={control} />
          <TextField {...formProps('sapNetwork')} readOnly={true} />
          <SelectField {...formProps('area')} options={areas} />
          <TextAreaField
            {...formProps('description')}
            size="l"
            rules={{ required: t('required', { value: 'Kuvaus' }) ?? '' }}
            formSaved={formSaved}
          />
          <ProjectHashTags
            name="hashTags"
            label={'projectBasicsForm.hashTags'}
            control={control}
            project={project}
          />
          {/* SECTION 2 - STATUS */}
          <FormSectionTitle {...formProps('status')} />
          <SelectField {...formProps('phase')} rules={validatePhase()} options={phases} />
          <SelectField
            {...formProps('constructionPhaseDetail')}
            options={constructionPhaseDetails}
            disabled={getValues('phase').value !== phases[7].value}
          />
          <RadioCheckboxField {...formProps('programmed')} />
          <NumberField
            {...formProps('planningStartYear')}
            rules={{
              min: {
                value: 0,
                message: t('minValue', { value: '0' }),
              },
              max: {
                value: 3000,
                message: t('maxValue', { value: '3000' }),
              },
            }}
          />
          <NumberField
            {...formProps('constructionEndYear')}
            rules={{
              min: {
                value: 0,
                message: t('minValue', { value: '0' }),
              },
              max: {
                value: 3000,
                message: t('maxValue', { value: '3000' }),
              },
            }}
          />
          <RadioCheckboxField {...formProps('louhi')} />
          <RadioCheckboxField {...formProps('gravel')} />
          <SelectField {...formProps('category')} options={categories} />
          <RadioCheckboxField {...formProps('effectHousing')} />
          <SelectField {...formProps('riskAssessment')} options={riskAssessments} />
          {/* SECTION 3 - SCHEDULE */}
          <FormSectionTitle {...formProps('schedule')} />
          <Fieldset
            heading={t('projectBasicsForm.planning')}
            className="custom-fieldset"
            id="planning"
          >
            <DateField
              {...formProps('estPlanningStart')}
              rules={validateBeforeEndDate(
                'Suunnittelun aloitus',
                'suunnittelun päättymistä',
                'estPlanningEnd',
              )}
            />
            <DateField {...formProps('estPlanningEnd')} />
            <DateField {...formProps('presenceStart')} />
            <DateField {...formProps('presenceEnd')} />
            <DateField {...formProps('visibilityStart')} />
            <DateField {...formProps('visibilityEnd')} />
          </Fieldset>
          <Fieldset
            heading={t('projectBasicsForm.construction')}
            className="custom-fieldset"
            id="construction"
          >
            <DateField
              {...formProps('estConstructionStart')}
              rules={validateBeforeEndDate(
                'Rakentaminen alkaa',
                'rakentaminen päättyy',
                'estConstructionEnd',
              )}
            />
            <DateField {...formProps('estConstructionEnd')} />
          </Fieldset>
          {/* SECTION 4 - FINANCIALS */}
          <FormSectionTitle {...formProps('financial')} />
          <SelectField {...formProps('masterClass')} options={masterClasses} />
          <SelectField {...formProps('class')} options={classes} />
          <SelectField {...formProps('subClass')} options={subClasses} />
          <NumberField {...formProps('projectCostForecast')} tooltip="keur" />
          <SelectField
            {...formProps('projectQualityLevel')}
            hideLabel={true}
            options={projectQualityLevels}
          />
          <NumberField {...formProps('projectWorkQuantity')} tooltip="keur" />
          <NumberField {...formProps('planningCostForecast')} tooltip="keur" />
          <SelectField {...formProps('planningPhase')} hideLabel={true} options={planningPhases} />
          <NumberField {...formProps('planningWorkQuantity')} tooltip="keur" />
          <NumberField {...formProps('constructionCostForecast')} tooltip="keur" />
          <SelectField
            {...formProps('constructionPhase')}
            hideLabel={true}
            options={constructionPhases}
          />
          <NumberField {...formProps('constructionWorkQuantity')} tooltip="keur" />
          <ListField
            {...formProps('realizedCostLabel')}
            fields={[
              { ...formProps('costForecast') },
              {
                ...formProps('realizedCost'),
                readOnly: true,
              },
              {
                ...formProps('comittedCost'),
                readOnly: true,
              },
              {
                ...formProps('spentCost'),
                readOnly: true,
              },
            ]}
          />
          <OverrunRightField control={control} />
          <ListField {...formProps('preliminaryBudgetDivision')} readOnly={true} />
          {/* SECTION 5 - RESPONSIBLE PERSONS */}
          <FormSectionTitle {...formProps('responsiblePersons')} />
          <SelectField
            {...formProps('personPlanning')}
            icon="person"
            options={responsiblePersons}
          />
          <SelectField
            {...formProps('personConstruction')}
            icon="person"
            options={responsiblePersons}
          />
          <SelectField
            {...formProps('personProgramming')}
            icon="person"
            options={responsiblePersons}
          />

          <TextField {...formProps('otherPersons')} />
          {/* SECTION 6 - LOCATION */}
          <FormSectionTitle {...formProps('location')} />
          <SelectField
            {...formProps('responsibleZone')}
            options={responsibleZones}
            rules={{ required: t('required', { value: 'Alueen vastuujaon mukaan' }) ?? '' }}
          />
          <SelectField {...formProps('district')} icon="location" options={districts} />
          <SelectField {...formProps('division')} icon="location" options={divisions} />
          <SelectField {...formProps('subDivision')} icon="location" options={subDivisions} />
          <TextField {...formProps('masterPlanAreaNumber')} />
          <TextField {...formProps('trafficPlanNumber')} />
          <TextField {...formProps('bridgeNumber')} />
          {/* SECTION 7 - PROJECT PROGRAM */}
          <FormSectionTitle {...formProps('projectProgramTitle')} />
          <TextAreaField {...formProps('projectProgram')} />
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectBasicsForm);
