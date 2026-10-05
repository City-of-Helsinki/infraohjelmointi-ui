import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';
import { getFieldsForSection } from './sections/projectProgrammeSectionFields';
import ReadonlyFieldList from '@/components/shared/ReadonlyFieldList';
import ProjectProgrammeLinksField from './ProjectProgrammeLinksField';

interface ProjectProgrammeReadonlySectionProps {
  sectionId: ProjectProgrammeSectionId;
  projectProgramme?: IProjectProgramme;
}

export default function ProjectProgrammeReadonlySection({
  sectionId,
  projectProgramme,
}: Readonly<ProjectProgrammeReadonlySectionProps>) {
  return (
    <>
      <ReadonlyFieldList
        fields={getFieldsForSection(sectionId, projectProgramme)}
        pathPrefix={sectionId}
        translationNamespace="projectProgrammeForm"
      />
      <ProjectProgrammeLinksField section={sectionId} mode="view" />
    </>
  );
}
