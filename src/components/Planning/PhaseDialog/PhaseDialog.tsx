import { useAppDispatch } from '@/hooks/common';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import usePhaseForm from '@/forms/usePhaseForm';
import { IListItem } from '@/interfaces/common';
import { IPhaseForm } from '@/interfaces/formInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { patchProjectThunk } from '@/reducers/projectSlice';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC, useCallback, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IPhaseDialogProps {
  project: IProject;
  phases: Array<IListItem>;
  close: () => void;
}

/**
 * Refactor this component when more small dialogs are needed.
 * */
const PhaseDialog: FC<IPhaseDialogProps> = ({ project, phases, close }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const dispatch = useAppDispatch();
  const phase = project?.phase?.id;
  const name = project?.name;
  const id = project?.id;
  const { formMethods } = usePhaseForm(phase);
  const { control, handleSubmit } = formMethods;

  useClickOutsideRef(dialogRef, close);

  const onSubmit = useCallback(
    async (form: IPhaseForm) => {
      id && dispatch(patchProjectThunk({ data: form, id: id }));
    },
    [dispatch, id],
  );

  return (
    <div ref={dialogRef} className="phase-dialog-container">
      <div className="phase-dialog-header">
        <div className="hide-overflow">
          <p className="title">{name}</p>
          <p className="description">{t('currentStatus')}</p>
        </div>
        <IconCross className="close-icon" onClick={close} />
      </div>
      <Controller
        control={control}
        name="phase"
        render={({ field: { value, onChange } }) => (
          <ul className="phase-dialog-list">
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
      <div className="phase-dialog-footer">
        <Button size="small" onClick={handleSubmit(onSubmit)}>
          {t('save')}
        </Button>
      </div>
    </div>
  );
};

export default PhaseDialog;
