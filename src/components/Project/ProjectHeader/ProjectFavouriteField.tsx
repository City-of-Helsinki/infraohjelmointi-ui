import { FC, MouseEvent } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconStar, IconStarFill } from 'hds-react/icons';
import { IconButton } from '../../shared';
import { IProjectHeaderFieldProps } from './ProjectHeader';

const ProjectFavouriteField: FC<IProjectHeaderFieldProps> = ({ control }) => {
  const handleClick = (
    e: MouseEvent<HTMLButtonElement>,
    onChange: (...event: unknown[]) => void,
    value: string,
  ) => {
    e.preventDefault();
    onChange(!value);
  };

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
