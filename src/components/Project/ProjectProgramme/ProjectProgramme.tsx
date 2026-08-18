import { Button, ButtonVariant, Notification } from 'hds-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query';
import useGetProject from '@/hooks/useGetProject';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  useGetProjectProgrammeByProjectQuery,
  usePostProjectProgrammeSectionMutation,
  usePostProjectProgrammeMutation,
  usePostSwitchProjectProgrammeTypeMutation,
} from '@/api/projectProgrammeApi';
import ProjectProgrammeForm from './ProjectProgrammeForm';
import {
  mapSectionIdToApiRoute,
  PROJECT_PROGRAMME_SECTIONS,
  ProjectProgrammeSectionId,
} from './projectProgrammeSections';
import StartProjectProgramme from './StartProjectProgramme';
import ProjectProgrammeBottomBar from './ProjectProgrammeBottomBar';
import ProjectProgrammeSectionCard from './ProjectProgrammeSectionCard';

const isBriefProgramme = (projectProgramme: { briefProjectProgramme?: boolean | null }) => {
  return projectProgramme.briefProjectProgramme ?? true;
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  return typeof error.status === 'number' ? error.status : undefined;
}

function ProjectProgramme() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();

  const {
    data: projectProgrammeFromProject,
    error: projectProgrammeByProjectError,
    isLoading: isLoadingProjectProgrammeByProject,
    refetch: refetchProjectProgramme,
  } = useGetProjectProgrammeByProjectQuery(project?.id ?? skipToken);

  const [postProjectProgramme] = usePostProjectProgrammeMutation();
  const [postProjectProgrammeSection] = usePostProjectProgrammeSectionMutation();
  const [switchType] = usePostSwitchProjectProgrammeTypeMutation();
  const [activeSection, setActiveSection] = useState<ProjectProgrammeSectionId | null>(null);

  const effectiveProjectProgramme = projectProgrammeFromProject;
  const projectProgrammeId = effectiveProjectProgramme?.id ?? null;

  const briefProgramme = effectiveProjectProgramme
    ? isBriefProgramme(effectiveProjectProgramme)
    : true;
  const hasProjectProgramme = Boolean(projectProgrammeId);
  const projectProgrammeQueryStatus = getErrorStatus(projectProgrammeByProjectError);
  const hasProjectProgrammeLoadError =
    !hasProjectProgramme &&
    projectProgrammeQueryStatus !== undefined &&
    projectProgrammeQueryStatus !== 404;
  const isProjectProgrammeComplete = effectiveProjectProgramme?.status === 'COMPLETE';
  const hasBasicInfo = Boolean(effectiveProjectProgramme?.basicInfo);
  const hasSavedExtendedSection = PROJECT_PROGRAMME_SECTIONS.some(
    (section) =>
      !section.showInBrief &&
      Boolean(effectiveProjectProgramme?.[section.id]),
  );

  const hasActiveSection = Boolean(activeSection && projectProgrammeId);
  const showLoadError = hasProjectProgrammeLoadError;
  const showStartProjectProgramme = !showLoadError && !hasProjectProgramme;
  const showActiveSectionForm = !showLoadError && hasProjectProgramme && hasActiveSection;
  const showOverview = !showLoadError && hasProjectProgramme && !hasActiveSection;

  function notifyMissingProject() {
    dispatch(
      notifyError({
        title: 'saveError',
        message: 'projectNotFound',
        type: 'toast',
      }),
    );
  }

  async function handleStartProjectProgramme() {
    if (!project?.id) {
      notifyMissingProject();
      return;
    }

    try {
      await postProjectProgramme({ project: project.id }).unwrap();
    } catch (error) {
      const status = getErrorStatus(error);

      if (status === 403) {
        dispatch(
          notifyError({
            title: 'saveError',
            message: 'projectProgrammeCreateForbidden',
            type: 'toast',
          }),
        );
        return;
      }

      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeCreateError',
          type: 'toast',
        }),
      );
    }
  }

  async function handleSwitchType() {
    if (!effectiveProjectProgramme?.id) {
      notifyMissingProject();
      return;
    }

    try {
      await switchType(effectiveProjectProgramme.id).unwrap();
      dispatch(
        notifySuccess({
          title: 'patchSuccess',
          message: 'projectProgrammeSwitchTypeSuccess',
          type: 'toast',
        }),
      );
    } catch (error) {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeSwitchTypeError',
          type: 'toast',
        }),
      );
      return error;
    }
  }

  async function handleOpenSection(sectionId: ProjectProgrammeSectionId) {
    if (!effectiveProjectProgramme?.id) {
      notifyMissingProject();
      return;
    }

    if (sectionId && effectiveProjectProgramme[sectionId]) {
      setActiveSection(sectionId);
      return;
    }

    try {
      await postProjectProgrammeSection({
        id: effectiveProjectProgramme.id,
        section: mapSectionIdToApiRoute(sectionId),
      }).unwrap();

      setActiveSection(sectionId);
      return;
    } catch (error) {
      const status = getErrorStatus(error);

      if (status === 409) {
        await refetchProjectProgramme();
        setActiveSection(sectionId);
        return;
      }

      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeBasicInfoError',
          type: 'toast',
        }),
      );
    }
  }

  function handleCloseSection() {
    setActiveSection(null);
  }

  if (isLoadingProjectProgrammeByProject) {
    return null;
  }

  const extendedSectionTextSuffix = t('projectProgrammeForm.basicInfoCardTextExtensionForExtended');

  return (
    <div className="project-programme-container">
      <div className="project-programme-view" data-testid="project-programme-view">
        {showLoadError && (
          <div className="project-form mx-auto max-w-xl" data-testid="project-programme-load-error">
            <Notification type="error" label={t('saveError')}>
              <div className="project-programme-notification-content">
                <p>{t('projectProgrammeForm.projectProgrammeLoadError')}</p>
                <div>
                  <Button
                    variant={ButtonVariant.Secondary}
                    onClick={() => refetchProjectProgramme()}
                  >
                    {t('projectProgrammeForm.retryLoadProjectProgramme')}
                  </Button>
                </div>
              </div>
            </Notification>
          </div>
        )}

        {showStartProjectProgramme && (
          <StartProjectProgramme onStartProjectProgramme={handleStartProjectProgramme} />
        )}

        {showActiveSectionForm && activeSection && projectProgrammeId && (
          <ProjectProgrammeForm
            projectProgrammeId={projectProgrammeId}
            activeSection={activeSection}
            basicInfo={effectiveProjectProgramme?.basicInfo ?? null}
            briefProgramme={briefProgramme}
            onClose={handleCloseSection}
          />
        )}

        {showOverview && (
          <div className="project-form mx-auto max-w-xl">
            {briefProgramme && (
              <Notification type="alert" label={t('projectProgrammeForm.briefNotificationTitle')}>
                <div className="project-programme-notification-content">
                  <p>{t('projectProgrammeForm.briefNotificationText')}</p>
                  <div>
                    <Button
                      variant={ButtonVariant.Secondary}
                      theme={{ '--background-color': 'var(--color-white)' }}
                      onClick={handleSwitchType}
                    >
                      {t('projectProgrammeForm.switchToExtendedProgramme')}
                    </Button>
                  </div>
                </div>
              </Notification>
            )}
            <ProjectProgrammeSectionCard
              extendedSectionTextSuffix={extendedSectionTextSuffix}
              briefProgramme={briefProgramme}
              sectionIsStarted={hasBasicInfo}
              isProjectProgrammeComplete={isProjectProgrammeComplete}
              handleOpenSection={handleOpenSection}
            />
            <ProjectProgrammeBottomBar
              isBriefProgramme={briefProgramme}
              hasSavedExtendedSection={hasSavedExtendedSection}
              isProjectProgrammeComplete={isProjectProgrammeComplete}
              effectiveProjectProgrammeId={effectiveProjectProgramme?.id ?? ''}
              handleSwitchType={handleSwitchType}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectProgramme;
