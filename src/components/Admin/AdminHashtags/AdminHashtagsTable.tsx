import { dateStringToMoment } from '@/utils/dates';
import {
  Button,
  IconCheckCircle,
  IconCheckCircleFill,
  IconCrossCircle,
  IconCrossCircleFill,
  Table,
} from 'hds-react';
import { FC, memo, useCallback, useMemo } from 'react';
import { IHashTag } from '@/interfaces/hashTagsInterfaces';
import './styles.css';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/common';
import { patchHashTagThunk } from '@/reducers/hashTagsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';

interface IAdminHashtagsTableProps {
  hashtags: Array<IHashTag>;
}

const AdminHashtagsTable: FC<IAdminHashtagsTableProps> = ({ hashtags }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const getArchivedIcon = useCallback((archived: boolean) => {
    return (
      <div className="archived-icon-container">
        {archived ? (
          <>
            <IconCrossCircleFill color="var(--color-error)" /> Arkistoitu
          </>
        ) : (
          <>
            <IconCheckCircleFill color="var(--color-success)" /> Käytössä
          </>
        )}
      </div>
    );
  }, []);

  const archiveHashtag = useCallback(
    async (archived: boolean, id: string) => {
      const request = { data: { archived: !archived }, id };
      try {
        await dispatch(patchHashTagThunk(request));
        dispatch(
          notifySuccess({
            message: 'hashtagPatchSuccess',
            title: 'hashtagPatchSuccess',
            type: 'toast',
            duration: 1500,
          }),
        );
      } catch (e) {
        dispatch(
          notifyError({
            message: 'hashtagPatchError',
            title: 'patchError',
            type: 'toast',
            duration: 1500,
          }),
        );
      }
    },
    [dispatch],
  );

  const getArchiveButton = useCallback(
    (archived: boolean, id: string) => {
      return (
        <div className="archived-button-container">
          <Button
            type="button"
            variant="supplementary"
            className="archived-button"
            iconLeft={archived ? <IconCheckCircle /> : <IconCrossCircle />}
            onClick={() => archiveHashtag(archived, id)}
          >
            {archived ? 'Palauta' : 'Arkistoi'}
          </Button>
        </div>
      );
    },
    [archiveHashtag],
  );

  const hashtagColumns = useMemo(
    () => [
      { key: 'id', headerName: 'id' },
      { key: 'value', headerName: t('hashtag') },
      {
        key: 'usageCount',
        headerName: t('projectCount'),
        transform: ({ usageCount }: { usageCount: number }) => {
          return <div className="text-right">{usageCount}</div>;
        },
      },
      {
        key: 'archived',
        headerName: t('status'),
        transform: ({ archived }: { archived: boolean }) => {
          return getArchivedIcon(archived);
        },
      },
      {
        key: 'createdDate',
        headerName: t('created'),
        transform: ({ createdDate }: { createdDate: string }) => {
          return <div>{dateStringToMoment(createdDate)}</div>;
        },
      },
      {
        key: 'restore',
        headerName: '',
        transform: ({ archived, id }: { archived: boolean; id: string }) => {
          return getArchiveButton(archived, id);
        },
      },
    ],
    [getArchiveButton, getArchivedIcon],
  );

  return (
    <div className="admin-hashtags-table-container">
      <Table
        cols={hashtagColumns}
        rows={hashtags}
        indexKey="id"
        renderIndexCol={false}
        id="admin-hashtags-table"
      />
    </div>
  );
};
export default memo(AdminHashtagsTable);
