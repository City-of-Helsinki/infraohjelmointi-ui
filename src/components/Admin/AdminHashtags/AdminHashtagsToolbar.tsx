import { Button, SearchInput } from 'hds-react';
import { memo } from 'react';

const AdminHashtagsToolbar = () => {
  return (
    <div className="flex items-end justify-between">
      <Button className="h-[3.5rem]">Lisää tunniste</Button>
      <SearchInput
        className="w-[22.5rem]"
        label="Etsi tunniste"
        placeholder=""
        searchButtonAriaLabel="Search hashtags"
        clearButtonAriaLabel="Clear search field"
        onSubmit={(submittedValue) => console.log('Submitted value:', submittedValue)}
      />
    </div>
  );
};

export default memo(AdminHashtagsToolbar);
