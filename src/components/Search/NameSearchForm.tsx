import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo, useState } from 'react';
import './styles.css';
import { getProjectsWithFreeSearch } from '@/services/projectServices';

const NameSearchForm = () => {
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

  /**
   *   TODO: build an object like this from the API response and use it to get the needed type & id for
   *  the final search request (reqUrl?groups=''&hashtags=''&projects='')
   *
   *  const mockFreeSearchResponse = {
   *   'Hakaniemi': { value: 'Hakaniemi', type: 'group', id: '123' },
   *   'Lauttasaari': { value: 'Lauttasaari', type: 'group', id: '311'  },
   *   'Pohjoinen suurpiiri': { value: 'Pohjoinen suurpiiri', type: 'group', id: '345'  },
   *   'Itäkeskus': { value: 'Itäkeskus', type: 'group', id: '456'  },
   *   'pyöräily': { value: 'pyöräily', type: 'hashtag', id: '376' },
   *  };
   *
   */

  const allResults = [
    ...mockFreeSearchResponse.projects.map((p) => ({ value: p.value, type: 'project' })),
    ...mockFreeSearchResponse.hashtags.map((h) => ({ value: h.value, type: 'hashtag' })),
    ...mockFreeSearchResponse.groups.map((g) => ({ value: g.value, type: 'group' })),
  ];

  const [words, setWords] = useState<string[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');

  const getSuggestions = (inputValue: string) =>
    new Promise<{ value: string }[]>((resolve, reject) => {
      getProjectsWithFreeSearch(inputValue)
        .then((res) => {
          console.log('res: ', res);
        })
        .catch(() => reject([]));

      const filteredItems = allResults.filter((allResults) => {
        return allResults.value.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      });
      console.log('Filtered suggested items in promise: ', filteredItems);
      resolve(filteredItems);
    });

  const handleSubmit = (value: string) => {
    // TODO: parse the words by getting the obj key i.e. mockFreeResponse[value].id & mockFreeReponse[value].type
    // this should push the values to redux, since we need to store the criterias when the search form is closed
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

export default memo(NameSearchForm);
