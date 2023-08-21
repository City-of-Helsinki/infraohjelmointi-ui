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

interface IAdminHashtagsTableProps {
  hashtags: Array<IHashTag>;
}

const AdminHashtagsTable: FC<IAdminHashtagsTableProps> = ({ hashtags }) => {
  const { t } = useTranslation();

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

  const archiveHashtag = useCallback((archived: boolean, id: string) => {
    console.log('TODO: patching hashtag with id: ', id);
  }, []);

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
    [],
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
