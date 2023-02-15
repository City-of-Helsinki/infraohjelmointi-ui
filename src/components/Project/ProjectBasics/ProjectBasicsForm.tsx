import useProjectBasicsForm from '@/forms/useProjectBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import { FormFieldCreator } from '../../shared';
import { selectProject, silentPatchProjectThunk } from '@/reducers/projectSlice';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import useClassList from '@/hooks/useClassList';
import useLocationList from '@/hooks/useLocationList';
import './styles.css';

const ProjectBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { formFields, formMethods } = useProjectBasicsForm();

  const projectId = useAppSelector(selectProject)?.id;

  useClassList(true);
  useLocationList(true);

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
  } = formMethods;

  const onSubmit = useCallback(
    (form: IProjectBasicsForm) => {
      const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);
      projectId && dispatch(silentPatchProjectThunk({ id: projectId, data }));
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

export default memo(ProjectBasicsForm);
