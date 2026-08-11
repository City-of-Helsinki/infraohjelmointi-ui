import { Button, ButtonVariant, IconLink, Notification } from 'hds-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query';
import useGetProject from '@/hooks/useGetProject';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  useGetProjectProgrammeByProjectQuery,
  usePostProjectProgrammeSectionMutation,
  usePostProjectProgrammeMutation,
  usePostSwitchProjectProgrammeTypeMutation,
  useTransitionProjectProgrammeStatusMutation,
} from '@/api/projectProgrammeApi';
import {
  IProjectProgramme,
  IProjectProgrammeBasicInfo,
} from '@/interfaces/projectProgrammeInterfaces';
import { selectProjectDistricts } from '@/reducers/listsSlice';
import ProjectProgrammeForm from './ProjectProgrammeForm';
import {
  mapSectionIdToApiRoute,
  PROJECT_PROGRAMME_SECTIONS,
  ProjectProgrammeSectionId,
} from './projectProgrammeSections';
import StartProjectProgramme from './StartProjectProgramme';

function isBriefProgramme(projectProgramme: { briefProjectProgramme?: boolean | null }) {
  return projectProgramme.briefProjectProgramme ?? true;
}

interface IActiveProjectProgrammeSection {
  id: ProjectProgrammeSectionId;
  data: unknown;
}

