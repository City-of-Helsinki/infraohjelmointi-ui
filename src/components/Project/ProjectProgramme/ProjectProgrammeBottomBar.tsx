import { Button, ButtonVariant } from 'hds-react';
import FormBottomBar from '@/components/shared/FormBottomBar';
import { useTranslation } from 'react-i18next';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';
import ProjectProgrammeStatusTransitionButtons from './ProjectProgrammeStatusTransitionButtons';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeRequiredSectionId } from './sections/projectProgrammeSections';

interface ProjectProgrammeBottomBarProps {
  isBriefProgramme: boolean;
  hasSavedExtendedSection: boolean;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  effectiveProjectProgramme?: IProjectProgramme;
  onMissingRequiredFields?: (sections: ProjectProgrammeRequiredSectionId[]) => void;
  handleSwitchType: () => Promise<unknown>;
}

function ProjectProgrammeBottomBar({
  isBriefProgramme,
  hasSavedExtendedSection,
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
  effectiveProjectProgramme,
  onMissingRequiredFields,
  handleSwitchType,
}: Readonly<ProjectProgrammeBottomBarProps>) {
  const { t } = useTranslation();

  return (
    <FormBottomBar>
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={isProjectProgrammeComplete}
        effectiveProjectProgrammeId={effectiveProjectProgrammeId}
        effectiveProjectProgramme={effectiveProjectProgramme}
        onMissingRequiredFields={onMissingRequiredFields}
      />
      <ProjectProgrammeActionButtons />
      {!isBriefProgramme && !hasSavedExtendedSection && (
        <Button variant={ButtonVariant.Secondary} type="button" onClick={handleSwitchType}>
          {t('projectProgrammeForm.switchToBriefProgramme')}
        </Button>
      )}
    </FormBottomBar>
  );
}

export default ProjectProgrammeBottomBar;
