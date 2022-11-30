import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk } from '@/reducers/projectCardSlice';
import { useParams } from 'react-router-dom';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { useTranslation } from 'react-i18next';
import './styles.css';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const { t } = useTranslation();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    const { type, area, ...formData } = form;

    const data: IProjectCardRequest = {
      type: type.value,
      area: area.value,
      ...formData,
    };

    console.log('Posting with data: ', { id: '79e6bc78-9fa2-49a1-aaad-b50030da170e', data });

    dispatch(patchProjectCardThunk({ id: '79e6bc78-9fa2-49a1-aaad-b50030da170e', data })).then(
      (res) => {
        console.log('PATCH response: ', res);
      },
    );
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
