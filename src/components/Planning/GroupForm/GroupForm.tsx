import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { IGroupRequest } from '@/interfaces/groupInterfaces';
import useGroupForm from '@/forms/useGroupForm';
import { selectMasterClasses, selectClasses, selectSubClasses } from '@/reducers/classSlice';
import { listItemToOption } from '@/utils/common';
import { IListItem, IOption } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import GroupProjectSearch from './GroupProjectSearch';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { postGroupThunk } from '@/reducers/groupSlice';
import { IconAngleDown, IconAngleUp } from 'hds-react/icons';
import { is } from 'immer/dist/internal';
import useClassOptions from '@/hooks/useClassOptions';
import useLocationOptions from '@/hooks/useLocationOptions';
import { SelectField, TextField } from '@/components/shared';

interface IFormState {
  isOpen: boolean;
  selectedClass: string | undefined;
  selectedLocation: string | undefined;
  projectsForSubmit: Array<IOption>;
  showAdvanceFields: boolean;
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
  if (form.subClass && form.subClass?.value) {
    payload.classRelation = form.subClass.value;
  } else if (form.class && form.class?.value) {
    payload.classRelation = form.class.value;
  }

  if (form.subDivision && form.subDivision?.value) {
    payload.districtRelation = form.subDivision.value;
  } else if (form.division && form.division?.value) {
    payload.districtRelation = form.division.value;
  }
  payload.projects = projects.length > 0 ? projects.map((p) => p.value) : [];

  return payload;
};

