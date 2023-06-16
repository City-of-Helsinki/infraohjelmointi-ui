import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { FC, memo, useCallback, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';

interface IProjectResponsiblePersonsSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
}
const ProjectResponsiblePersonsSection: FC<IProjectResponsiblePersonsSectionProps> = ({
  getFieldProps,
  getValues,
}) => {
  const { t } = useTranslation();

  const responsiblePersons = useOptions('responsiblePersons', true);
  const phases = useOptions('phases');

  const draftInitiationPhase = phases[3].value;
  const draftApprovalPhase = phases[4].value;
  const constructionPlanPhase = phases[5].value;
  const constructionWaitPhase = phases[6].value;
  const constructionPhase = phases[7].value;
  const warrantyPeriodPhase = phases[8].value;
  const completedPhase = phases[9].value;

  const phasesThatNeedResponsiblePerson = useMemo(
    () => [
      draftInitiationPhase,
      draftApprovalPhase,
      constructionPlanPhase,
      constructionWaitPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ],
    [
      completedPhase,
      constructionPhase,
      constructionPlanPhase,
      constructionWaitPhase,
      draftApprovalPhase,
      draftInitiationPhase,
      warrantyPeriodPhase,
    ],
  );

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

  return (
    <div className="w-full" id="basics-responsible-persons-section">
      <FormSectionTitle {...getFieldProps('responsiblePersons')} />
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personPlanning')}
            icon="person"
            options={responsiblePersons}
            rules={validatePersonPlanning()}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personConstruction')}
            icon="person"
            options={responsiblePersons}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personProgramming')}
            icon="person"
            options={responsiblePersons}
          />
        </div>
        <div className="form-col-md">
          <TextField {...getFieldProps('otherPersons')} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectResponsiblePersonsSection);
