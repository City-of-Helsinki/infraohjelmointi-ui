import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { RootState } from '@/store';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk, postProjectCardThunk } from '@/reducers/projectCardSlice';
import { useParams } from 'react-router-dom';
import './styles.css';

const ProjectCardBasicsForm: FC = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const { handleSubmit, formFields } = useProjectCardBasicsForm(projectCard);

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    // Currently we're re-assigning a smaller object, because all the values do not work for the API yet
    const data = {
      // type: form.type,
      description: form.description,
      entityName: form.entityName,
    };

    if (projectId) {
      dispatch(patchProjectCardThunk({ id: projectId, data })).then((res) => {
        console.log('PATCH response: ', res);
      });
    } else {
      dispatch(postProjectCardThunk({ data })).then((res) => {
        console.log('POST response: ', res);
      });
    }
  };

  return (
    <div className="basics-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="display-flex">
          <div className="basic-info-form">
            <FormFieldCreator form={formFields} />
          </div>
        </div>
        <Button type="submit">Lähetä</Button>
      </form>
    </div>
  );
};

export default ProjectCardBasicsForm;
