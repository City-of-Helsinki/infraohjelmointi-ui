import { FC } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import useMyWorkloadRows, { MyWorkloadViewType } from './useMyWorkloadRows';
import { useTranslation } from 'react-i18next';
import classes from './styles.module.css';
import MyWorkloadTasks from './MyWorkloadTasks';
import MyWorkloadTable from './MyWorkloadTable';

const constructionKeywords = ['construction', 'rakent'];
const designKeywords = ['design', 'suunnitt'];

const getMyWorkloadViewType = (user: ReturnType<typeof selectUser>): MyWorkloadViewType => {
  // TODO: AI-suggestion on how to know if a user is a design or construction user.
  // For now, we check if the user has any of the keywords in their groups or department name.
  // In reality metadata does not seem to reliably contain said words,
  // so this is a temporary solution until we have a better way to determine the view type.
  const userGroupNames = (user?.ad_groups ?? [])
    .flatMap((group) => [group.name, group.display_name])
    .join(' ')
    .toLowerCase();
  const userDepartmentName = user?.department_name?.toLowerCase() ?? '';

  const userMeta = `${userGroupNames ?? ''} ${userDepartmentName}`;

  if (constructionKeywords.some((keyword) => userMeta.includes(keyword))) {
    return 'construction';
  }

  if (designKeywords.some((keyword) => userMeta.includes(keyword))) {
    return 'design';
  }

  return 'design';
};

const MyWorkloadBaseView: FC = () => {
  const user = useAppSelector(selectUser);
  const viewType = getMyWorkloadViewType(user);
  const { t } = useTranslation();
  const { rows: listOfProjects, isLoading, hasError } = useMyWorkloadRows(viewType);

  return (
    <div id="construction-my-workload-base-view" className={classes.contentContainer}>
      <h1 className={`${classes.mainTitle} text-heading-xl`}>{t('myWorkloadView.mainTitle')}</h1>
      <MyWorkloadTasks />
      <MyWorkloadTable
        listOfProjects={listOfProjects}
        isLoading={isLoading}
        hasError={hasError}
        viewType={viewType}
      />
    </div>
  );
};

export default MyWorkloadBaseView;
