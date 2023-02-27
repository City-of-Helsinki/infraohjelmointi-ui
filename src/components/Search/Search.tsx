import useSearchForm from '@/forms/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldLabel, SelectField } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getSearchResultsThunk,
  selectFreeSearchParams,
  selectOpen,
  setSearchForm,
  toggleSearch,
} from '@/reducers/searchSlice';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import FreeSearchForm from './FreeSearchForm';
import './styles.css';
import MultiSelectField from '../shared/MultiSelectField';
import CheckboxField from '../shared/CheckboxField';
import { Fieldset } from 'hds-react/components/Fieldset';
import { useOptions } from '@/hooks/useOptions';

// Build a search parameter with all the choices from the search form
const buildSearchParams = (form: ISearchForm, freeSearchParams: FreeSearchFormObject | null) => {
  const searchParams = [];
  for (const [key, value] of Object.entries(form)) {
    switch (key) {
      case 'masterClass':
      case 'class':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
        value.forEach((v: IOption) => searchParams.push(`${key}=${v.value}`));
        break;
      case 'programmedYes':
        value && searchParams.push('programmed=true');
        break;
      case 'programmedNo':
        value && searchParams.push('programmed=false');
        break;
      case 'programmedYearMin':
      case 'programmedYearMax':
        value && searchParams.push(`${key}=${value}`);
        break;
      case 'phase':
      case 'personPlanning':
      case 'category':
        value.value && searchParams.push(`${key}=${value.value}`);
        break;
      default:
        break;
    }
  }

  if (freeSearchParams) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of Object.entries(freeSearchParams)) {
      switch (value.type) {
        case 'group':
          searchParams.push(`projectGroup=${value.value}`);
          break;
        case 'project':
          searchParams.push(`project=${value.value}`);
          break;
        case 'hashtag':
          searchParams.push(`hashTags=${value.value}`);
          break;
        default:
          break;
      }
    }
  }

  return searchParams.join('&');
};

const Search = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectOpen);
  const freeSearchParams = useAppSelector(selectFreeSearchParams);

  const { formMethods } = useSearchForm();

  const {
    handleSubmit,
    getValues,
    formState: { isDirty },
    reset,
    control,
  } = formMethods;

  const phases = useOptions('phases');
  const masterClasses = useOptions('masterClasses', true);
  const classes = useOptions('classes', true);
  const subClasses = useOptions('subClasses', true);
  const districts = useOptions('districts', true);
  const divisions = useOptions('divisions', true);
  const subDivisions = useOptions('subDivisions', true);
  const programmedYearMin = useOptions('programmedYears', true);
  const programmedYearMax = useOptions('programmedYears', true);
  const personPlanning = useOptions('responsiblePersons', true);
  const categories = useOptions('categories');

  const onSubmit = useCallback(
    async (form: ISearchForm) => {
      const searchParams = buildSearchParams(form, freeSearchParams);
      dispatch(getSearchResultsThunk(searchParams)).then(() => {
        dispatch(setSearchForm(form));
        reset(form);
      });
    },
    [dispatch, freeSearchParams, reset],
  );

  const handleClose = useCallback(() => {
    dispatch(toggleSearch());
    dispatch(setSearchForm(getValues()));
  }, [dispatch, getValues]);

  return (
    <Dialog
      id="search-dialog"
      aria-labelledby="project-search-dialog"
      aria-describedby="project-search-dialog"
      isOpen={open}
      close={handleClose}
      closeButtonLabelText="Close search dialog"
      scrollable
    >
      <Dialog.Header id="search-dialog-header" title={t('searchProjects')} />
      <Dialog.Content>
        <FreeSearchForm />
        <form
          className="search-form"
          onSubmit={handleSubmit(onSubmit)}
          data-testid="project-search-form"
        >
          <div className="search-form-content">
            <div className="search-form-filter-label">
              <FormFieldLabel text="searchForm.filter" />
            </div>
            <MultiSelectField
              name="masterClass"
              label="searchForm.masterClass"
              control={control}
              placeholder="Valitse"
              options={masterClasses}
            />
            <MultiSelectField
              name="class"
              label="searchForm.class"
              control={control}
              placeholder="Valitse"
              options={classes}
            />
            <MultiSelectField
              name="subClass"
              label="searchForm.subClass"
              control={control}
              placeholder="Valitse"
              options={subClasses}
            />
            <Fieldset
              heading={t('searchForm.programmed')}
              className="custom-fieldset"
              id="programmed"
            >
              <CheckboxField
                name="programmedYes"
                label="searchForm.programmedYes"
                control={control}
              />
              <CheckboxField
                name="programmedNo"
                label="searchForm.programmedNo"
                control={control}
              />
            </Fieldset>
            <SelectField
              name="programmedYearMin"
              label="searchForm.programmedYearMin"
              control={control}
              placeholder="Valitse"
              options={programmedYearMin}
            />
            <SelectField
              name="programmedYearMax"
              label="searchForm.programmedYearMax"
              control={control}
              placeholder="Valitse"
              options={programmedYearMax}
            />
            <SelectField
              name="phase"
              label="searchForm.phase"
              control={control}
              placeholder="Valitse"
              options={phases}
            />
            <SelectField
              name="personPlanning"
              label="searchForm.personPlanning"
              control={control}
              placeholder="Valitse"
              icon="person"
              options={personPlanning}
            />
            <MultiSelectField
              name="district"
              label="searchForm.district"
              control={control}
              placeholder="Valitse"
              options={districts}
            />
            <MultiSelectField
              name="division"
              label="searchForm.division"
              control={control}
              placeholder="Valitse"
              options={divisions}
            />
            <MultiSelectField
              name="subDivision"
              label="searchForm.subDivision"
              control={control}
              placeholder="Valitse"
              options={subDivisions}
            />
            <SelectField
              name="category"
              label="searchForm.category"
              control={control}
              placeholder="Valitse"
              options={categories}
            />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
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
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
