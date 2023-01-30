import { IListItem } from '@/interfaces/common';
import { Tag } from 'hds-react/components/Tag';
import { FC, memo, MouseEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface IHashTagsProps {
  tags: Array<IListItem>;
  onClick?: (tag: string) => void;
  onDelete?: (tag: string) => void;
  id?: string;
}

const HashTagsContainer: FC<IHashTagsProps> = ({ tags, onClick, onDelete, id }) => {
  const { t } = useTranslation();
  const getAriaLabel = (tag: string) =>
    t(onDelete ? `removeHashTag ${tag}` : onClick ? `addHashTag ${tag}` : '');

  const handleOnClick = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    onClick && onClick((e.currentTarget as HTMLDivElement).parentElement?.id || '');
  };

  const handleOnDelete = (e: MouseEvent<HTMLButtonElement>) => {
    onDelete &&
      onDelete((e.currentTarget as HTMLButtonElement).parentElement?.parentElement?.id || '');
  };

  const handlers = {
    onClick: handleOnClick,
    onDelete: onDelete ? handleOnDelete : undefined,
  };

  return (
    <div className="hashtags-container">
      {tags.map((tag, i) => {
        if (t) {
          return (
            <div
              key={`${t}-${i}`}
              className="hashtags-wrapper"
              aria-label={getAriaLabel(tag.value)}
              data-testid={id}
              id={tag.value}
            >
              <Tag {...handlers} id={tag.id}>
                {tag.value}
              </Tag>
            </div>
          );
        }
      })}
    </div>
  );
};

export default memo(HashTagsContainer);
