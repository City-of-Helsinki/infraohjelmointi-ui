import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo, useState } from 'react';
import './styles.css';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { listItemToOption } from '@/utils/common';

const NameSearchForm = () => {
  const [words, setWords] = useState<string[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');

  const getSuggestions = (inputValue: string) =>
    new Promise<{ value: string; label: string }[]>((resolve, reject) => {
      getProjectsWithFreeSearch(inputValue)
        .then((res) => {
          const resultList = [];
          if (res) {
            console.log(res);

            res.projects && resultList.push(...res.projects);
            res.groups && resultList.push(...res.groups);
            res.hashtags &&
              resultList.push(...res.hashtags.map((h) => ({ id: h.id, value: `#${h.value}` })));

            const resultListAsOption = resultList ? resultList.map((r) => listItemToOption(r)) : [];

            resolve(resultListAsOption);
          }
          resolve([]);
        })
        .catch((err) => {
          console.log(err);
          return reject([]);
        });
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
        suggestionLabelField="label"
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