export default function ProjectProgramme() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();
  const districts = useAppSelector(selectProjectDistricts);

  const {
    data: projectProgrammeFromProject,
    error: projectProgrammeByProjectError,
    isLoading: isLoadingProjectProgrammeByProject,
    refetch: refetchProjectProgramme,
  } = useGetProjectProgrammeByProjectQuery(project?.id ?? skipToken);

  const [postProjectProgramme] = usePostProjectProgrammeMutation();
  const [postProjectProgrammeSection] = usePostProjectProgrammeSectionMutation();
  const [switchType] = usePostSwitchProjectProgrammeTypeMutation();
  const [transitionStatus] = useTransitionProjectProgrammeStatusMutation();
  const [activeSectionState, setActiveSectionState] =
    useState<IActiveProjectProgrammeSection | null>(null);
  const [briefProgrammeOverride, setBriefProgrammeOverride] = useState<boolean | null>(null);

  const effectiveProjectProgramme = projectProgrammeFromProject;
  const projectProgrammeId = effectiveProjectProgramme?.id ?? null;

  useEffect(() => {
    setBriefProgrammeOverride(null);
  }, [effectiveProjectProgramme?.id]);

  const initialBasicInfoFromProject = useMemo<IProjectProgrammeBasicInfo>(
    () => ({
      projectName: project?.name ?? '',
      district: districts.find((district) => district.id === project?.projectDistrict)?.value ?? '',
    }),
    [districts, project?.name, project?.projectDistrict],
  );

  const initialBasicInfo = useMemo<IProjectProgrammeBasicInfo>(() => {
    const existingBasicInfo = effectiveProjectProgramme?.basicInfo;

    if (existingBasicInfo) {
      return {
        projectName: existingBasicInfo.projectName ?? project?.name ?? '',
        district: existingBasicInfo.district ?? initialBasicInfoFromProject.district,
      };
    }

    return initialBasicInfoFromProject;
  }, [effectiveProjectProgramme?.basicInfo, initialBasicInfoFromProject, project?.name]);

  const briefProgramme =
    briefProgrammeOverride ??
    (effectiveProjectProgramme ? isBriefProgramme(effectiveProjectProgramme) : true);
  const hasProjectProgramme = Boolean(projectProgrammeId);
  const projectProgrammeQueryStatus = (
    projectProgrammeByProjectError as { status?: number } | undefined
  )?.status;
  const hasProjectProgrammeLoadError =
    !hasProjectProgramme &&
    projectProgrammeQueryStatus !== undefined &&
    projectProgrammeQueryStatus !== 404;
  const isProjectProgrammeComplete = effectiveProjectProgramme?.status === 'COMPLETE';

  const activeSection = activeSectionState?.id ?? null;
  const hasActiveSection = Boolean(activeSection && projectProgrammeId);
  const showLoadError = hasProjectProgrammeLoadError;
  const showStartProjectProgramme = !showLoadError && !hasProjectProgramme;
  const showActiveSectionForm = !showLoadError && hasProjectProgramme && hasActiveSection;
  const showOverview = !showLoadError && hasProjectProgramme && !hasActiveSection;

  let activeSectionBasicInfo = initialBasicInfo;
  if (activeSection === 'basicInfo' && activeSectionState?.data) {
    activeSectionBasicInfo = activeSectionState.data as IProjectProgrammeBasicInfo;
  }

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
      const status = (error as { status?: number })?.status;

      if (status === 409) {
        await refetchProjectProgramme();
        dispatch(
          notifySuccess({
            title: 'postSuccess',
            message: 'projectProgrammeAlreadyExists',
            type: 'toast',
          }),
        );
        return;
      }

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
      setBriefProgrammeOverride(!briefProgramme);
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

  function handleCopyLinkClick() {
    navigator.clipboard
      .writeText(globalThis.location.href)
      .then(() => {
        dispatch(
          notifySuccess({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            duration: 3500,
          }),
        );
      })
      .catch(() => {
        dispatch(
          notifyError({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            duration: 3500,
          }),
        );
      });
  }

  function handleGeneratePdfClick() {
    dispatch(
      notifySuccess({
        title: 'update',
        message: 'projectProgrammePdfGenerationNotImplemented',
        type: 'toast',
      }),
    );
  }

  async function handleMarkProgrammeReady() {
    if (!effectiveProjectProgramme?.id) {
      notifyMissingProject();
      return;
    }

    try {
      await transitionStatus({ id: effectiveProjectProgramme.id, to: 'COMPLETE' }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'projectProgrammeMarkReadySuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeMarkReadyError',
          type: 'toast',
        }),
      );
    }
  }

  async function handleOpenSection(sectionId: ProjectProgrammeSectionId) {
    if (!effectiveProjectProgramme?.id) {
      notifyMissingProject();
      return;
    }

    if (sectionId === 'basicInfo' && effectiveProjectProgramme.basicInfo) {
      setActiveSectionState({
        id: sectionId,
        data: effectiveProjectProgramme.basicInfo,
      });
      return;
    }

    try {
      const response = await postProjectProgrammeSection({
        id: effectiveProjectProgramme.id,
        section: mapSectionIdToApiRoute(sectionId),
      }).unwrap();

      setActiveSectionState({
        id: sectionId,
        data: sectionId === 'basicInfo' ? (response as IProjectProgrammeBasicInfo) : response,
      });
      return;
    } catch (error) {
      const status = (error as { status?: number })?.status;

      if (status === 409) {
        const refreshedResult = (await refetchProjectProgramme()) as {
          data?: IProjectProgramme;
        };
        setActiveSectionState({
          id: sectionId,
          data:
            sectionId === 'basicInfo'
              ? refreshedResult.data?.basicInfo ??
                effectiveProjectProgramme.basicInfo ??
                initialBasicInfo
              : null,
        });
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
    setActiveSectionState(null);
  }

  if (isLoadingProjectProgrammeByProject) {
    return null;
  }

  const extendedSectionTextSuffix = t(
    'projectProgrammeForm.basicInfoCardTextExtensionForExtended',
  );

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
            basicInfo={activeSectionBasicInfo}
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

            {PROJECT_PROGRAMME_SECTIONS.filter(
              (section) => !briefProgramme || section.showInBrief,
            ).map((section) => {
              let sectionDescription = t(section.textKey);
              if (!briefProgramme) {
                sectionDescription = `${sectionDescription} ${extendedSectionTextSuffix}`;
              }

              return (
                <div className="project-programme-section" key={section.id}>
                  <Notification type="info" label={t(section.labelKey)}>
                    <div className="project-programme-notification-content">
                      <p>{sectionDescription}</p>
                      <div>
                        <Button type="button" onClick={() => handleOpenSection(section.id)}>
                          {t(section.actionKey)}
                        </Button>
                      </div>
                    </div>
                  </Notification>
                </div>
              );
            })}

            <div className="project-form-banner">
              <div className="project-form-banner-container">
                <div className="project-programme-actions">
                  <Button
                    type="button"
                    onClick={handleMarkProgrammeReady}
                    disabled={isProjectProgrammeComplete}
                  >
                    {t('projectProgrammeForm.markReady')}
                  </Button>
                  <Button
                    variant={ButtonVariant.Secondary}
                    iconStart={<IconLink />}
                    type="button"
                    onClick={handleCopyLinkClick}
                  >
                    {t('copyLink')}
                  </Button>
                  <Button
                    variant={ButtonVariant.Secondary}
                    type="button"
                    onClick={handleGeneratePdfClick}
                  >
                    {t('projectProgrammeForm.makePdf')}
                  </Button>
                  {!briefProgramme && (
                    <Button
                      variant={ButtonVariant.Secondary}
                      type="button"
                      onClick={handleSwitchType}
                    >
                      {t('projectProgrammeForm.switchToBriefProgramme')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
