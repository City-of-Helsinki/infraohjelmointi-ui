import { IListItem } from '@/interfaces/common';
import { Tag } from 'hds-react/components/Tag';
import { TFunction } from 'i18next';
import { FC, memo, MouseEvent, KeyboardEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface IHashTagsProps {
  tags: Array<IListItem>;
  onClick?: (tag: string) => void;
  onDelete?: (tag: string) => void;
  id?: string;
}

const getAriaLabel = (
  tag: string,
  translate: TFunction<'translation', undefined>,
  onDelete?: (e: MouseEvent<HTMLButtonElement>) => void,
  onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void,
) => {
  const deleteTag = onDelete && `removeHashTag ${tag}`;
  const addTag = onClick && `addHashTag ${tag}`;
  return translate(deleteTag ?? addTag ?? '');
};

const HashTagsContainer: FC<IHashTagsProps> = ({ tags, onClick, onDelete, id }) => {
  const { t } = useTranslation();

  const handleOnClick = useCallback(
    (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick((e.currentTarget as HTMLDivElement).parentElement?.id ?? '');
      }
    },
    [onClick],
  );

  const handleOnDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (onDelete) {
        onDelete((e.currentTarget as HTMLButtonElement).parentElement?.parentElement?.id ?? '');
      }
    },
    [onDelete],
  );

  const handlers = {
    onClick: handleOnClick,
    onDelete: onDelete ? handleOnDelete : undefined,
  };

  if (!tags || tags.length === 0) {
    return (
      <div className="hashtags-container"></div>
    )
  }

  return (
    <div className="hashtags-container">
      {tags.map((tag) => {
        if (tag) {
          return (
            <div
              key={tag.id}
              className="hashtags-wrapper"
              aria-label={getAriaLabel(tag.value, t, handleOnDelete, handleOnClick)}
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
