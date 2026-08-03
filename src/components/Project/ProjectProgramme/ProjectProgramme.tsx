import { Button, ButtonVariant, Card, Notification } from 'hds-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query';
import useGetProject from '@/hooks/useGetProject';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  useGetProjectProgrammeByProjectQuery,
  useGetProjectProgrammeByIdQuery,
  usePostProjectProgrammeMutation,
  usePostProjectProgrammeBasicInfoSectionMutation,
  usePostSwitchProjectProgrammeTypeMutation,
} from '@/api/projectProgrammeApi';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';
import { selectProjectDistricts } from '@/reducers/listsSlice';
import ProjectProgrammeForm from './ProjectProgrammeForm';

type ProjectProgrammeView = 'overview' | 'basicInfo';

function isBriefProgramme(projectProgramme: { briefProjectProgramme?: boolean | null }) {
  return projectProgramme.briefProjectProgramme ?? true;
}

export default function ProjectProgramme() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();
  const districts = useAppSelector(selectProjectDistricts);

  const existingProjectProgrammeId =
    typeof project?.projectProgram === 'string' ? project.projectProgram : null;

  const { data: projectProgrammeFromProject } = useGetProjectProgrammeByProjectQuery(
    project?.id ?? skipToken,
  );

  const [createdProjectProgrammeId, setCreatedProjectProgrammeId] = useState<string | null>(null);
  const projectProgrammeId =
    createdProjectProgrammeId ?? projectProgrammeFromProject?.id ?? existingProjectProgrammeId;

  const { data: projectProgramme } = useGetProjectProgrammeByIdQuery(
    !projectProgrammeFromProject && projectProgrammeId ? projectProgrammeId : skipToken,
  );

  const [postProjectProgramme] = usePostProjectProgrammeMutation();
  const [switchType] = usePostSwitchProjectProgrammeTypeMutation();
  const [postBasicInfoSection] = usePostProjectProgrammeBasicInfoSectionMutation();

  const [isBriefNotificationVisible, setIsBriefNotificationVisible] = useState(true);
  const [activeView, setActiveView] = useState<ProjectProgrammeView>('overview');
  const [basicInfo, setBasicInfo] = useState<IProjectProgrammeBasicInfo | null>(null);

  const initialBasicInfoFromProject = useMemo<IProjectProgrammeBasicInfo>(
    () => ({
      name: project?.name ?? '',
      district: districts.find((district) => district.id === project?.projectDistrict)?.value ?? '',
    }),
    [districts, project?.name, project?.projectDistrict],
  );

  const effectiveProjectProgramme = projectProgrammeFromProject ?? projectProgramme;

  const initialBasicInfo = useMemo<IProjectProgrammeBasicInfo>(() => {
    const existingBasicInfo = effectiveProjectProgramme?.basicInfo;

    if (existingBasicInfo) {
      return {
        name: existingBasicInfo.projectName ?? existingBasicInfo.projectName ?? project?.name ?? '',
        district: existingBasicInfo.district ?? initialBasicInfoFromProject.district,
      };
    }

    return initialBasicInfoFromProject;
  }, [effectiveProjectProgramme?.basicInfo, initialBasicInfoFromProject, project?.name]);

  const briefProgramme = effectiveProjectProgramme
    ? isBriefProgramme(effectiveProjectProgramme)
    : true;

  useEffect(() => {
    setBasicInfo(initialBasicInfo);
  }, [initialBasicInfo]);

  function notifyMissingProject() {
    dispatch(
      notifyError({
        title: 'saveError',
        message: 'projectNotFound',
        type: 'toast',
      }),
    );
  }

  async function createProjectProgrammeIfNeeded(): Promise<string | null> {
    if (projectProgrammeId) {
      return projectProgrammeId;
    }

    if (!project?.id) {
      notifyMissingProject();
      return null;
    }

    try {
      const createdProgramme = await postProjectProgramme({ project: project.id }).unwrap();
      setCreatedProjectProgrammeId(createdProgramme.id);
      return createdProgramme.id;
    } catch (error) {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeCreateError',
          type: 'toast',
        }),
      );
      return null;
    }
  }

  async function handleSwitchToExtendedProgramme() {
    const programmeId = await createProjectProgrammeIfNeeded();

    if (!programmeId) {
      return;
    }

    try {
      await switchType(programmeId).unwrap();
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

  async function handleFillBasicInfo() {
    // Existing programme: open with fetched values when available.
    if (effectiveProjectProgramme?.basicInfo) {
      setBasicInfo(initialBasicInfo);
      setActiveView('basicInfo');
      return;
    }

    // New programme: allow filling immediately without creating instance yet.
    if (!projectProgrammeId) {
      setBasicInfo(initialBasicInfo);
      setActiveView('basicInfo');
      return;
    }

    try {
      const response = await postBasicInfoSection(projectProgrammeId).unwrap();

      dispatch(
        notifySuccess({
          title: 'patchSuccess',
          message: 'projectProgrammeBasicInfoSuccess',
          type: 'toast',
        }),
      );

      setBasicInfo(response);
      setActiveView('basicInfo');
    } catch (error) {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeBasicInfoError',
          type: 'toast',
        }),
      );
      return error;
    }
  }

  return (
    <div className="flex w-full justify-center">
      <div className="mb-20 w-full pr-4" data-testid="project-programme-view">
        {activeView === 'overview' ? (
          <div className="project-form mx-auto max-w-xl">
            {briefProgramme && isBriefNotificationVisible && (
              <Notification
                dismissible
                type="alert"
                closeButtonLabelText={t('closeNotification')}
                label={t('projectProgrammeForm.briefNotificationTitle')}
                onClose={() => setIsBriefNotificationVisible(false)}
              >
                <div className="flex flex-col gap-4">
                  <p>{t('projectProgrammeForm.briefNotificationText')}</p>
                  <div>
                    <Button
                      variant={ButtonVariant.Secondary}
                      theme={{ '--background-color': 'var(--color-white)' }}
                      onClick={handleSwitchToExtendedProgramme}
                    >
                      {t('projectProgrammeForm.switchToExtendedProgramme')}
                    </Button>
                  </div>
                </div>
              </Notification>
            )}

            <div className="mt-6">
              <Card
                heading={t('projectProgrammeForm.basicInfoCardTitle')}
                text={t('projectProgrammeForm.basicInfoCardText')}
                theme={{
                  '--background-color': 'var(--color-coat-of-arms-light)',
                  '--padding-horizontal': '2rem',
                  '--padding-vertical': '2rem',
                }}
              >
                <Button
                  variant={ButtonVariant.Secondary}
                  theme={{ '--background-color': 'var(--color-white)' }}
                  onClick={handleFillBasicInfo}
                >
                  {t('projectProgrammeForm.fillBasicInfo')}
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <ProjectProgrammeForm basicInfo={basicInfo} />
        )}
      </div>
    </div>
  );
}
