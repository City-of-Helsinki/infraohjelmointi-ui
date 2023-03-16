import { useState, MouseEvent, FC, useCallback } from 'react';
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

interface IFormState {
  projectsForSubmit: Array<IOption>;
  showAdvanceFields: boolean;
}
interface IDialogButtonState {
  isOpen: boolean;
}
const buildRequestPayload = (form: IGroupForm, projects: Array<IOption>): IGroupRequest => {
  // submit Class or subclass if present, submit division or subDivision if present, submit a name, submit projects

  const payload: IGroupRequest = {
    name: '',
    classRelation: '',
    districtRelation: '',
    projects: [],
  };

  payload.name = form.name;
  payload.classRelation = form.subClass?.value || form.class?.value || '';
  payload.districtRelation = form.subDivision?.value || form.division?.value || '';
  payload.projects = projects.length > 0 ? projects.map((p) => p.value) : [];

  return payload;
};

const DialogContainer: FC<IDialogProps> = ({ isOpen, handleClose }) => {
  const [formState, setFormState] = useState<IFormState>({
    projectsForSubmit: [],
    showAdvanceFields: false,
  });

  const {
    formMethods,
    formValues,
    masterClasses,
    classes,
    subClasses,
    districts,
    divisions,
    subDivisions,
  } = useGroupForm();
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

  const { projectsForSubmit, showAdvanceFields } = formState;

  const onSubmit = useCallback(
    async (form: IGroupForm) => {
      console.log(buildRequestPayload(form, projectsForSubmit));
      dispatch(postGroupThunk(buildRequestPayload(form, projectsForSubmit))).then(() => {
        reset(formValues);
        setFormState((current) => ({
          ...current,
          showAdvanceFields: false,
          projectsForSubmit: [],
        }));
      });
    },

    [projectsForSubmit, dispatch, reset, formValues],
  );
  const onProjectClick = useCallback((value: IOption | undefined) => {
    console.log('Project clicked', value);
    if (value) {
      setFormState((current) => ({
        ...current,
        projectsForSubmit: [...current.projectsForSubmit, value],
      }));
    }
  }, []);

  const onProjectSelectionDelete = useCallback((projectName: string) => {
    setFormState((current) => ({
      ...current,
      projectsForSubmit: current.projectsForSubmit.filter((p) => {
        return p.label !== projectName;
      }),
    }));
  }, []);
  const toggleAdvanceFields = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormState((current) => ({
      ...current,
      showAdvanceFields: !current.showAdvanceFields,
      projectsForSubmit: [],
    }));
    setValue('district', { label: '', value: '' });
    setValue('division', { label: '', value: '' });
    setValue('subDivision', { label: '', value: '' });
    setValue('projectsForSubmit', []);
  }, []);

  const { Header, Content, ActionButtons } = Dialog;

  const handleDialogClose = useCallback(() => {
    setFormState((current) => ({ ...current, showAdvanceFields: false }));
    handleClose();
  }, []);
  const formProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `groupForm.${name}`,
        control: control,
      };
    },
    [control],
  );

  return (
    <div>
      {/* Dialog */}
      <div className="display-flex-col">
        <Dialog
          id="group-create-dialog"
          aria-labelledby={'group-form-dialog-label'}
          isOpen={isOpen}
          close={handleDialogClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
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
                        rules={{ required: 'Tämä kenttä on täytettävä' }}
                      />
                      <SelectField
                        {...formProps('masterClass')}
                        rules={{
                          required: 'Tämä kenttä on täytettävä',
                          validate: {
                            isPopulated: (mc: IOption) =>
                              Object.keys(mc).includes('value') && mc.value !== ''
                                ? true
                                : 'Tämä kenttä on täytettävä',
                          },
                        }}
                        options={masterClasses}
                      />
                      <SelectField
                        {...formProps('class')}
                        rules={{
                          required: 'Tämä kenttä on täytettävä',
                          validate: {
                            isPopulated: (c: IOption) =>
                              Object.keys(c).includes('value') && c.value !== ''
                                ? true
                                : 'Tämä kenttä on täytettävä',
                          },
                        }}
                        options={classes}
                      />
                      <SelectField {...formProps('subClass')} options={subClasses} />
                    </div>
                    {/* Advance fields */}
                    {showAdvanceFields && (
                      <div className="search-form-content">
                        <SelectField
                          {...formProps('district')}
                          rules={{
                            required: 'Tämä kenttä on täytettävä',
                            validate: {
                              isPopulated: (d: IOption) =>
                                Object.keys(d).includes('value') && d.value !== ''
                                  ? true
                                  : 'Tämä kenttä on täytettävä',
                            },
                          }}
                          options={districts}
                        />
                        <SelectField
                          {...formProps('division')}
                          rules={{
                            required: 'Tämä kenttä on täytettävä',
                            validate: {
                              isPopulated: (d: IOption) =>
                                Object.keys(d).includes('value') && d.value !== ''
                                  ? true
                                  : 'Tämä kenttä on täytettävä',
                            },
                          }}
                          options={divisions}
                        />
                        <SelectField {...formProps('subDivision')} options={subDivisions} />
                      </div>
                    )}

                    {/* Divider to click */}
                    <div className="advance-fields-button">
                      <button onClick={toggleAdvanceFields}>
                        {t(`groupForm.openAdvanceSearch`)}
                      </button>
                      {showAdvanceFields ? <IconAngleUp /> : <IconAngleDown />}
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <GroupProjectSearch
                  projectsForSubmit={projectsForSubmit}
                  onProjectClick={onProjectClick}
                  onProjectSelectionDelete={onProjectSelectionDelete}
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
              data-testid="search-projects-button"
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
};

const GroupDialog: FC = () => {
  const { t } = useTranslation();
  const [DialogButtonState, setDialogButtonState] = useState<IDialogButtonState>({
    isOpen: false,
  });
  const { isOpen } = DialogButtonState;

  const handleSetOpen = useCallback(
    () =>
      setDialogButtonState((current) => ({
        isOpen: !current.isOpen,
      })),
    [],
  );
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleSetOpen();
    },
    [handleSetOpen],
  );
  const handleClose = useCallback(() => {
    handleSetOpen();
  }, [handleSetOpen]);
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
