import useSearchForm from '@/hooks/useSearchForm';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { Tag } from 'hds-react/components/Tag';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { SearchInput } from 'hds-react/components/SearchInput';
import { useCallback, useState } from 'react';
import { FormFieldCreator } from '../shared';
import './styles.css';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { toggleSearch } from '@/reducers/searchSlice';

const NameSearch = () => {
  const mockFreeSearchResponse = {
    groups: [
      { value: 'Hakaniemi', id: '123' },
      { value: 'Lauttasaari', id: '123' },
      { value: 'Pohjoinen suurpiiri', id: '123' },
      { value: 'Itäkeskus', id: '123' },
    ],
    hashtags: [
      { value: 'pyöräily', id: '123' },
      { value: 'puistot', id: '123' },
      { value: 'rannat', id: '123' },
      { value: 'uudisrakentaminen', id: '123' },
      { value: 'hds', id: '123' },
      { value: 'kadut', id: '123' },
    ],
    projects: [
      { value: 'Uudisraivaajanpolku', id: '123' },
      { value: 'Tukkipolku', id: '123' },
      { value: 'Alviontie', id: '123' },
      { value: 'Kalasatama', id: '123' },
      { value: 'Hapero', id: '123' },
    ],
  };

  const allResults = [
    ...mockFreeSearchResponse.projects.map((p) => ({ value: p.value, type: 'project' })),
    ...mockFreeSearchResponse.hashtags.map((h) => ({ value: h.value, type: 'hashtag' })),
    ...mockFreeSearchResponse.groups.map((g) => ({ value: g.value, type: 'group' })),
  ];

  const [words, setWords] = useState<string[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');

  const [obj, setObj] = useState({});

  const getSuggestions = (inputValue: string) =>
    new Promise<{ value: string }[]>((resolve) => {
      const filteredItems = allResults.filter((allResults) => {
        return allResults.value.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      });
      console.log('Filtered suggested items in promise: ', filteredItems);
      resolve(filteredItems);
    });

  const handleSubmit = (value: string) => {
    setObj({ ...obj, value: value, id: '' });
    setWords([...words, value]);
    setSearchWord('');
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-black-20)', marginTop: '1rem' }}>
      <SearchInput
        label="Mitä haet?"
        helperText="Etsi hakusanalla, esim. nimen, ryhmän, hashtagin mukaan"
        searchButtonAriaLabel="Search"
        suggestionLabelField="value"
        highlightSuggestions
        getSuggestions={getSuggestions}
        value={searchWord}
        onChange={(v) => setSearchWord(v)}
        onSubmit={(submittedValue) => handleSubmit(submittedValue)}
      />
      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0', flexWrap: 'wrap' }}>
        {words.map((w) => (
          <Tag key={w} onDelete={() => console.log('deleted')}>
            {w}
          </Tag>
        ))}
      </div>
    </div>
  );
};

const Search = () => {
  const { formMethods, formFields } = useSearchForm();
  const { handleSubmit } = formMethods;
  const open = useAppSelector((state: RootState) => state.search.open);
  const dispatch = useAppDispatch();

  const onSubmit = (form: ISearchForm) => {
    console.log('Form: ', form);
  };

  const handleClose = useCallback(() => dispatch(toggleSearch()), [dispatch]);

  return (
    <Dialog
      id="terms-dialog"
      aria-labelledby={'123'}
      aria-describedby={'123'}
      isOpen={open}
      close={handleClose}
      closeButtonLabelText="Close search dialog"
      scrollable
      style={{ position: 'absolute', right: '0', minHeight: '100vh' }}
    >
      <Dialog.Header id={'234'} title="Hae projekteja" />
      <Dialog.Content>
        <NameSearch />
        <form className="search-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="search-form-content">
            <FormFieldCreator form={formFields} />
          </div>
        </form>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={close}>Hae</Button>
        <Button onClick={close} variant="secondary">
          Peruuta
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Search;
