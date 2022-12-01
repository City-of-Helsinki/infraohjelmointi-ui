import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { RootState } from '@/store';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    const { type, area, ...formData } = form;

    const data: IProjectCardRequest = {
      ...formData,
      type: type.value,
      area: area.value,
    };

    if (projectId) {
      dispatch(patchProjectCardThunk({ id: projectId, data }));
    }
  };

  return (
    <div className="basics-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="basic-info-form">
          <FormFieldCreator form={formFields} />
        </div>
        <Button type="submit">{t('send')}</Button>
      </form>
    </div>
  );
};

export default ProjectCardBasicsForm;
