import { useState, MouseEvent, FC, useCallback, useMemo, memo, useEffect } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import { TextField, SelectField } from '@/components/shared';
import { IOption } from '@/interfaces/common';
import { IconAngleUp, IconAngleDown } from 'hds-react/icons';
import GroupProjectSearch from './GroupProjectSearch';
import useGroupForm from '@/forms/useGroupForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { postGroupThunk, updateGroup } from '@/reducers/groupSlice';
import { IGroup, IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import { useNavigate } from 'react-router';
import { patchGroup } from '@/services/groupService';
import './styles.css';
import { selectPlanningMode } from '@/reducers/planningSlice';
import { createSearchParams } from 'react-router-dom';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
  editMode: boolean;
  id?: string | null;
  projects?: IOption[];
}

const buildRequestPayload = (
  form: IGroupForm,
  id: string | null,
): IGroupRequest | IGroupPatchRequestObject => {
  // submit Class or subclass if present, submit division or district if present, submit a name, submit projects
  const data = {
    name: form.name,
    classRelation: form.subClass?.value || '',
    locationRelation: form.division?.value || form.district?.value || '',
    projects: form.projectsForSubmit.length > 0 ? form.projectsForSubmit.map((p) => p.value) : [],
  };
  if (id) {
    return {
      id,
      data,
    };
  }
  return data;
};

