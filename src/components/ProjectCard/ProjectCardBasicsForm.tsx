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
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';

const ProjectCardBasicsForm: FC = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const { handleSubmit, formFields } = useProjectCardBasicsForm(projectCard);

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    // Currently we're re-assigning a smaller object, because all the values do not work for the API yet
    const data: IProjectCardRequest = {
      type: form.type.value,
      description: form.description,
      entityName: form.entityName,
      hkrId: form.hkrId,
      area: form.area.value,
      hashTags: form.hashTags,
      sapNetwork: form.sapNetwork,
      sapProject: form.sapNetwork,
    };

    console.log('Formdata to be posted: ', form);

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
