import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import { IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IStatusDialogProps {
  project: IProject;
  phases: Array<IListItem>;
  close: () => void;
}

const StatusDialog: FC<IStatusDialogProps> = ({ project, phases, close }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);

  useClickOutsideRef(dialogRef, close);

  return (
    <div ref={dialogRef} className="status-dialog-container ">
      <div className="status-dialog-header">
        <div className="hide-overflow">
          <p className="title">{project.name}</p>
          <p className="description">Nykystatus</p>
        </div>
        <IconCross className="close-icon" onClick={close} />
      </div>

      <ul className="status-dialog-list">
        {phases.map((p) => (
          <li key={p.id} className={`list-item ${project?.phase?.id === p.id && 'selected'}`}>
            <div className="inner">
              <IconPlaybackRecord className="icon-width" />
              <p className={`item-text ${project?.phase?.id === p.id && 'selected'}`}>
                {t(`enums.${p.value}`)}
              </p>
            </div>
            {project?.phase?.id === p.id && <IconCheck className="icon-width check-icon" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusDialog;
