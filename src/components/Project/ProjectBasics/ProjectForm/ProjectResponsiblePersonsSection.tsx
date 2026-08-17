import { FormSectionTitle, SelectField } from '@/components/shared';
import { FC, memo, useCallback, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues, useWatch } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import { defaultFilter } from 'hds-react';

interface IProjectResponsiblePersonsSectionProps {
  control: Control<IProjectForm>;
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean;
}
const ProjectResponsiblePersonsSection: FC<IProjectResponsiblePersonsSectionProps> = ({
  control,
  getFieldProps,
  getValues,
  isInputDisabled,
  isUserOnlyViewer,
}) => {
  const { t } = useTranslation();

  const responsiblePersons = useOptions('responsiblePersons');
  const phases = useOptions('phases');
  const programmers = useOptions('programmers');

  const findPhase = (val: string) => phases.find((p) => p.label === val)?.value ?? '';
  const planningPhase = findPhase('designPlanning');
  const constructionWaitPhase = findPhase('constructionWait');
  const constructionPhase = findPhase('construction');
  const warrantyPeriodPhase = findPhase('warrantyPeriod');
  const completedPhase = findPhase('completed');

  const phasesThatNeedResponsiblePerson = useMemo(
    () =>
      [
        planningPhase,
        constructionWaitPhase,
        constructionPhase,
        warrantyPeriodPhase,
        completedPhase,
      ].filter((phase): phase is string => phase !== ''),
    [
      completedPhase,
      constructionPhase,
      constructionWaitPhase,
      planningPhase,
      warrantyPeriodPhase,
    ],
  );

  const phasesThatNeedConstruction = useMemo(
    () => [constructionPhase, warrantyPeriodPhase, completedPhase].filter((phase): phase is string => phase !== ''),
    [completedPhase, constructionPhase, warrantyPeriodPhase],
  );

  const currentPhase = useWatch({
    control,
    name: 'phase',
  })?.value;

  const validatePersonPlanning = useCallback(() => {
    return {
      validate: {
        isResponsiblePersonValid: (personPlanning: IOption) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedResponsiblePerson.includes(phase) && personPlanning.value === '') {
            return t('validation.required', { field: t('validation.personPlanning') });
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedResponsiblePerson, t]);

  const validatePersonConstruction = useCallback(() => {
    return {
      validate: {
        isResponsiblePersonValid: (personConstruction: IOption) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedConstruction.includes(phase) && personConstruction.value === '') {
            return t('validation.required', { field: t('validation.personConstruction') });
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedConstruction, t]);

  return (
    <div className="w-full" id="basics-responsible-persons-section">
      <FormSectionTitle {...getFieldProps('responsiblePersons')} />
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personPlanning')}
            iconKey="person"
            options={responsiblePersons}
            rules={validatePersonPlanning()}
            required={phasesThatNeedResponsiblePerson.includes(currentPhase)}
            shouldTranslate={false}
            readOnly={isUserOnlyViewer}
            clearable
            filter={defaultFilter}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personConstruction')}
            iconKey="person"
            options={responsiblePersons}
            rules={validatePersonConstruction()}
            required={phasesThatNeedConstruction.includes(currentPhase)}
            shouldTranslate={false}
            readOnly={isUserOnlyViewer}
            clearable
            filter={defaultFilter}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personProgramming')}
            iconKey="person"
            options={programmers}
            shouldTranslate={false}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
            clearable
            filter={defaultFilter}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('otherPersons')}
            iconKey="person"
            options={responsiblePersons}
            shouldTranslate={false}
            readOnly={isUserOnlyViewer}
            clearable
            filter={defaultFilter}
            multiSelect
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectResponsiblePersonsSection);
