import useProjectBasicsForm from '@/forms/useProjectBasicsForm';
import { useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback, useMemo, useState } from 'react';
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
import './styles.css';
import { IOption } from '@/interfaces/common';
import _ from 'lodash';
import { getToday, isBefore } from '@/utils/dates';

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

  const proposalPhase = phases[0].value;
  const designPhase = phases[1].value;
  const programmedPhase = phases[2].value;
  const draftInitiationPhase = phases[3].value;
  const draftApprovalPhase = phases[4].value;
  const constructionPlanPhase = phases[5].value;
  const constructionWaitPhase = phases[6].value;
  const constructionPhase = phases[7].value;
  const warrantyPeriodPhase = phases[8].value;
  const completedPhase = phases[9].value;

  const handleSetFormSaved = useCallback((value: boolean) => {
    setFormSaved(value);
  }, []);

  const onSubmit = useCallback(
    async (form: IProjectBasicsForm) => {
      if (isDirty) {
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
      }
    },
    [isDirty, project?.id, dirtyFields, phases, handleSetFormSaved],
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

  const getErrorMessageIfMissingFields = useCallback(
    (fields: Array<string>) => {
      const missingFields = fields
        .filter((f) => {
          if (_.has(getValues(f as keyof IProjectBasicsForm), 'value')) {
            return !(getValues(f as keyof IProjectBasicsForm) as IOption).value;
          } else {
            return !getValues(f as keyof IProjectBasicsForm);
          }
        })
        .map((f) => t(`validation.${f}`))
        .join(', ');

      return missingFields.length > 0 ? `Täytä kentät: ${missingFields}` : true;
    },
    [getValues, t],
  );

  const numberMax3000 = useMemo(
    () => ({
      min: {
        value: 0,
        message: t('minValue', { value: '0' }),
      },
      max: {
        value: 3000,
        message: t('maxValue', { value: '3000' }),
      },
    }),
    [t],
  );

  const isFieldDirty = useCallback(
    (field: string) => {
      if (_.has(dirtyFields, field)) {
        return dirtyFields[field as keyof IProjectBasicsForm];
      }
    },
    [dirtyFields],
  );

  const validatePhase = useCallback(() => {
    return {
      required: t('required', { value: 'Vaihe' }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          const phaseToSubmit = phase.value;
          switch (phaseToSubmit) {
            case programmedPhase:
              return getErrorMessageIfMissingFields(['planningStartYear', 'constructionEndYear']);
            case draftInitiationPhase:
            case draftApprovalPhase:
            case constructionPlanPhase:
            case constructionWaitPhase:
              return getErrorMessageIfMissingFields([
                'estPlanningStart',
                'estPlanningEnd',
                'planningStartYear',
                'constructionEndYear',
              ]);
            case constructionPhase:
            case warrantyPeriodPhase:
            case completedPhase:
              if (
                (phase.value === warrantyPeriodPhase || phase.value === completedPhase) &&
                isBefore(getToday(), getValues('estConstructionEnd'))
              ) {
                return "Hankkeen vaihe ei voi olla 'Takuuaika' jos nykyinen päivä on ennen rakentamisen päättymispäivää";
              }
              return getErrorMessageIfMissingFields([
                'estPlanningStart',
                'estPlanningEnd',
                'planningStartYear',
                'constructionEndYear',
                'estConstructionStart',
                'estConstructionEnd',
                'personConstruction',
                'constructionPhaseDetail',
              ]);
            default:
              return true;
          }
        },
      },
    };
  }, [
    completedPhase,
    constructionPhase,
    constructionPlanPhase,
    constructionWaitPhase,
    draftApprovalPhase,
    draftInitiationPhase,
    getErrorMessageIfMissingFields,
    getValues,
    programmedPhase,
    t,
    warrantyPeriodPhase,
  ]);

  const validatePlanningStartYear = useCallback(() => {
    return {
      ...numberMax3000,
      validate: {
        isBeforeEndDate: (startYear: string | null) => {
          const endYear = getValues('constructionEndYear');
          if (isFieldDirty('planningStartYear')) {
            if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
              return t('isBefore', {
                start: t('validation.planningStartYear'),
                end: t('validation.constructionEndYear'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [numberMax3000, getValues, isFieldDirty, t]);

  const validateConstructionEndYear = useCallback(() => {
    return {
      ...numberMax3000,
      validate: {
        isAfterStartDate: (endYear: string | null) => {
          const startYear = getValues('planningStartYear');
          if (
            endYear &&
            startYear &&
            parseInt(endYear) < parseInt(startYear) &&
            isFieldDirty('constructionEndYear')
          ) {
            return t('isAfter', {
              end: t('validation.constructionEndYear'),
              start: t('validation.planningStartYear'),
            });
          } else {
            return true;
          }
        },
      },
    };
  }, [getValues, isFieldDirty, numberMax3000, t]);

  const validateProgrammed = useCallback(() => {
    return {
      validate: {
        isProgrammedValid: (programmed: boolean) => {
          const phase = getValues('phase');
          if (phase.value === proposalPhase || phase.value === designPhase) {
            return programmed
              ? `Ohjelmoitu oltava 'Kyllä' kun hankkeen vaihe on '${phase.label}'`
              : true;
          } else {
            return programmed
              ? true
              : `Ohjelmoitu on oltava 'Ei' kun hankkeen vaihe on '${phase.label}'`;
          }
        },
      },
    };
  }, [designPhase, getValues, proposalPhase]);

  const phasesThatNeedPlanning = [
    draftInitiationPhase,
    draftApprovalPhase,
    constructionPlanPhase,
    constructionWaitPhase,
    constructionPhase,
    warrantyPeriodPhase,
    completedPhase,
  ];

  const validateEstPlanningStart = useCallback(() => {
    return {
      validate: {
        isRequired: (startDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedPlanning.includes(phase) && !startDate) {
            return t('requiredFor', {
              requiredField: t('validation.estPlanningStart'),
              field: t('validation.phase'),
              value: getValues('phase').label,
            });
          }
          return true;
        },
        isBeforeEndDate: (startDate: string | null) => {
          if (isFieldDirty('estPlanningStart')) {
            if (!isBefore(startDate, getValues('estPlanningEnd'))) {
              return t('isBefore', {
                start: t('validation.estPlanningStart'),
                end: t('validation.estPlanningEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const validateEstPlanningEnd = useCallback(() => {
    return {
      validate: {
        isRequired: (endDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedPlanning.includes(phase) && !endDate) {
            return t('requiredFor', {
              requiredField: t('validation.estPlanningEnd'),
              field: t('validation.phase'),
              value: getValues('phase').label,
            });
          }
          return true;
        },
        isAfterStartDate: (endDate: string | null) => {
          if (isFieldDirty('estPlanningEnd')) {
            if (!isBefore(getValues('estPlanningStart'), endDate)) {
              return t('isAfter', {
                start: t('validation.estPlanningStart'),
                end: t('validation.estPlanningEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const phasesThatNeedConstruction = [constructionPhase, warrantyPeriodPhase, completedPhase];

  const validateEstConstructionStart = useCallback(() => {
    return {
      validate: {
        isRequired: (startDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedConstruction.includes(phase) && !startDate) {
            return t('requiredFor', {
              requiredField: t('validation.estConstructionStart'),
              field: t('validation.phase'),
              value: getValues('phase').label,
            });
          }
          return true;
        },
        isBeforeEndDate: (startDate: string | null) => {
          if (isFieldDirty('estConstructionStart')) {
            if (!isBefore(startDate, getValues('estConstructionEnd'))) {
              return t('isBefore', {
                start: t('validation.estConstructionStart'),
                end: t('validation.estConstructionEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const validateEstConstructionEnd = useCallback(() => {
    return {
      validate: {
        isRequired: (endDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedConstruction.includes(phase) && !endDate) {
            return t('requiredFor', {
              requiredField: t('validation.estConstructionEnd'),
              field: t('validation.phase'),
              value: getValues('phase').label,
            });
          }
          return true;
        },
        isAfterStartDate: (endDate: string | null) => {
          if (isFieldDirty('estConstructionEnd')) {
            if (!isBefore(getValues('estConstructionStart'), endDate)) {
              return t('isAfter', {
                start: t('validation.estConstructionStart'),
                end: t('validation.estConstructionEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  return (
    <div className="basic-form-container" data-testid="project-basics-form">
      <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
        <div className="basic-info-form">
          {/* SECTION 1 - BASIC INFO */}
          <FormSectionTitle {...formProps('basics')} />
          <SelectField
            {...formProps('type')}
            options={types}
            rules={{ required: t('required', { value: t('validation.phase') }) ?? '' }}
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
          />
          <RadioCheckboxField {...formProps('programmed')} rules={validateProgrammed()} />
          <NumberField {...formProps('planningStartYear')} rules={validatePlanningStartYear()} />
          <NumberField
            {...formProps('constructionEndYear')}
            rules={validateConstructionEndYear()}
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
            <DateField {...formProps('estPlanningStart')} rules={validateEstPlanningStart()} />
            <DateField {...formProps('estPlanningEnd')} rules={validateEstPlanningEnd()} />
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
              rules={validateEstConstructionStart()}
            />
            <DateField {...formProps('estConstructionEnd')} rules={validateEstConstructionEnd()} />
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
