import { dateStringToMoment } from '@/utils/dates';
import {
  Button,
  ButtonVariant,
  IconCheckCircle,
  IconCheckCircleFill,
  IconCrossCircle,
  IconCrossCircleFill,
  Table,
} from 'hds-react';
import { FC, memo } from 'react';
import { IHashTag } from '@/interfaces/hashTagsInterfaces';
import './styles.css';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/common';
import { patchHashTagThunk } from '@/reducers/hashTagsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { TFunction } from 'i18next';

interface IAdminHashtagsTableProps {
  hashtags: Array<IHashTag>;
}

const archiveHashtag =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (archived: boolean, id: string, dispatch: any) => {
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
  };

const getArchivedIcon = (archived: boolean, translate: TFunction<'translation', undefined>) => {
  return (
    <div className="archived-icon-container">
      {archived ? (
        <>
          <IconCrossCircleFill color="var(--color-error)" />
          {translate('archived')}
        </>
      ) : (
        <>
          <IconCheckCircleFill color="var(--color-success)" />
          {translate('inUse')}
        </>
      )}
    </div>
  );
};

const getArchiveButton = (
  archived: boolean,
  id: string,
  translate: TFunction<'translation', undefined>,
  dispatch: unknown,
) => {
  return (
    <div className="archived-button-container">
      <Button
        type="button"
        variant={ButtonVariant.Supplementary}
        className="archived-button"
        data-testid={`archive-hashtag-${id}`}
        iconStart={archived ? <IconCheckCircle /> : <IconCrossCircle />}
        onClick={() => archiveHashtag(archived, id, dispatch)}
      >
        {archived ? translate('restore') : translate('archive')}
      </Button>
    </div>
  );
};

const hashtagColumns = (translate: TFunction<'translation', undefined>, dispatch: unknown) => [
  { key: 'id', headerName: 'id' },
  { key: 'value', headerName: translate('hashtag') },
  {
    key: 'usageCount',
    headerName: translate('projectCount'),
    transform: ({ usageCount }: { usageCount: number }) => {
      return <div className="text-right">{usageCount}</div>;
    },
  },
  {
    key: 'archived',
    headerName: translate('status'),
    transform: ({ archived }: { archived: boolean }) => {
      return getArchivedIcon(archived, translate);
    },
  },
  {
    key: 'createdDate',
    headerName: translate('created'),
    transform: ({ createdDate }: { createdDate: string }) => {
      return <div>{dateStringToMoment(createdDate)}</div>;
    },
  },
  {
    key: 'archive',
    headerName: '',
    transform: ({ archived, id }: { archived: boolean; id: string }) => {
      return getArchiveButton(archived, id, translate, dispatch);
    },
  },
];

const AdminHashtagsTable: FC<IAdminHashtagsTableProps> = ({ hashtags }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <div className="admin-hashtags-table-container">
      <Table
        cols={hashtagColumns(t, dispatch)}
        rows={hashtags}
        indexKey="id"
        renderIndexCol={false}
        id="admin-hashtags-table"
      />
    </div>
  );
};
export default memo(AdminHashtagsTable);
