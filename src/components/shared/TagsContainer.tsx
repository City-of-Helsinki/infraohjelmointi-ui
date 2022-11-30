import { Tag } from 'hds-react/components/Tag';
import { FC, memo, MouseEvent, KeyboardEvent, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ITagsProps {
  tags: Array<string>;
  onClick?: (tag: string) => void;
  onDelete?: (tag: string) => void;
  id?: string;
}

const TagsContainer: FC<ITagsProps> = ({ tags, onClick, onDelete, id }) => {
  const { t } = useTranslation();
  const getAriaLabel = (tag: string) =>
    t(onDelete ? `removeHashTag ${tag}` : onClick ? `addHashTag ${tag}` : '');

  const handleOnClick = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    onClick && onClick((e.target as HTMLDivElement).innerText);
  };

  return (
    <div className="tags-container">
      {tags.map((tag, i) => {
        if (t) {
          return (
            <div
              key={`${t}-${i}`}
              className="tag-wrapper"
              aria-label={getAriaLabel(tag)}
              data-testid={id}
              id={tag}
            >
              <Tag onClick={handleOnClick} onDelete={onDelete ? () => onDelete(tag) : undefined}>
                {tag}
              </Tag>
            </div>
          );
        }
      })}
    </div>
  );
};

export default memo(TagsContainer);