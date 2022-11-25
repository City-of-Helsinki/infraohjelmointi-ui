import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk, postProjectCardThunk } from '@/reducers/projectCardSlice';
import { useParams } from 'react-router-dom';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import './styles.css';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    const { type, area, ...formData } = form;

    const data: IProjectCardRequest = {
      type: type.value,
      area: area.value,
      ...formData,
    };

    if (projectId) {
      dispatch(patchProjectCardThunk({ id: projectId, data })).then((res) => {
        console.log('PATCH response: ', res);
      });
    } else {
      // creation of new project cards isn't fully documented yet
      dispatch(postProjectCardThunk({ data })).then((res) => {
        console.log('POST response: ', res);
      });
    }
  };

  return (
    <div className="basics-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="basic-info-form">
          <FormFieldCreator form={formFields} />
        </div>
        <Button type="submit">Lähetä</Button>
      </form>
    </div>
  );
};

export default ProjectCardBasicsForm;
