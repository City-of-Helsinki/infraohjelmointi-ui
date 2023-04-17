import { useState, MouseEvent, FC, useCallback, useMemo, memo } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import './styles.css';

import { TextField, SelectField } from '@/components/shared';
import { IOption } from '@/interfaces/common';
import { IconAngleUp, IconAngleDown } from 'hds-react/icons';
import GroupProjectSearch from './GroupProjectSearch';
import useGroupForm from '@/forms/useGroupForm';
import { useAppDispatch } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { postGroupThunk } from '@/reducers/groupSlice';
import { IGroupRequest } from '@/interfaces/groupInterfaces';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

const buildRequestPayload = (form: IGroupForm): IGroupRequest => {
  // submit Class or subclass if present, submit division or district if present, submit a name, submit projects
  return {
    name: form.name,
    classRelation: form.subClass?.value || '',
    locationRelation: form.division?.value || form.district?.value || '',
    projects: form.projectsForSubmit.length > 0 ? form.projectsForSubmit.map((p) => p.value) : [],
  };
};

const DialogContainer: FC<IDialogProps> = memo(({ isOpen, handleClose }) => {
  const [showAdvanceFields, setShowAdvanceFields] = useState(false);

  const { formMethods, formValues, classOptions, locationOptions } = useGroupForm();
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
    getValues,
    setValue,
    control,
  } = formMethods;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const onSubmit = useCallback(
    async (form: IGroupForm) => {
      dispatch(postGroupThunk(buildRequestPayload(form))).then(() => {
        reset(formValues);
        setShowAdvanceFields(false);
      });
    },

    [dispatch, reset, formValues],
  );

  const toggleAdvanceFields = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowAdvanceFields((current) => !current);
      setValue('district', { label: '', value: '' });
      setValue('division', { label: '', value: '' });
      setValue('subDivision', { label: '', value: '' });
      setValue('projectsForSubmit', []);
    },
    [setValue],
  );

  const { Header, Content, ActionButtons } = Dialog;

  const handleDialogClose = useCallback(() => {
    setShowAdvanceFields(false);
    handleClose();
  }, [handleClose]);
  const formProps = useCallback(
    (name: string) => ({
      name: name,
      label: `groupForm.${name}`,
      control: control,
    }),
    [control],
  );

  const customValidation = useCallback(
    (d: IOption, fieldName: string) =>
      Object.keys(d).includes('value') && d.value !== ''
        ? true
        : t('required', { value: fieldName }) || '',
    [t],
  );
  const advanceFieldIcons = useMemo(
    () => (showAdvanceFields ? <IconAngleUp /> : <IconAngleDown />),
    [showAdvanceFields],
  );

  return (
    <div>
      {/* Dialog */}
      <div>
        <Dialog
          data-testid="group-create-dialog"
          id="group-create-dialog"
          aria-labelledby={'group-form-dialog-label'}
          isOpen={isOpen}
          close={handleDialogClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className={showAdvanceFields ? 'expanded' : ''}
          scrollable
        >
          {/* Header */}
          <Header id={'group-form-dialog-label'} title={t(`createSummingGroups`)} />

          <Content>
            <div className="dialog-section">
              <br />
              <div>
                <p className="font-bold">{t(`groupForm.groupCreationDescription1`)}</p>
                <p className="font-bold">{t(`groupForm.groupCreationDescription2`)}</p>
              </div>
              <div>
                <form
                  id="group-create-form"
                  className="search-form"
                  onSubmit={handleSubmit(onSubmit)}
                  data-testid="group-create-form"
                >
                  <div>
                    {/* Basic fields */}
                    <div className="search-form-content">
                      <TextField
                        {...formProps('name')}
                        rules={{ required: t('required', { value: 'Ryhman nimi' }) || '' }}
                      />
                      <SelectField
                        {...formProps('masterClass')}
                        rules={{
                          required: t('required', { value: 'Pääluokka' }) || '',
                          validate: {
                            isPopulated: (mc: IOption) => customValidation(mc, 'Pääluokka'),
                          },
                        }}
                        options={classOptions.masterClasses}
                      />
                      <SelectField
                        {...formProps('class')}
                        rules={{
                          required: t('required', { value: 'Luokka' }) || '',
                          validate: {
                            isPopulated: (c: IOption) => customValidation(c, 'Luokka'),
                          },
                        }}
                        options={classOptions.classes}
                      />
                      <SelectField
                        {...formProps('subClass')}
                        options={classOptions.subClasses}
                        rules={{
                          required: t('required', { value: 'Alaluokka' }) || '',
                          validate: {
                            isPopulated: (c: IOption) => customValidation(c, 'Alaluokka'),
                          },
                        }}
                      />
                    </div>
                    {/* Advance fields */}
                    {showAdvanceFields && (
                      <div className="search-form-content">
                        <SelectField
                          {...formProps('district')}
                          rules={{
                            required: t('required', { value: 'Suurpiiri' }) || '',
                            validate: {
                              isPopulated: (d: IOption) => customValidation(d, 'Suurpiiri'),
                            },
                          }}
                          options={locationOptions.districts}
                        />
                        <SelectField
                          {...formProps('division')}
                          rules={
                            locationOptions.divisions.length > 0
                              ? {
                                  required: t('required', { value: 'Kaupunginosa' }) || '',
                                  validate: {
                                    isPopulated: (d: IOption) =>
                                      customValidation(d, 'Kaupunginosa'),
                                  },
                                }
                              : {}
                          }
                          options={locationOptions.divisions}
                        />
                        <SelectField
                          {...formProps('subDivision')}
                          options={locationOptions.subDivisions}
                        />
                      </div>
                    )}

                    {/* Divider to click */}
                    <div className="advance-fields-button">
                      <button onClick={toggleAdvanceFields}>
                        {t(`groupForm.openAdvanceSearch`)}
                      </button>
                      {advanceFieldIcons}
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <GroupProjectSearch
                  getValues={getValues}
                  control={control}
                  showAdvanceFields={showAdvanceFields}
                />
              </div>
            </div>
          </Content>

          <ActionButtons>
            <Button
              onClick={handleSubmit(onSubmit)}
              data-testid="create-group-button"
              disabled={!isDirty}
            >
              {t('search')}
            </Button>
            <Button onClick={handleDialogClose} variant="secondary" data-testid="cancel-search">
              {t('cancel')}
            </Button>
          </ActionButtons>
        </Dialog>
      </div>
    </div>
  );
});

DialogContainer.displayName = 'Group Dialog';

const GroupDialog: FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetOpen = useCallback(() => setIsOpen((current) => !current), [setIsOpen]);
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      toggleSetOpen();
    },
    [toggleSetOpen],
  );
  const handleClose = useCallback(() => {
    setIsOpen((current) => !current);
  }, [setIsOpen]);
  return (
    <div>
      {isOpen && <DialogContainer isOpen={isOpen} handleClose={handleClose} />}
      <div>
        <div data-testid="open-group-form-dialog-button"></div>
        <Button onClick={onOpenGroupForm} size="small">
          {t(`createSummingGroups`)}
        </Button>
      </div>
    </div>
  );
};

export default GroupDialog;
