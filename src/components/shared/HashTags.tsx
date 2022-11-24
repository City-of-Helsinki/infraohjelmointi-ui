import { Tag } from 'hds-react/components/Tag';
import { useState, MouseEvent } from 'react';
import PenAndLabelButton from './PenAndLabelButton';

/**
 * TODO: this should be its own generic form component.
 * We still don't know how this should work when editing, so this doesn't have its own generic form-component yet.
 */
const HashTags = ({ name }: { name: string }) => {
  // TODO: add to utils/common Temp values until API returns / enables these
  const [tags, setTags] = useState(['uudisrakentaminen', 'pyöräily', 'pohjoinensuurpiiri']);

  const onEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTags([...tags, 'testi']);
  };

  return (
    <div className="input-wrapper" id={name}>
      <div className="display-flex-col">
        <PenAndLabelButton text={'Tunnisteet'} onClick={(e) => onEdit(e)} />
        <div className="tags-container">
          {tags.map((t) => (
            <div key={t} className="tag-wrapper">
              <Tag>{t}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HashTags;
