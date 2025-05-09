import useSearchForm from '@/forms/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Button, ButtonVariant } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useCallback } from 'react';
import { FormFieldLabel, SelectField } from '../shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import FreeSearchForm from './FreeSearchForm';
import { useNavigate } from 'react-router';
import MultiSelectField from '../shared/MultiSelectField';
import CheckboxField from '../shared/CheckboxField';
import { Fieldset } from 'hds-react/components/Fieldset';
import { useOptions } from '@/hooks/useOptions';
import {
  getSearchResultsThunk,
  selectOpen,
  setLastSearchParams,
  setSearchForm,
  setSubmittedSearchForm,
  toggleSearch,
} from '@/reducers/searchSlice';
import buildSearchParams from '@/utils/buildSearchParams';
import './styles.css';
import HkrIdSearch from './HkrIdSearch';

const Search = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectOpen);

  const navigate = useNavigate();

  const { formMethods, submitDisabled, classOptions, locationOptions } = useSearchForm();

  const { handleSubmit, getValues, control } = formMethods;

  const phases = useOptions('phases');
  const programmedYearMin = useOptions('programmedYears');
  const programmedYearMax = useOptions('programmedYears');
  const responsiblePersons = useOptions('responsiblePersons');
  const categories = useOptions('categories');
  const { masterClasses, classes, subClasses } = classOptions;
  const { districts, divisions, subDivisions } = locationOptions;

  const onSubmit = useCallback(
    async (form: ISearchForm) => {
      const searchParams = buildSearchParams(form);

      navigate('/search-results');
      dispatch(toggleSearch());

      try {
        await dispatch(getSearchResultsThunk({ params: searchParams }));
        dispatch(setSubmittedSearchForm(form));
        dispatch(setLastSearchParams(searchParams));
      } catch (e) {
        console.log('Error getting search results: ', e);
      }
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
            <MultiSelectField {...formProps('masterClass')} options={masterClasses} />
            <MultiSelectField {...formProps('class')} options={classes} />
            <MultiSelectField {...formProps('subClass')} options={subClasses} />
            <Fieldset
              heading={t('searchForm.programmed')}
              className="custom-fieldset"
              id="programmed"
            >
              <CheckboxField {...formProps('programmedYes')} />
              <CheckboxField {...formProps('programmedNo')} />
            </Fieldset>
            <HkrIdSearch control={control} getValues={getValues} />
            <SelectField
              {...formProps('programmedYearMin')}
              options={programmedYearMin}
              shouldTranslate={false}
            />
            
            <SelectField
              {...formProps('programmedYearMax')}
              options={programmedYearMax}
              shouldTranslate={false}
            />
            <SelectField {...formProps('phase')} options={phases} />
            <SelectField
              {...formProps('personPlanning')}
              iconKey="person"
              options={responsiblePersons}
              shouldTranslate={false}
            />
            <SelectField
              {...formProps('personConstruction')}
              iconKey="person"
              options={responsiblePersons}
              shouldTranslate={false}
            />
            <MultiSelectField {...formProps('district')} options={districts} />
            <MultiSelectField {...formProps('division')} options={divisions} />
            <MultiSelectField {...formProps('subDivision')} options={subDivisions} />
            <SelectField {...formProps('category')} options={categories} />
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
        <Button onClick={handleClose} variant={ButtonVariant.Secondary} data-testid="cancel-search">
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
