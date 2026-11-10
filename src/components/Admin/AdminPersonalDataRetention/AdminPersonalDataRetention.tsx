import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import {
  IPersonalDataRetentionProject,
  IPersonalDataSummary,
} from '@/interfaces/personalDataRetentionInterfaces';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  confirmPersonalDataRetention,
  getPersonalDataRetentionProjects,
} from '@/services/personalDataRetentionServices';
import { dateStringToMoment } from '@/utils/dates';
import { Button, ButtonVariant, Table } from 'hds-react';
import { TFunction } from 'i18next';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TRANSLATION_PREFIX = 'adminFunctions.personaldataretention';

const summaryKeys: Array<keyof IPersonalDataSummary> = [
  'projectPersons',
  'programmers',
  'handovers',
  'taskPersons',
  'programmeNames',
];

const formatSummary = (
  summary: IPersonalDataSummary,
  translate: TFunction<'translation', undefined>,
) =>
  summaryKeys
    .filter((key) => summary[key] > 0)
    .map((key) => `${translate(`${TRANSLATION_PREFIX}.summary.${key}`)}: ${summary[key]}`)
    .join(', ');

const AdminPersonalDataRetention = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isConfirmed } = useConfirmDialog();
  const [projects, setProjects] = useState<Array<IPersonalDataRetentionProject>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPersonalDataRetentionProjects()
      .then((res) => {
        if (!cancelled) setProjects(res);
      })
      .catch(() => {
        dispatch(
          notifyError({
            message: 'personalDataRetentionLoadError',
            type: 'notification',
            title: 'undefined',
          }),
        );
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const handleRemove = useCallback(
    async (project: IPersonalDataRetentionProject) => {
      const confirmed = await isConfirmed({
        dialogType: 'delete',
        confirmButtonText: `${TRANSLATION_PREFIX}.confirmButton`,
        title: t(`${TRANSLATION_PREFIX}.confirmTitle`),
        description: t(`${TRANSLATION_PREFIX}.confirmDescription`, {
          projectName: project.projectName,
        }),
      });
      if (!confirmed) return;

      dispatch(setLoading({ text: 'Remove personal data', id: 'remove-personal-data' }));
      try {
        await confirmPersonalDataRetention(project.projectId);
        setProjects((current) => current.filter((p) => p.projectId !== project.projectId));
        dispatch(
          notifySuccess({
            message: 'personalDataRemoved',
            title: 'deleteSuccess',
            type: 'toast',
            duration: 5000,
          }),
        );
      } catch (e) {
        dispatch(
          notifyError({
            message: 'personalDataRemoveError',
            type: 'notification',
            title: 'deleteError',
          }),
        );
      }
      dispatch(clearLoading('remove-personal-data'));
    },
    [dispatch, isConfirmed, t],
  );

  const cols = [
    { key: 'projectName', headerName: t(`${TRANSLATION_PREFIX}.projectName`) },
    {
      key: 'warrantyPhaseEnd',
      headerName: t(`${TRANSLATION_PREFIX}.warrantyPhaseEnd`),
      transform: ({ warrantyPhaseEnd }: IPersonalDataRetentionProject) =>
        dateStringToMoment(warrantyPhaseEnd),
    },
    {
      key: 'retentionDueDate',
      headerName: t(`${TRANSLATION_PREFIX}.retentionDueDate`),
      transform: ({ retentionDueDate }: IPersonalDataRetentionProject) =>
        dateStringToMoment(retentionDueDate),
    },
    {
      key: 'personalData',
      headerName: t(`${TRANSLATION_PREFIX}.personalData`),
      transform: ({ personalData }: IPersonalDataRetentionProject) =>
        formatSummary(personalData, t),
    },
    {
      key: 'remove',
      headerName: '',
      transform: (project: IPersonalDataRetentionProject) => (
        <Button
          type="button"
          variant={ButtonVariant.Danger}
          data-testid={`remove-personal-data-${project.projectId}`}
          onClick={() => handleRemove(project)}
        >
          {t(`${TRANSLATION_PREFIX}.removeButton`)}
        </Button>
      ),
    },
  ];

  return (
    <div data-testid="admin-personaldataretention">
      <p>{t(`${TRANSLATION_PREFIX}.info`)}</p>
      {loaded && projects.length === 0 ? (
        <p data-testid="personal-data-retention-empty">{t(`${TRANSLATION_PREFIX}.empty`)}</p>
      ) : (
        <Table
          cols={cols}
          rows={projects}
          indexKey="projectId"
          renderIndexCol={false}
          id="admin-personal-data-retention-table"
        />
      )}
    </div>
  );
};

export default memo(AdminPersonalDataRetention);
