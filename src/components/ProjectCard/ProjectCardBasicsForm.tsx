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
import { emptyStringsToNull, getOptionId } from '@/utils/common';

// const getObjectsDifferences = (obj1: any, obj2: any) => {
//   const differences = [];

//   for (const key of Object.keys(obj1)) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (obj1[key].hasOwnProperty('value') && obj1[key].value !== obj2[key].value) {
//       console.log('value found');
//       differences.push({
//         key: key,
//         value: getOptionId(obj2[key]),
//       });
//     } else if (Array.isArray(obj1[key])) {
//       console.log('was array');
//       // differences.push({
//       //   key: key,
//       //   value: [...obj2[key]],
//       // });
//     } else if (obj1[key] !== obj2[key]) {
//       differences.push({
//         key: key,
//         value: obj2[key],
//       });
//     }
//   }
//   return differences;
// };

const ProjectCardBasicsForm: FC = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit, formFields } = useProjectCardBasicsForm();
  const projectId = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard)?.id;

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = useCallback(
    async (form: IProjectCardBasicsForm) => {
      const { type, area, ...formData } = emptyStringsToNull(
        form as IAppForms,
      ) as IProjectCardBasicsForm;

      const data: IProjectCardRequest = {
        ...formData,
        type: getOptionId(type),
        area: getOptionId(area),
      };

      if (projectId) {
        dispatch(silentPatchProjectCardThunk({ id: projectId, data }));
      }
    },
    [dispatch, projectId],
  );

  return (
    <div className="basics-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="basic-info-form">
          <FormFieldCreator form={formFields} handleSave={handleSubmit(onSubmit)} />
        </div>
      </form>
    </div>
  );
};

export default memo(ProjectCardBasicsForm);