const GroupForm: FC = () => {
  const allMasterClasses = useAppSelector(selectMasterClasses);
  const allClasses = useAppSelector(selectClasses);
  const allSubClasses = useAppSelector(selectSubClasses);
  const allDistricts = useAppSelector(selectDistricts);
  const allDivisions = useAppSelector(selectDivisions);
  const allSubDivisions = useAppSelector(selectSubDivisions);

  const getReverseLocationHierarchy = useCallback(
    (subDivisionId: string | undefined) => {
      const classAsListItem = (projectLocation: ILocation | undefined): IListItem => ({
        id: projectLocation?.id || '',
        value: projectLocation?.name || '',
      });

      const selectedSubDivision = allSubDivisions.find((sd) => sd.id === subDivisionId);

      const selectedDivision = allDivisions.find((d) => d.id === selectedSubDivision?.parent);

      const selectedDistrict = allDistricts.find(
        (D) => D.id === selectedDivision?.parent && D.parent === null,
      );
      return {
        division: listItemToOption(classAsListItem(selectedDivision) || []),
        subDivision: listItemToOption(classAsListItem(selectedSubDivision) || []),
        district: listItemToOption(classAsListItem(selectedDistrict) || []),
      };
    },
    [allDivisions, allDistricts, allSubDivisions],
  );

  const getReverseClassHierarchy = useCallback(
    (subClassId: string | undefined) => {
      const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
        id: projectClass?.id || '',
        value: projectClass?.name || '',
      });

      const selectedSubClass = allSubClasses.find((sc) => sc.id === subClassId);

      const selectedClass = allClasses.find((c) => c.id === selectedSubClass?.parent);

      const selectedMasterClass = allMasterClasses.find(
        (mc) => mc.id === selectedClass?.parent && mc.parent === null,
      );
      return {
        _class: listItemToOption(classAsListItem(selectedClass) || []),
        subClass: listItemToOption(classAsListItem(selectedSubClass) || []),
        masterClass: listItemToOption(classAsListItem(selectedMasterClass) || []),
      };
    },
    [allClasses, allMasterClasses, allSubClasses],
  );

  const { formMethods, formValues } = useGroupForm();
  const {
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty },
    watch,
    setValue,
    getValues,
    control,
  } = formMethods;

  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const { t } = useTranslation();

  const [formState, setFormState] = useState<IFormState>({
    isOpen: false,
    selectedClass: '',
    projectsForSubmit: [],
    selectedLocation: '',
    showAdvanceFields: false,
  });

  const { isOpen, selectedClass, selectedLocation, projectsForSubmit, showAdvanceFields } =
    formState;
  const { masterClasses, classes, subClasses } = useClassOptions(selectedClass);
  const { districts, divisions, subDivisions } = useLocationOptions(selectedLocation);
  // useClassList(true, selectedClass);
  // useLocationList(true, selectedLocation);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'masterClass' && value.masterClass?.value) {
        setFormState((current) => ({ ...current, selectedClass: value.masterClass?.value }));
        setValue('class', { label: '', value: '' });
        setValue('subClass', { label: '', value: '' });
      } else if (name === 'class' && value.class?.value) {
        setFormState((current) => ({ ...current, selectedClass: value.class?.value }));
        setValue('subClass', { label: '', value: '' });
      } else if (name === 'subClass' && value.subClass?.value) {
        setFormState((current) => ({ ...current, selectedClass: value.subClass?.value }));
        if (!value.class?.value || !value.masterClass?.value) {
          const { _class, subClass, masterClass } = getReverseClassHierarchy(value.subClass?.value);
          setValue('masterClass', masterClass);
          setValue('class', _class);
          setValue('subClass', subClass);
        }
      }

      if (name === 'district' && value.district?.value) {
        setFormState((current) => ({ ...current, selectedLocation: value.district?.value }));
        setValue('division', { label: '', value: '' });
        setValue('subDivision', { label: '', value: '' });
      } else if (name === 'division' && value.division?.value) {
        setFormState((current) => ({ ...current, selectedLocation: value.division?.value }));
        setValue('subDivision', { label: '', value: '' });
      } else if (name === 'subDivision' && value.subDivision?.value) {
        setFormState((current) => ({ ...current, selectedLocation: value.subDivision?.value }));
        if (!value.division?.value || !value.district?.value) {
          const { division, subDivision, district } = getReverseLocationHierarchy(
            value.subDivision?.value,
          );
          setValue('district', district);
          setValue('division', division);
          setValue('subDivision', subDivision);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, getReverseClassHierarchy, getReverseLocationHierarchy]);

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
  const toggleAdvanceFields = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormState((current) => ({ ...current, showAdvanceFields: !current.showAdvanceFields }));
  };
  const handleSetOpen = useCallback(
    () =>
      setFormState((current) => ({
        ...current,
        isOpen: !current.isOpen,
        showAdvanceFields: false,
        projectsForSubmit: [],
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
    reset(formValues);
    // Also populate class and location lists back to full values
  }, [handleSetOpen, reset, formValues]);
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
    <div className="input-wrapper">
      {/* Dialog */}
      <div className="display-flex-col">
        <Dialog
          id="group-create-dialog"
          aria-labelledby={'group-form-dialog-label'}
          isOpen={isOpen}
          close={handleClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
          scrollable
        >
          {/* Header */}
          <Header id={'group-form-dialog-label'} title={t(`createSummingGroups`)} />

          <Content>
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
                    {/* <FormFieldCreator form={formFields.basic} /> */}
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
                      <SelectField
                        {...formProps('subDivision')}
                        rules={{
                          required: 'Tämä kenttä on täytettävä',
                          validate: {
                            isPopulated: (sd: IOption) =>
                              Object.keys(sd).includes('value') && sd.value !== ''
                                ? true
                                : 'Tämä kenttä on täytettävä',
                          },
                        }}
                        options={subDivisions}
                      />
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
              />
            </div>
          </Content>

          <div>
            <ActionButtons>
              <Button
                onClick={handleSubmit(onSubmit)}
                data-testid="search-projects-button"
                disabled={!isDirty}
              >
                {t('search')}
              </Button>
              <Button onClick={handleClose} variant="secondary" data-testid="cancel-search">
                {t('cancel')}
              </Button>
            </ActionButtons>
          </div>
        </Dialog>

        {/* Displayed on form (Open dialog button) */}
        <div className="hashtags-label">
          <div data-testid="open-group-form-dialog-button"></div>
          <Button onClick={onOpenGroupForm} size="small">
            {t(`createSummingGroups`)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;
