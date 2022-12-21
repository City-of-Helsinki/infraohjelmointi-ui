import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import './basicsFormStyles.css';
import { RootState } from '@/store';
import { dirtyFieldsToRequestObject } from '@/utils/common';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit, formFields, dirtyFields } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = useCallback(
    async (form: IProjectCardBasicsForm) => {
      const data: IProjectCardRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);
      projectId && (await dispatch(silentPatchProjectCardThunk({ id: projectId, data })));
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
