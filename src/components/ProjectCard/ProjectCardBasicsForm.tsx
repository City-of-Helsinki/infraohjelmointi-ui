import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import './styles.css';
import { RootState } from '@/store';
import { emptyStringsToNull, getOptionId } from '@/utils/common';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    const { type, area, ...formData } = emptyStringsToNull(
      form as IAppForms,
    ) as IProjectCardBasicsForm;

    const data: IProjectCardRequest = {
      ...formData,
      type: getOptionId(type),
      area: getOptionId(area),
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
        <Button type="submit">Tallenna perustiedot</Button>
      </form>
    </div>
  );
};

export default ProjectCardBasicsForm;
