import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import Paragraph from '../../shared/Paragraph';
import './styles.css';
import { FormFieldCreator, Icon } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { IGroupRequest } from '@/interfaces/groupInterfaces';
import useGroupForm from '@/forms/useGroupForm';
import useClassList from '@/hooks/useClassList';
import { selectMasterClasses, selectClasses, selectSubClasses } from '@/reducers/classSlice';
import { listItemToOption } from '@/utils/common';
import { IListItem, IOption } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import GroupProjectSearch from './GroupProjectSearch';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import useLocationList from '@/hooks/useLocationList';
import { postGroupThunk } from '@/reducers/groupSlice';
import { IconAngleDown, IconAngleUp } from 'hds-react/icons';
import { is } from 'immer/dist/internal';

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
    console.log(form.subClass.value);
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
  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);
  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);
  const subDivisions = useAppSelector(selectSubDivisions);

  const getReverseLocationHierarchy = useCallback(
    (subDivisionId: string | undefined) => {
      const classAsListItem = (projectLocation: ILocation | undefined): IListItem => ({
        id: projectLocation?.id || '',
        value: projectLocation?.name || '',
      });

      const selectedSubDivision = subDivisions.find((sd) => sd.id === subDivisionId);

      const selectedDivision = divisions.find((d) => d.id === selectedSubDivision?.parent);

      const selectedDistrict = districts.find(
        (D) => D.id === selectedDivision?.parent && D.parent === null,
      );
      return {
        division: listItemToOption(classAsListItem(selectedDivision) || []),
        subDivision: listItemToOption(classAsListItem(selectedSubDivision) || []),
        district: listItemToOption(classAsListItem(selectedDistrict) || []),
      };
    },
    [divisions, districts, subDivisions],
  );

  const getReverseClassHierarchy = useCallback(
    (subClassId: string | undefined) => {
      const classAsListItem = (projectClass: IClass | undefined): IListItem => ({
        id: projectClass?.id || '',
        value: projectClass?.name || '',
      });

      const selectedSubClass = subClasses.find((sc) => sc.id === subClassId);

      const selectedClass = classes.find((c) => c.id === selectedSubClass?.parent);

      const selectedMasterClass = masterClasses.find(
        (mc) => mc.id === selectedClass?.parent && mc.parent === null,
      );
      return {
        _class: listItemToOption(classAsListItem(selectedClass) || []),
        subClass: listItemToOption(classAsListItem(selectedSubClass) || []),
        masterClass: listItemToOption(classAsListItem(selectedMasterClass) || []),
      };
    },
    [classes, masterClasses, subClasses],
  );

  const { formMethods, formValues, formFields } = useGroupForm();
  const {
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty },
    watch,
    setValue,
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

  useClassList(true, selectedClass);
  useLocationList(true, selectedLocation);

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
      console.log();
      console.log(buildRequestPayload(form, projectsForSubmit));
      // dispatch(postGroupThunk(buildRequestPayload(form, projectsForSubmit))).then(() => {
      //   reset(formValues);
      // });
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
        fieldsPopulated: false,
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
              <Paragraph text={t(`groupForm.groupCreationDescription1`)} />
              <Paragraph text={t(`groupForm.groupCreationDescription2`)} />
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
                    <FormFieldCreator form={formFields.basic} />
                  </div>
                  {/* Advance fields */}
                  {showAdvanceFields && (
                    <div className="search-form-content">
                      <FormFieldCreator form={formFields.advance} />
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
