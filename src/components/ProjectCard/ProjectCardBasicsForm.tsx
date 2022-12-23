import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback } from 'react';
import { FieldValues, FormProvider, SubmitHandler } from 'react-hook-form';
import { Autosave, FormFieldCreator } from '../shared';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { RootState } from '@/store';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import './basicsFormStyles.css';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { formFields, formMethods } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const {
    formState: { dirtyFields },
  } = formMethods;

  const onSubmit = useCallback(
    async (form: IProjectCardBasicsForm) => {
      const data: IProjectCardRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);
      projectId && (await dispatch(silentPatchProjectCardThunk({ id: projectId, data })));
    },
    [dirtyFields, projectId, dispatch],
  );

  return (
    <div className="basics-form">
      <FormProvider {...formMethods}>
        <div className="basic-info-form">
          {formFields && <FormFieldCreator form={formFields} />}
        </div>
        <Autosave onSubmit={onSubmit as SubmitHandler<FieldValues>} />
      </FormProvider>
    </div>
  );
};

export default memo(ProjectCardBasicsForm);
