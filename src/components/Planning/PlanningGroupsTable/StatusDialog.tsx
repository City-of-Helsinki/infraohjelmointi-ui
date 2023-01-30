import { IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface IStatusDialogProps {
  project: IProject;
  phases: Array<IListItem>;
}

const StatusDialog: FC<IStatusDialogProps> = ({ project, phases }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: 'absolute',
        maxWidth: '16rem',
        background: 'var(--color-white)',
        border: '0.1rem solid var(--color-black)',
        zIndex: '999',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        transform: 'translateX(1.5rem)',
      }}
    >
      <div
        style={{
          width: '100%',
          borderBottom: '0.08rem solid var(--color-black-20)',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0.3rem 0',
        }}
      >
        <div>
          <p style={{ paddingLeft: '0.6rem' }}>{project.name}</p>
          <p style={{ fontWeight: 'bold', paddingLeft: '0.6rem' }}>Nykystatus</p>
        </div>
        <IconCross
          style={{ paddingRight: '0.6rem', cursor: 'pointer' }}
          onClick={() => console.log('close status dialog')}
        />
      </div>

      <div
        style={{
          borderBottom: '0.08rem solid var(--color-black-20)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.7rem 0 0 0',
        }}
      >
        {phases.map((p) => (
          <div
            key={p.id}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              background: project?.phase?.id === p.id ? 'var(--color-bus-medium-light)' : 'white',
            }}
          >
            <div
              style={{
                display: 'flex',
                paddingLeft: '0.7rem',
                alignItems: 'center',
                gap: '0.7rem',
                overflow: 'hidden',
              }}
            >
              <IconPlaybackRecord style={{ minWidth: '1.5rem' }} />
              <p
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontSize: '14px',
                  fontWeight: project?.phase?.id === p.id ? 'bold' : 'normal',
                  paddingRight: project?.phase?.id === p.id ? '0' : '2rem',
                }}
              >
                {t(`enums.${p.value}`)}
              </p>
            </div>
            {project?.phase?.id === p.id && (
              <IconCheck style={{ paddingRight: '0.7rem', minWidth: '1.5rem' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDialog;
