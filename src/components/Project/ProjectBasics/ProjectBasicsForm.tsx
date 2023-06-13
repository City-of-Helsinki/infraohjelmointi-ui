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
import { IconAlertCircleFill } from 'hds-react';

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
        message: t('validation.minValue', { value: '0' }),
      },
      max: {
        value: 3000,
        message: t('validation.maxValue', { value: '3000' }),
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
      required: t('validation.required', { field: 'Vaihe' }) ?? '',
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
              return t('validation.isBefore', {
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
            return t('validation.isAfter', {
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
            return t('validation.requiredFor', {
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
              return t('validation.isBefore', {
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
            return t('validation.requiredFor', {
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
              return t('validation.isAfter', {
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
            return t('validation.requiredFor', {
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
              return t('validation.isBefore', {
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
            return t('validation.requiredFor', {
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
              return t('validation.isAfter', {
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
    <form
      onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}
      data-testid="project-basics-form"
      className="basic-info-form"
    >
      {/* SECTION 1 - BASIC INFO */}
      <div className="w-full" id="basics-info-section">
        <FormSectionTitle {...formProps('basics')} />
        <div className="form-row">
          <div className="form-col-xl">
            <SelectField
              {...formProps('type')}
              options={types}
              rules={{ required: t('validation.required', { field: t('validation.phase') }) ?? '' }}
            />
          </div>
          <div className="form-col-xl">
            <NumberField
              {...formProps('hkrId')}
              rules={{
                maxLength: { value: 18, message: t('validation.maxLength', { value: '18' }) },
              }}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <TextField
              {...formProps('entityName')}
              rules={{
                maxLength: { value: 30, message: t('validation.maxLength', { value: '30' }) },
              }}
            />
          </div>
          <div className="form-col-xl">
            <TextField {...formProps('sapProject')} control={control} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <SelectField {...formProps('area')} options={areas} />
          </div>
          <div className="form-col-xl">
            <TextField {...formProps('sapNetwork')} readOnly={true} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <TextAreaField
              {...formProps('description')}
              size="l"
              rules={{ required: t('validation.required', { field: 'Kuvaus' }) ?? '' }}
              formSaved={formSaved}
            />
          </div>
        </div>
        <div className="form-row">
          <ProjectHashTags
            name="hashTags"
            label={'projectBasicsForm.hashTags'}
            control={control}
            project={project}
          />
        </div>
      </div>

      {/* SECTION 2 - STATUS */}
      <div className="w-full" id="basics-status-section">
        <FormSectionTitle {...formProps('status')} />
        <div className="form-row">
          <div className="form-col-xl">
            <SelectField {...formProps('phase')} rules={validatePhase()} options={phases} />
          </div>
          <div className="form-col-xl">
            <SelectField
              {...formProps('constructionPhaseDetail')}
              options={constructionPhaseDetails}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <div
              className="w-full border-l-8 border-error bg-error-light px-4 py-4"
              id="error-summary"
            >
              <label className="text-l font-bold">
                <IconAlertCircleFill color="#b01038" /> Seuraavat kentät ovat pakollisia
              </label>
            </div>
          </div>
        </div>
        <div className="form-row">
          <RadioCheckboxField {...formProps('programmed')} rules={validateProgrammed()} />
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <NumberField {...formProps('planningStartYear')} rules={validatePlanningStartYear()} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <NumberField
              {...formProps('constructionEndYear')}
              rules={validateConstructionEndYear()}
            />
          </div>
        </div>
        <div className="form-row">
          <RadioCheckboxField {...formProps('louhi')} />
        </div>
        <div className="form-row">
          <RadioCheckboxField {...formProps('gravel')} />
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <SelectField {...formProps('category')} options={categories} />
          </div>
        </div>
        <div className="form-row">
          <RadioCheckboxField {...formProps('effectHousing')} />
        </div>
        <div className="form-row">
          <div className="form-col-xl">
            <SelectField {...formProps('riskAssessment')} options={riskAssessments} />
          </div>
        </div>
      </div>

      {/* SECTION 3 - SCHEDULE */}
      <div className="w-full" id="basics-schedule-section">
        <FormSectionTitle {...formProps('schedule')} />
        <Fieldset heading={t('projectBasicsForm.planning')} className="w-full" id="planning">
          <div className="form-row">
            <div className="form-col-md">
              <DateField {...formProps('estPlanningStart')} rules={validateEstPlanningStart()} />
            </div>
            <div className="form-col-md">
              <DateField {...formProps('estPlanningEnd')} rules={validateEstPlanningEnd()} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col-md">
              <DateField {...formProps('presenceStart')} />
            </div>
            <div className="form-col-md">
              <DateField {...formProps('presenceEnd')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col-md">
              <DateField {...formProps('visibilityStart')} />
            </div>
            <div className="form-col-md">
              <DateField {...formProps('visibilityEnd')} />
            </div>
          </div>
        </Fieldset>
        <Fieldset
          heading={t('projectBasicsForm.construction')}
          className="w-full"
          id="construction"
        >
          <div className="form-row">
            <div className="form-col-md">
              <DateField
                {...formProps('estConstructionStart')}
                rules={validateEstConstructionStart()}
              />
            </div>
            <div className="form-col-md">
              <DateField
                {...formProps('estConstructionEnd')}
                rules={validateEstConstructionEnd()}
              />
            </div>
          </div>
        </Fieldset>
      </div>

      {/* SECTION 4 - FINANCIALS */}
      <div className="w-full" id="basics-financials-section">
        <FormSectionTitle {...formProps('financial')} />
        <div className="form-row">
          <div className="form-col-xxl">
            <SelectField {...formProps('masterClass')} options={masterClasses} size="full" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <SelectField {...formProps('class')} options={classes} />
          </div>
          <div className="form-col-md">
            <SelectField {...formProps('subClass')} options={subClasses} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-sm">
            <NumberField {...formProps('projectCostForecast')} tooltip="keur" hideLabel={true} />
          </div>
          <div className="form-col-lg">
            <SelectField {...formProps('projectQualityLevel')} options={projectQualityLevels} />
          </div>
          <div className="form-col-sm">
            <NumberField {...formProps('projectWorkQuantity')} tooltip="keur" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-sm">
            <NumberField {...formProps('planningCostForecast')} tooltip="keur" hideLabel={true} />
          </div>
          <div className="form-col-lg">
            <SelectField {...formProps('planningPhase')} options={planningPhases} />
          </div>
          <div className="form-col-sm">
            <NumberField {...formProps('planningWorkQuantity')} tooltip="keur" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-sm">
            <NumberField
              {...formProps('constructionCostForecast')}
              tooltip="keur"
              hideLabel={true}
            />
          </div>
          <div className="form-col-lg">
            <SelectField {...formProps('constructionPhase')} options={constructionPhases} />
          </div>
          <div className="form-col-sm">
            <NumberField {...formProps('constructionWorkQuantity')} tooltip="keur" />
          </div>
        </div>
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
      </div>

      {/* SECTION 5 - RESPONSIBLE PERSONS */}
      <div className="w-full" id="basics-responsible-persons-section">
        <FormSectionTitle {...formProps('responsiblePersons')} />
        <div className="form-row">
          <div className="form-col-md">
            <SelectField
              {...formProps('personPlanning')}
              icon="person"
              options={responsiblePersons}
            />
          </div>
          <div className="form-col-md">
            <SelectField
              {...formProps('personConstruction')}
              icon="person"
              options={responsiblePersons}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <SelectField
              {...formProps('personProgramming')}
              icon="person"
              options={responsiblePersons}
            />
          </div>
          <div className="form-col-md">
            <TextField {...formProps('otherPersons')} />
          </div>
        </div>
      </div>

      {/* SECTION 6 - LOCATION */}
      <div className="w-full" id="basics-location-section">
        <FormSectionTitle {...formProps('location')} />
        <div className="form-row">
          <div className="form-col-xxl">
            <SelectField
              {...formProps('responsibleZone')}
              options={responsibleZones}
              rules={{
                required: t('validation.required', { field: 'Alueen vastuujaon mukaan' }) ?? '',
              }}
              size="full"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-xxl">
            <SelectField
              {...formProps('district')}
              icon="location"
              options={districts}
              size="full"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <SelectField {...formProps('division')} icon="location" options={divisions} />
          </div>
          <div className="form-col-md">
            <SelectField {...formProps('subDivision')} icon="location" options={subDivisions} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <TextField {...formProps('masterPlanAreaNumber')} />
          </div>
          <div className="form-col-md">
            <TextField {...formProps('trafficPlanNumber')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <TextField {...formProps('bridgeNumber')} />
          </div>
        </div>
      </div>

      {/* SECTION 7 - PROJECT PROGRAM */}
      <div className="w-full" id="basics-location-section">
        <FormSectionTitle {...formProps('projectProgramTitle')} />
        <div className="form-row">
          <div className="form-col-xxl">
            <TextAreaField {...formProps('projectProgram')} />
          </div>
        </div>
      </div>
    </form>
  );
};

export default memo(ProjectBasicsForm);
