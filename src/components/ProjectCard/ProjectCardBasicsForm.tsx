import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import './basicsFormStyles.css';
import { RootState } from '@/store';
import { getOptionId } from '@/utils/common';
import { IOption } from '@/interfaces/common';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit, formFields, formState } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const { dirtyFields } = formState;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = useCallback(
    (form: IProjectCardBasicsForm) => {
      const data: IProjectCardRequest = {};

      for (const prop in dirtyFields) {
        const value = form[prop as keyof IProjectCardBasicsForm];
        const parsedValue =
          value instanceof Object ? getOptionId(value as IOption) : value === '' ? null : value;
        Object.assign(data, { [prop]: parsedValue });
      }

      if (projectId) {
        dispatch(silentPatchProjectCardThunk({ id: projectId, data }));
      }
    },
    [dispatch, projectId, dirtyFields],
  );

  return (
    <div className="basics-form">
      <form>
        <div className="basic-info-form">
          {formFields && <FormFieldCreator form={formFields} handleSave={handleSubmit(onSubmit)} />}
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectCardBasicsForm);
