import { IProject } from '@/interfaces/projectInterfaces';
import { useAppSelector } from './common';
import {
  selectProjectDistricts,
  selectProjectDivisions,
  selectProjectSubDivisions,
} from '@/reducers/listsSlice';

/**
 * Hook to retrieve the project district object based on the project's district ID.
 * Tries to find the most specific match for the project's district,
 * starting from sub-divisions, then divisions, and finally districts.
 * @param project The project object containing the project district information.
 * @returns The project district object corresponding to the project's district ID, or undefined if not found.
 */
export default function useProjectDistrict(project?: IProject) {
  const districts = useAppSelector(selectProjectDistricts);
  const divisions = useAppSelector(selectProjectDivisions);
  const subDivisions = useAppSelector(selectProjectSubDivisions);
  const all = [...subDivisions, ...divisions, ...districts];
  return all.find((item) => item.id === project?.projectDistrict);
}
