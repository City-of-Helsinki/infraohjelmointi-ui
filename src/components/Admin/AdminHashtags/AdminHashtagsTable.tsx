import { Table } from 'hds-react';
import { memo } from 'react';

const AdminHashtagsTable = () => {
  const cols = [
    { key: 'id', headerName: 'Not rendered' },
    { key: 'name', headerName: 'Tunniste' },
    {
      key: 'projectAmount',
      headerName: 'Projektien määrä',
      transform: ({ projectAmount }: { projectAmount: number }) => {
        return <div style={{ textAlign: 'right' }}>{projectAmount}</div>;
      },
    },
    {
      key: 'status',
      headerName: 'Tila',
      transform: ({ status }: { status: boolean }) => {
        return <div style={{ fontWeight: 'bold' }}>{status ? 'Käytössä' : 'Arkistoitu'}</div>;
      },
    },
    {
      key: 'created',
      headerName: 'Luotu',
    },
    {
      key: 'profession',
      headerName: '',
      transform: ({ archived }: { archived: boolean }) => {
        return (
          <div style={{ fontWeight: 'bold', textAlign: 'right' }}>
            {archived ? 'Palauta' : 'Arkistoi'}
          </div>
        );
      },
    },
  ];

  const rows = [
    {
      id: 1000,
      name: 'Lauri',
      projectAmount: 12,
      status: true,
      created: '1.1.2023',
      archived: false,
    },
    {
      id: 1001,
      name: 'Maria',
      projectAmount: 20,
      status: false,
      created: '1.1.2023',
      archived: true,
    },
    {
      id: 1002,
      name: 'Anneli',
      projectAmount: 16,
      status: true,
      created: '1.1.2023',
      archived: false,
    },
    {
      id: 1003,
      name: 'Osku',
      projectAmount: 9,
      status: true,
      created: '1.1.2023',
      archived: false,
    },
  ];

  return (
    <div className="mt-8">
      <Table cols={cols} rows={rows} indexKey="id" renderIndexCol={false} />
    </div>
  );
};
export default memo(AdminHashtagsTable);
