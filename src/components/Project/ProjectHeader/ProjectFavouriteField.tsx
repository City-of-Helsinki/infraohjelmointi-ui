import { FC, MouseEvent, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useAppSelector } from '@/hooks/common';
import { IconStar, IconStarFill } from 'hds-react/icons';
import { IconButton } from '../../shared';
import { IProjectHeaderFieldProps } from './ProjectHeader';
import { selectIsNewProject } from '@/reducers/projectSlice';

const ProjectFavouriteField: FC<IProjectHeaderFieldProps> = ({ control }) => {
  const isNewProject = useAppSelector(selectIsNewProject);
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>, onChange: (...event: unknown[]) => void, value: string) => {
      e.preventDefault();
      if (!isNewProject) {
        onChange(!value);
      }
    },
    [isNewProject],
  );

  return (
    <Controller
      name="favourite"
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value } }) => (
        <IconButton
          onClick={(e) => handleClick(e, onChange, value)}
          color="white"
          icon={value ? IconStarFill : IconStar}
          text={value ? 'removeFavourite' : 'addFavourite'}
        />
      )}
    />
  );
};

export default ProjectFavouriteField;
