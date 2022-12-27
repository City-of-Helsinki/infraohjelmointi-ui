import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import { FormFieldCreator } from '../shared';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { RootState } from '@/store';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import './basicsFormStyles.css';
import { FieldValues, SubmitHandler } from 'react-hook-form';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { formFields, formMethods } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
  } = formMethods;

  const onSubmit = useCallback(
    (form: IProjectCardBasicsForm) => {
      if (isDirty) {
        const data: IProjectCardRequest = dirtyFieldsToRequestObject(
          dirtyFields,
          form as IAppForms,
        );
        projectId && dispatch(silentPatchProjectCardThunk({ id: projectId, data }));
      }
    },
    [dirtyFields, projectId, dispatch, isDirty],
  );

  return (
    <div className="basics-form">
      <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
        <div className="basic-info-form">
          <FormFieldCreator form={formFields} />
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectCardBasicsForm);