const DialogContainer: FC<IDialogProps> = memo(
  ({ isOpen, handleClose, editMode, projects, id }) => {
    const mode = useAppSelector(selectPlanningMode);
    const navigate = useNavigate();

    const [showAdvanceFields, setShowAdvanceFields] = useState(false);
    const { formMethods, formValues, classOptions, locationOptions } = useGroupForm(projects, id);
    const { handleSubmit, reset, getValues, setValue, control, watch } = formMethods;

    const nameField = watch('name');
    const subClassField = watch('subClass');
    const districtField = watch('district');
    const divisionField = watch('division');

    useEffect(() => {
      if (formValues.district.value || formValues.division.value) {
        setShowAdvanceFields(true);
      }
    }, [formValues.district.value, formValues.division.value]);

    const isButtonDisabled = useCallback(() => {
      return (
        !nameField ||
        (showAdvanceFields &&
          (!districtField.value ||
            (locationOptions.divisions.length > 0 && !divisionField.value) ||
            !subClassField.value)) ||
        (!showAdvanceFields && !subClassField.value)
      );
    }, [
      districtField.value,
      divisionField.value,
      nameField,
      showAdvanceFields,
      subClassField.value,
      locationOptions,
    ]);

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const navigateToGroupLocation = useCallback(
      (form: IGroupForm) => {
        const searchParams = {
          masterClass: form.masterClass.value,
          class: form.class.value,
          subClass: form.subClass.value,
          ...(form.district.value && {
            district: form.district.value,
          }),
        };

        navigate({
          pathname: `/${mode}`,
          search: `${createSearchParams(searchParams)}`,
        });
      },
      [id, mode, navigate],
    );

    const handleDialogClose = useCallback(() => {
      reset(formValues);
      setShowAdvanceFields(false);
      handleClose();
    }, [handleClose, formValues, reset]);

    const onSubmit = useCallback(
      (form: IGroupForm) => {
        if (editMode && id) {
          patchGroup(buildRequestPayload(form, id) as IGroupPatchRequestObject)
            .then((group: IGroup) => {
              dispatch(updateGroup(group));
              handleDialogClose();
            })
            .catch(Promise.reject);
        } else {
          dispatch(postGroupThunk(buildRequestPayload(form, null) as IGroupRequest))
            .then(() => {
              handleDialogClose();
              navigateToGroupLocation(form);
            })
            .catch(Promise.reject);
        }
      },

      [dispatch, handleDialogClose, navigate, editMode, id],
    );

    const handleOnSubmitForm = useCallback(
      (e: unknown) => {
        handleSubmit(onSubmit).call(e).catch(Promise.reject);
      },
      [handleSubmit, onSubmit],
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

    const formProps = useCallback(
      (name: string) => ({
        name: name,
        label: `groupForm.${name}`,
        control: control,
        shouldTranslate: false,
      }),
      [control],
    );

    const customValidation = useCallback(
      (d: IOption, fieldName: string) =>
        Object.keys(d).includes('value') && d.value !== ''
          ? true
          : t('validation.required', { value: fieldName }) || '',
      [t],
    );
    const getDivisionValidation = useCallback(() => {
      if (locationOptions.divisions.length > 0)
        return {
          required: t('validation.required', { value: 'Kaupunginosa' }) || '',
          validate: {
            isPopulated: (d: IOption) => customValidation(d, 'Kaupunginosa'),
          },
        };
      return {};
    }, [locationOptions, customValidation, t]);
    const advanceFieldIcons = useMemo(
      () => (showAdvanceFields ? <IconAngleUp /> : <IconAngleDown />),
      [showAdvanceFields],
    );

    return (
      <div>
        {/* Dialog */}
        <div>
          <Dialog
            data-testid="summing-group-dialog"
            id="summing-group-dialog"
            aria-labelledby={'group-form-dialog-label'}
            isOpen={isOpen}
            close={handleDialogClose}
            closeButtonLabelText={t('closeGroupFormWindow')}
            className={showAdvanceFields ? 'expanded' : ''}
            scrollable
          >
            {/* Header */}
            <Header
              id={'group-form-dialog-label'}
              title={editMode ? t(`editSummingGroup`) : t(`createSummingGroups`)}
            />

            <Content>
              <div className="dialog-section">
                <br />
                <div>
                  <p className="font-bold">{t(`groupForm.groupCreationDescription1`)}</p>
                  <p className="font-bold">{t(`groupForm.groupCreationDescription2`)}</p>
                </div>
                <div>
                  <form
                    id="summing-group-form"
                    className="search-form"
                    onSubmit={handleOnSubmitForm}
                    data-testid="summing-group-form"
                  >
                    <div>
                      {/* Basic fields */}
                      <div className="search-form-content">
                        <TextField
                          {...formProps('name')}
                          rules={{
                            required: t('validation.required', { value: 'Ryhman nimi' }) || '',
                          }}
                        />
                        <SelectField
                          clearable={!editMode}
                          disabled={editMode}
                          {...formProps('masterClass')}
                          rules={{
                            required: t('validation.required', { value: 'Pääluokka' }) || '',
                            validate: {
                              isPopulated: (mc: IOption) => customValidation(mc, 'Pääluokka'),
                            },
                          }}
                          options={classOptions.masterClasses}
                        />
                        <SelectField
                          clearable={!editMode}
                          disabled={editMode}
                          {...formProps('class')}
                          rules={{
                            required: t('validation.required', { value: 'Luokka' }) || '',
                            validate: {
                              isPopulated: (c: IOption) => customValidation(c, 'Luokka'),
                            },
                          }}
                          options={classOptions.classes}
                        />
                        <SelectField
                          clearable={!editMode}
                          disabled={editMode}
                          {...formProps('subClass')}
                          options={classOptions.subClasses}
                          rules={{
                            required: t('validation.required', { value: 'Alaluokka' }) || '',
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
                              required: t('validation.required', { value: 'Suurpiiri' }) || '',
                              validate: {
                                isPopulated: (d: IOption) => customValidation(d, 'Suurpiiri'),
                              },
                            }}
                            options={locationOptions.districts}
                          />
                          <SelectField
                            {...formProps('division')}
                            rules={getDivisionValidation()}
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
                          {t(`groupForm.openAdvanceFilters`)}
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
                    divisions={locationOptions.divisions}
                  />
                </div>
              </div>
            </Content>

            <ActionButtons>
              <Button
                onClick={handleOnSubmitForm}
                data-testid={editMode ? 'save-group-button' : 'create-group-button'}
                disabled={isButtonDisabled()}
              >
                {editMode ? t('save') : t('groupForm.createGroup')}
              </Button>
              <Button onClick={handleDialogClose} variant="secondary" data-testid="cancel-search">
                {t('cancel')}
              </Button>
            </ActionButtons>
          </Dialog>
        </div>
      </div>
    );
  },
);

DialogContainer.displayName = 'Group Dialog';

const GroupDialog: FC<IDialogProps> = ({ isOpen, handleClose, editMode, id, projects }) => {
  return (
    <div>
      {isOpen && (
        <DialogContainer
          isOpen={isOpen}
          handleClose={handleClose}
          editMode={editMode}
          id={id}
          projects={projects}
        />
      )}
    </div>
  );
};

export default memo(GroupDialog);
