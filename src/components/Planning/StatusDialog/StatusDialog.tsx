import { useAppDispatch } from '@/hooks/common';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import { IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { patchProjectThunk } from '@/reducers/projectSlice';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC, useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IProjectPhaseForm {
  phase: string;
}

interface IStatusDialogProps {
  project: IProject;
  phases: Array<IListItem>;
  close: () => void;
}

/**
 * Refactor this component when more small dialogs are needed.
 * */
const StatusDialog: FC<IStatusDialogProps> = ({ project, phases, close }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const dispatch = useAppDispatch();
  const phase = project?.phase?.id;
  const name = project?.name;
  const id = project?.id;
  const formValues = { phase: phase || '' };
  const { control, reset, handleSubmit } = useForm({ defaultValues: formValues });

  useEffect(() => {
    phase && reset(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useClickOutsideRef(dialogRef, close);

  const onSubmit = useCallback(
    async (form: IProjectPhaseForm) => {
      id && dispatch(patchProjectThunk({ data: form, id: id }));
    },
    [dispatch, id],
  );

  console.log('Project ID: ', id);
  console.log('Project Phase: ', phase);
  console.log('Project Name: ', name);

  return (
    <div ref={dialogRef} className="status-dialog-container">
      <div className="status-dialog-header">
        <div className="hide-overflow">
          <p className="title">{name}</p>
          <p className="description">Nykystatus</p>
        </div>
        <IconCross className="close-icon" onClick={close} />
      </div>
      <Controller
        control={control}
        name="phase"
        render={({ field: { value, onChange } }) => (
          <ul className="status-dialog-list">
            {phases.map((p) => (
              <li key={p.id} className={`list-item ${value === p.id && 'selected'}`}>
                <button className="selection-button" onClick={() => onChange(p.id)}>
                  <IconPlaybackRecord className="icon-width" />
                  <p className={`item-text ${value === p.id && 'selected'}`}>
                    {t(`enums.${p.value}`)}
                  </p>
                </button>
                {value === p.id && <IconCheck className="icon-width check-icon" />}
              </li>
            ))}
          </ul>
        )}
      />
      <div className="status-dialog-footer">
        <Button size="small" onClick={handleSubmit(onSubmit)}>
          Tallenna
        </Button>
      </div>
    </div>
  );
};

export default StatusDialog;
