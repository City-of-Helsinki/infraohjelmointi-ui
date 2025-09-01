import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { useProgrammerOptions } from '@/hooks/useProgrammerOptions';
import { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import { useProjectClassOptions } from '@/hooks/useProjectClassOptions';

interface IProjectResponsiblePersonsSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  setProgrammer: UseFormSetValue<IProjectForm>;
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean;
}
const ProjectResponsiblePersonsSection: FC<IProjectResponsiblePersonsSectionProps> = ({
  getFieldProps,
  getValues,
  setProgrammer,
  isInputDisabled,
  isUserOnlyViewer,
}) => {
  const { t } = useTranslation();

  const responsiblePersons = useOptions('responsiblePersons');
  const projectClasses = useProjectClassOptions();
  const [lastSelectedClass, setLastSelectedClass] = useState<string>('');

  // Get the current class value, considering the hierarchy
  const getCurrentClass = useCallback(() => {
    return (
      getValues('subClass')?.value || getValues('class')?.value || getValues('masterClass')?.value
    );
  }, [getValues]);

  // Watch for project class changes and set default programmer
  useEffect(() => {
    const currentClass = getCurrentClass();
    const currentProgrammer = getValues('personProgramming')?.value;

    // Only update if class changed and no programmer is selected
    if (currentClass && currentClass !== lastSelectedClass && !currentProgrammer) {
      const selectedClass = projectClasses.find((c) => c.value === currentClass);
      if (selectedClass?.defaultProgrammer) {
        setProgrammer('personProgramming', {
          value: selectedClass.defaultProgrammer.id,
          label:
            `${selectedClass.defaultProgrammer.firstName} ${selectedClass.defaultProgrammer.lastName}`.trim(),
        });
      }
      setLastSelectedClass(currentClass);
    }
  }, [getCurrentClass, getValues, lastSelectedClass, projectClasses, setProgrammer]);
  const programmers = useProgrammerOptions();
  const phases = useOptions('phases');

  const programmingPhase = phases[2]?.value ?? '';
  const draftInitiationPhase = phases[3]?.value ?? '';
  const draftApprovalPhase = phases[4]?.value ?? '';
  const constructionPlanPhase = phases[5]?.value ?? '';
  const constructionWaitPhase = phases[6]?.value ?? '';
  const constructionPhase = phases[7]?.value ?? '';
  const warrantyPeriodPhase = phases[8]?.value ?? '';
  const completedPhase = phases[9]?.value ?? '';

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

  const phasesThatNeedConstruction = useMemo(
    () => [constructionPhase, warrantyPeriodPhase, completedPhase],
    [completedPhase, constructionPhase, warrantyPeriodPhase],
  );

  const phasesThatNeedProgramming = useMemo(
    () => [programmingPhase, warrantyPeriodPhase, completedPhase],
    [completedPhase, programmingPhase, warrantyPeriodPhase],
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

  const validatePersonProgramming = useCallback(() => {
    return {
      validate: {
        isResponsiblePersonValid: (personProgramming: IOption) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedProgramming.includes(phase) && personProgramming.value === '') {
            return t('validation.required', { field: t('validation.personProgramming') });
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedProgramming, t]);

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
            shouldTranslate={false}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personConstruction')}
            iconKey="person"
            options={responsiblePersons}
            rules={validatePersonConstruction()}
            shouldTranslate={false}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personProgramming')}
            iconKey="person"
            options={programmers}
            rules={validatePersonProgramming()}
            shouldTranslate={false}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-md">
          <TextField {...getFieldProps('otherPersons')} readOnly={isUserOnlyViewer} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectResponsiblePersonsSection);
