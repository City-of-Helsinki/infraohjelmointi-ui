import { useAppDispatch } from '@/hooks/common';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import usePhaseForm from '@/forms/usePhaseForm';
import { IOption } from '@/interfaces/common';
import { IPhaseForm } from '@/interfaces/formInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconCross, IconPlaybackRecord } from 'hds-react/icons';
import { FC, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import './styles.css';
import useIsInViewPort from '@/hooks/useIsInViewport';

interface IPhaseDialogProps {
  project: IProject;
  phases: Array<IOption>;
  atElement: Element;
  close: () => void;
}

/**
 * Refactor this component when more small dialogs are needed.
 * */
const PhaseDialog: FC<IPhaseDialogProps> = ({ project, phases, close, atElement }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const dispatch = useAppDispatch();
  const phase = project?.phase?.id;
  const name = project?.name;
  const id = project?.id;
  const { formMethods } = usePhaseForm(phase);
  const { control, handleSubmit } = formMethods;

  useClickOutsideRef(dialogRef, close);
  useEffect(() => {
    const onScroll = () => {
      close && close();
    };
    document.addEventListener('scroll', onScroll);

    return () => {
      document.removeEventListener('scroll', onScroll);
    };
  }, [close]);

  const { left, top } = useMemo(() => atElement.getBoundingClientRect(), [atElement]);
  const { isInViewPort, dimensions } = useIsInViewPort(dialogRef);

  const onSubmit = useCallback(
    async (form: IPhaseForm) => {
      id && dispatch(silentPatchProjectThunk({ data: form, id: id })).then(() => close());
    },
    [close, dispatch, id],
  );

  const isElementOutOfView = !!(!isInViewPort && dimensions);

  const translatePixels =
    dimensions && dimensions.top > 0
      ? `-${Math.abs(dimensions.bottom - window.innerHeight) + 20}px`
      : dimensions
      ? `${Math.abs(dimensions.top) + 20}px`
      : '0px';

  return (
    <div
      ref={dialogRef}
      className="phase-dialog-container"
      style={{
        visibility: dimensions ? 'visible' : 'hidden',
        left: left,
        top: top,
        transform: `translate(1.5rem, ${isElementOutOfView && translatePixels})`,
      }}
    >
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
              <li key={p.value} className={`list-item ${value === p.value && 'selected'}`}>
                <button className="selection-button" onClick={() => onChange(p.value)}>
                  <IconPlaybackRecord className="icon-width" />
                  <p className={`item-text ${value === p.value && 'selected'}`}>{p.label}</p>
                </button>
                {value === p.value && <IconCheck className="icon-width check-icon" />}
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

export default memo(PhaseDialog);
