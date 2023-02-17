import useSearchForm from '@/forms/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldLabel, SelectField } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import FreeSearchForm from './FreeSearchForm';
import { useNavigate } from 'react-router';
import MultiSelectField from '../shared/MultiSelectField';
import CheckboxField from '../shared/CheckboxField';
import { Fieldset } from 'hds-react/components/Fieldset';
import { useOptions } from '@/hooks/useOptions';
import {
  getSearchResultThunk,
  selectOpen,
  setSearchForm,
  toggleSearch,
} from '@/reducers/searchSlice';
import _ from 'lodash';
import './styles.css';

// Build a search parameter with all the choices from the search form
const buildSearchParams = (form: ISearchForm) => {
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
      case 'freeSearchParams':
        for (const [_, v] of Object.entries(value as FreeSearchFormObject)) {
          switch (v.type) {
            case 'groups':
              searchParams.push(`projectGroup=${v.value}`);
              break;
            case 'projects':
              searchParams.push(`project=${v.value}`);
              break;
            case 'hashtags':
              searchParams.push(`hashTags=${v.value}`);
              break;
          }
        }
        break;
      default:
        break;
    }
  }

  return searchParams.join('&');
};

const Search = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectOpen);

  const navigate = useNavigate();

  const { formMethods, submitDisabled } = useSearchForm();

  const { handleSubmit, getValues, control } = formMethods;

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
      const searchParams = buildSearchParams(form);
      navigate('/search-result');
      dispatch(toggleSearch());
      dispatch(getSearchResultThunk(searchParams)).then(() => {
        dispatch(setSearchForm(form));
      });
    },
    [dispatch, navigate],
  );

  const handleClose = useCallback(() => {
    dispatch(toggleSearch());
    dispatch(setSearchForm(getValues()));
  }, [dispatch, getValues]);

  const formProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `searchForm.${name}`,
        control: control,
      };
    },
    [control],
  );

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
        <form className="search-form" data-testid="project-search-form">
          <FreeSearchForm control={control} getValues={getValues} />
          <div className="search-form-content">
            <div className="mb-4 pb-3">
              <FormFieldLabel text="searchForm.filter" />
            </div>
            <MultiSelectField
              {...formProps('masterClass')}
              placeholder="choose"
              options={masterClasses}
            />
            <MultiSelectField {...formProps('class')} placeholder="choose" options={classes} />
            <MultiSelectField
              {...formProps('subClass')}
              placeholder="choose"
              options={subClasses}
            />
            <Fieldset
              heading={t('searchForm.programmed')}
              className="custom-fieldset"
              id="programmed"
            >
              <CheckboxField {...formProps('programmedYes')} />
              <CheckboxField {...formProps('programmedNo')} />
            </Fieldset>
            <SelectField
              {...formProps('programmedYearMin')}
              placeholder="choose"
              options={programmedYearMin}
            />
            <SelectField
              {...formProps('programmedYearMax')}
              placeholder="choose"
              options={programmedYearMax}
            />
            <SelectField {...formProps('phase')} placeholder="choose" options={phases} />
            <SelectField
              {...formProps('personPlanning')}
              placeholder="choose"
              icon="person"
              options={personPlanning}
            />
            <MultiSelectField {...formProps('district')} placeholder="choose" options={districts} />
            <MultiSelectField {...formProps('division')} placeholder="choose" options={divisions} />
            <MultiSelectField
              {...formProps('subDivision')}
              placeholder="choose"
              options={subDivisions}
            />
            <SelectField {...formProps('category')} placeholder="choose" options={categories} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          onClick={handleSubmit(onSubmit)}
          data-testid="search-projects-button"
          disabled={submitDisabled}
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
