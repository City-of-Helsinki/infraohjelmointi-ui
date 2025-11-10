import { useState, MouseEvent, FC, useCallback, useMemo, memo, useEffect } from 'react';
import { Button, ButtonVariant } from 'hds-react';
import { Dialog } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { TextField, SelectField } from '@/components/shared';
import { IOption } from '@/interfaces/common';
import { IconAngleUp, IconAngleDown } from 'hds-react/icons';
import GroupProjectSearch from './GroupProjectSearch';
import useGroupForm from '@/forms/useGroupForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { postGroupThunk, updateGroup } from '@/reducers/groupSlice';
import { IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import { useNavigate } from 'react-router';
import { patchGroup } from '@/services/groupServices';
import './styles.css';
import { selectPlanningMode } from '@/reducers/planningSlice';
import { createSearchParams } from 'react-router-dom';
import { selectPlanningDistricts, selectPlanningDivisions } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getLocationRelationId } from '@/utils/common';

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
  hierarchyDistricts: ILocation[],
  hierarchyDivisions: ILocation[],
): IGroupRequest | IGroupPatchRequestObject => {
  // submit Class or subclass if present, submit division or district if present, submit a name, submit projects
  const data = {
    name: form.name,
    location: form.subDivision?.value || form.division?.value || form.district?.value || '',
    classRelation: form.subClass?.value || form.class?.value || '',
    locationRelation: getLocationRelationId(form, hierarchyDistricts, hierarchyDivisions),
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

    const hierarchyDistricts = useAppSelector(selectPlanningDistricts);
    const hierarchyDivisions = useAppSelector(selectPlanningDivisions);

    const [showAdvanceFields, setShowAdvanceFields] = useState(false);
    const { formMethods, formValues, classOptions, locationOptions } = useGroupForm(projects, id);
    const { handleSubmit, reset, getValues, control, watch } = formMethods;

    const subClassField = watch('subClass');

    useEffect(() => {
      if (formValues.district.value || formValues.division.value) {
        setShowAdvanceFields(true);
      }
    }, [formValues.district.value, formValues.division.value]);

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const navigateToGroupLocation = useCallback(
      (form: IGroupForm) => {
        const searchParams = {
          masterClass: form.masterClass.value,
          class: form.class.value,
          subClass: form.subClass.value,
          ...(form.district.value &&
            !form.division.value && {
              district: getLocationRelationId(form, hierarchyDistricts, hierarchyDivisions),
            }),
        };

        navigate({
          pathname: `/${mode}`,
          search: `${createSearchParams(searchParams)}`,
        });
      },
      [mode, navigate, hierarchyDistricts, hierarchyDivisions],
    );

    const handleDialogClose = useCallback(() => {
      reset(formValues);
      setShowAdvanceFields(false);
      handleClose();
    }, [handleClose, formValues, reset]);

    const onSubmit = useCallback(
      async (form: IGroupForm) => {
        if (editMode && id) {
          try {
            const group = await patchGroup(
              buildRequestPayload(
                form,
                id,
                hierarchyDistricts,
                hierarchyDivisions,
              ) as IGroupPatchRequestObject,
            );
            dispatch(updateGroup({ data: group, type: 'planning' }));
            handleDialogClose();
          } catch (e) {
            console.log('Error patching group: ', e);
          }
        } else {
          try {
            await dispatch(
              postGroupThunk(
                buildRequestPayload(
                  form,
                  null,
                  hierarchyDistricts,
                  hierarchyDivisions,
                ) as IGroupRequest,
              ),
            );
            handleDialogClose();
            navigateToGroupLocation(form);
          } catch (e) {
            console.log('Error posting group: ', e);
          }
        }
      },
      [
        dispatch,
        handleDialogClose,
        editMode,
        id,
        hierarchyDistricts,
        hierarchyDivisions,
        navigateToGroupLocation,
      ],
    );

    const handleOnSubmitForm = useCallback(
      (e: unknown) => {
        handleSubmit(onSubmit).call(e).catch(Promise.reject);
      },
      [handleSubmit, onSubmit],
    );

    const toggleAdvanceFields = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowAdvanceFields((current) => !current);
    }, []);

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
          : t('validation.required', { field: fieldName }) || '',
      [t],
    );

    const districtValidation = useCallback(
      (d: IOption, subClass: string) =>
        ['suurpiiri', 'östersundom'].some((subClassSubstring) =>
          subClass.includes(subClassSubstring),
        ) && !subClass.includes(d.label)
          ? t('validation.incorrectLocation', { field: 'suurpiiri' }) || ''
          : true,
      [t],
    );

    const getDivisionValidation = useCallback(() => {
      return {};
    }, []);
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
                            required: t('validation.required', { field: 'Ryhmän nimi' }) ?? '',
                          }}
                        />
                        <SelectField
                          clearable={!editMode}
                          disabled={editMode}
                          {...formProps('masterClass')}
                          rules={{
                            required: t('validation.required', { field: 'Pääluokka' }) ?? '',
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
                            required: t('validation.required', { field: 'Luokka' }) ?? '',
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
                            required:
                              classOptions.subClasses.length > 0
                                ? t('validation.required', { field: 'Alaluokka' }) ?? ''
                                : '',
                            validate: {
                              isPopulated: (c: IOption) =>
                                classOptions.subClasses.length > 0
                                  ? customValidation(c, 'Alaluokka') ?? ''
                                  : true,
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
                              required: ['suurpiiri', 'östersundom'].some((subClassSubstring) =>
                                subClassField.label.includes(subClassSubstring),
                              )
                                ? t('validation.required', { field: 'Suurpiiri' }) ?? ''
                                : '',
                              validate: {
                                isValidDistrict: (d: IOption) =>
                                  districtValidation(d, subClassField.label),
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
                          {!showAdvanceFields
                            ? t(`groupForm.openAdvanceFilters`)
                            : t(`groupForm.closeAdvanceFilters`)}
                        </button>
                        {advanceFieldIcons}
                      </div>
                    </div>
                  </form>
                </div>

                <div>
                  <GroupProjectSearch getValues={getValues} control={control} />
                </div>
              </div>
            </Content>

            <ActionButtons>
              <Button
                onClick={handleOnSubmitForm}
                data-testid={editMode ? 'save-group-button' : 'create-group-button'}
                disabled={!formMethods.formState.isValid}
              >
                {editMode ? t('save') : t('groupForm.createGroup')}
              </Button>
              <Button
                onClick={handleDialogClose}
                variant={ButtonVariant.Secondary}
                data-testid="cancel-search"
              >
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
