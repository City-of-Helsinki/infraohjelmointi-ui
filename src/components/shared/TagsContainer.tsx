import { Tag } from 'hds-react/components/Tag';
import { FC } from 'react';

interface ITagsProps {
  tags: Array<string>;
  onClick?: (tag: string) => void;
  onDelete?: (tag: string) => void;
}

const TagsContainer: FC<ITagsProps> = ({ tags, onClick, onDelete }) => {
  const getAriaLabel = (tag: string) =>
    onDelete ? `Poista tunniste: ${tag}` : onClick ? `Lisää tunniste: ${tag}` : '';
  const handleClick = (tag: string) => (onClick ? onClick(tag) : onDelete ? onDelete(tag) : null);

  return (
    <div className="tags-container">
      {tags.map((t, i) => {
        if (t) {
          return (
            <div key={`${t}-${i}`} className="tag-wrapper" aria-label={getAriaLabel(t)}>
              <Tag
                onClick={onClick ? () => handleClick(t) : undefined}
                onDelete={onDelete ? () => handleClick(t) : undefined}
              >
                {t}
              </Tag>
            </div>
          );
        }
      })}
    </div>
  );
};

export default TagsContainer;
