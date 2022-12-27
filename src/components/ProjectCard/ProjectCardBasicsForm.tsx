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
import _ from 'lodash';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { formFields, formMethods } = useProjectCardBasicsForm();
  const projectId = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard?.id,
    _.isEqual,
  );

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
  } = formMethods;

  const onSubmit = useCallback(
    (form: IProjectCardBasicsForm) => {
      const data: IProjectCardRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);
      projectId && dispatch(silentPatchProjectCardThunk({ id: projectId, data }));
    },
    [dirtyFields, projectId, dispatch],
  );

  return (
    <div className="basics-form">
      <form onBlur={isDirty ? (handleSubmit(onSubmit) as SubmitHandler<FieldValues>) : undefined}>
        <div className="basic-info-form">
          <FormFieldCreator form={formFields} />
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectCardBasicsForm);
