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
import { IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import { useNavigate } from 'react-router';
import { patchGroup } from '@/services/groupServices';
import './styles.css';
import { selectPlanningMode } from '@/reducers/planningSlice';
import { createSearchParams } from 'react-router-dom';
import { selectPlanningDistricts, selectPlanningDivisions, selectPlanningSubDivisions } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { locationItemsToOptions } from '@/utils/common';

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
  console.log(data);
  return data;
};

const getLocationRelationId = (form: IGroupForm, hierarchyDistricts: ILocation[], hierarchyDivisions: ILocation[]) => {
  const relatedDistricts = hierarchyDistricts.filter(({ parentClass }) => parentClass === form.subClass.value ? true : parentClass === form.class.value );
  if (form.district.label) {
    const relatedDistrict = relatedDistricts.find(({ name }) => name.includes(form.district.label));
    if (form.division.label && relatedDistrict) {
      const relatedDivisions = hierarchyDivisions.filter(({ parent }) => parent === relatedDistrict.id);
      const relatedDivision = relatedDivisions.find(({ name }) => name.includes(form.division.label));
      if (relatedDivision) {
        return relatedDivision.id;
      }
      return relatedDistrict.id;
    } else if (relatedDistrict) {
      console.log(relatedDistricts);
      return relatedDistrict.id;
    }
  }
  return '';
}

const hierarchyDivisionsAsIoptions = (districtName: string, subClassId: string, classId: string, hierarchyDistricts: ILocation[], hierarchyDivisions: ILocation[]) => {
  const relatedDistricts = hierarchyDistricts.filter(({ parentClass }) => parentClass === subClassId || classId);
  const relatedDistrict = relatedDistricts.find(({ name }) => name.includes(districtName));
  if (relatedDistrict) {
    const relatedDivisions = hierarchyDivisions.filter(({ parent }) => parent === relatedDistrict.id);
    return locationItemsToOptions(relatedDivisions);
  }
  return [];
}

const DialogContainer: FC<IDialogProps> = memo(
  ({ isOpen, handleClose, editMode, projects, id }) => {
    const mode = useAppSelector(selectPlanningMode);
    const navigate = useNavigate();

    const hierarchyDistricts = useAppSelector(selectPlanningDistricts);
    const hierarchyDivisions = useAppSelector(selectPlanningDivisions);

    const [showAdvanceFields, setShowAdvanceFields] = useState(false);
    const { formMethods, formValues, classOptions, locationOptions } = useGroupForm(projects, id);
    const { handleSubmit, reset, getValues, setValue, control, watch } = formMethods;

    const nameField = watch('name');
    const masterClassField = watch('masterClass');
    const classField = watch('class');
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
        !masterClassField.value ||
        !classField.value
      );
    }, [
      districtField.value,
      divisionField.value,
      nameField,
      showAdvanceFields,
      subClassField.value,
      locationOptions,
      masterClassField.value,
      classField.value
    ]);

    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const navigateToGroupLocation = useCallback(
      (form: IGroupForm) => {
        const searchParams = {
          masterClass: form.masterClass.value,
          class: form.class.value,
          subClass: form.subClass.value,
          ...(form.district.value && !form.division.value && { 
            district: getLocationRelationId(form, hierarchyDistricts, hierarchyDivisions)
          }),
        };
        console.log(searchParams);

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
      async (form: IGroupForm) => {
        if (editMode && id) {
          try {
            const group = await patchGroup(
              buildRequestPayload(form, id, hierarchyDistricts, hierarchyDivisions) as IGroupPatchRequestObject,
            );
            dispatch(updateGroup({ data: group, type: 'planning' }));
            handleDialogClose();
          } catch (e) {
            console.log('Error patching group: ', e);
          }
        } else {
          try {
            await dispatch(postGroupThunk(buildRequestPayload(form, null, hierarchyDistricts, hierarchyDivisions) as IGroupRequest));
            handleDialogClose();
            navigateToGroupLocation(form);
          } catch (e) {
            console.log('Error posting group: ', e);
          }
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
    const districtValidation = useCallback(
      (d: IOption, subClass: string) =>
        Object.keys(d).includes('value') && d.value !== ''
          ? (["suurpiiri", "östersundom"].some(substring => subClass.includes(substring))) && !subClass.includes(d.label) ? t('validation.incorrectLocation', { field: 'suurpiiri' }) || '' : true
          : t('validation.required', { value: 'Suurpiiri' }) || '',
      [t],
    );
    const getDivisionValidation = useCallback(() => {
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
                            required: t('validation.required', { value: 'Ryhmän nimi' }) ?? '',
                          }}
                        />
                        <SelectField
                          clearable={!editMode}
                          disabled={editMode}
                          {...formProps('masterClass')}
                          rules={{
                            required: t('validation.required', { value: 'Pääluokka' }) ?? '',
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
                            required: t('validation.required', { value: 'Luokka' }) ?? '',
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
                            required: classOptions.subClasses.length > 0 ? t('validation.required', { value: 'Alaluokka' }) ?? '' : '',
                            validate: {
                              isPopulated: (c: IOption) => classOptions.subClasses.length > 0 ? customValidation(c, 'Alaluokka') ?? '' : true,
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
                              validate: {
                                isPopulated: (d: IOption) => districtValidation(d, subClassField.label),
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
                          { !showAdvanceFields ? 
                          (t(`groupForm.openAdvanceFilters`)
                          ) : (
                          (t(`groupForm.closeAdvanceFilters`))) }
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
                    divisions={hierarchyDivisionsAsIoptions(districtField.label, subClassField.value, classField.value, hierarchyDistricts, hierarchyDivisions)}
                    subClasses={classOptions.subClasses}
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
