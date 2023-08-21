import { useAppSelector } from '@/hooks/common';
import { selectAllHashtags } from '@/reducers/hashTagsSlice';
import { dateStringToMoment } from '@/utils/dates';
import { Table } from 'hds-react';
import { memo } from 'react';
import './styles.css';

const AdminHashtagsTable = () => {
  const cols = [
    { key: 'id', headerName: 'Not rendered' },
    { key: 'value', headerName: 'Tunniste' },
    {
      key: 'usageCount',
      headerName: 'Projektien määrä',
      transform: ({ usageCount }: { usageCount: number }) => {
        return <div className="text-right">{usageCount}</div>;
      },
    },
    {
      key: 'archived',
      headerName: 'Tila',
      transform: ({ archived }: { archived: boolean }) => {
        return <div>{archived ? 'Arkistoitu' : 'Käytössä'}</div>;
      },
    },
    {
      key: 'createdDate',
      headerName: 'Luotu',
      transform: ({ createdDate }: { createdDate: string }) => {
        return <div>{dateStringToMoment(createdDate)}</div>;
      },
    },
    {
      key: 'restore',
      headerName: '',
      transform: ({ archived }: { archived: boolean }) => {
        return <div style={{ textAlign: 'right' }}>{archived ? 'Palauta' : 'Arkistoi'}</div>;
      },
    },
  ];

  const hashtags = useAppSelector(selectAllHashtags);

  return (
    <div className="mt-8">
      <Table cols={cols} rows={hashtags} indexKey="id" renderIndexCol={false} id="hashtags-table" />
    </div>
  );
};
export default memo(AdminHashtagsTable);
