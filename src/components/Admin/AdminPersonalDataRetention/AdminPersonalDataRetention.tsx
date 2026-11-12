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
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
    .map((key) => {
      const label = translate(`${TRANSLATION_PREFIX}.summary.${key}`);
      return `${label}: ${summary[key]}`;
    })
    .join(', ');

interface RemoveButtonProps {
  project: IPersonalDataRetentionProject;
  onRemove: (project: IPersonalDataRetentionProject) => void;
  label: string;
}

const RemoveButton = ({ project, onRemove, label }: RemoveButtonProps) => (
  <Button
    type="button"
    variant={ButtonVariant.Danger}
    data-testid={`remove-personal-data-${project.projectId}`}
    onClick={() => onRemove(project)}
  >
    {label}
  </Button>
);

const getTableColumns = (
  translate: TFunction<'translation', undefined>,
  onRemove: (project: IPersonalDataRetentionProject) => void,
) => [
  { key: 'projectName', headerName: translate(`${TRANSLATION_PREFIX}.projectName`) },
  {
    key: 'warrantyPhaseEnd',
    headerName: translate(`${TRANSLATION_PREFIX}.warrantyPhaseEnd`),
    transform: ({ warrantyPhaseEnd }: IPersonalDataRetentionProject) =>
      dateStringToMoment(warrantyPhaseEnd),
  },
  {
    key: 'retentionDueDate',
    headerName: translate(`${TRANSLATION_PREFIX}.retentionDueDate`),
    transform: ({ retentionDueDate }: IPersonalDataRetentionProject) =>
      dateStringToMoment(retentionDueDate),
  },
  {
    key: 'personalData',
    headerName: translate(`${TRANSLATION_PREFIX}.personalData`),
    transform: ({ personalData }: IPersonalDataRetentionProject) =>
      formatSummary(personalData, translate),
  },
  {
    key: 'remove',
    headerName: '',
    transform: (project: IPersonalDataRetentionProject) => (
      <RemoveButton
        project={project}
        onRemove={onRemove}
        label={translate(`${TRANSLATION_PREFIX}.removeButton`)}
      />
    ),
  },
];

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
        // Details stay out of the UI; the user gets a generic notification
        console.error('Removing personal data failed', e);
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

  const cols = useMemo(() => getTableColumns(t, handleRemove), [t, handleRemove]);

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
