import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { FC } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import './styles.css';
import { RootState } from '@/store';
import { IOption } from '@/interfaces/common';

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (form: IProjectCardBasicsForm) => {
    const emptyStringsToNull = (formData: IProjectCardBasicsForm) => {
      const transformedFields = Object.keys(formData)
        .filter((field) => typeof formData[field as keyof IProjectCardBasicsForm] === 'string')
        .reduce((accumulator, current) => {
          const key = current as keyof IProjectCardBasicsForm;
          return { ...accumulator, [current]: formData[key] || null };
        }, {});

      return { ...formData, ...transformedFields };
    };

    const getOptionId = (option: IOption) => option.value || null;

    const { type, area, ...formData } = emptyStringsToNull(form);

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
