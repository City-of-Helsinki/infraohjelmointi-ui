import { FC } from 'react';
import MyWorkloadDesignView from '../Design';
import MyWorkloadConstructionView from '../Construction';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';

const constructionKeywords = ['construction', 'rakent'];
const designKeywords = ['design', 'suunnitt'];

const getMyWorkloadViewType = (user: ReturnType<typeof selectUser>): 'design' | 'construction' => {
  // TODO: ai:n tekemä ehdotus, kuinka voidaan tarkastaa käyttäjän rooli. Ei näytä
  // kuitenkaan toimivan: userMetaan ei näytä poimiutuvan tähän sopivia termejä.
  // Varmista tämä, kun kaikki palaavat lomilta ja saa tietoa, kuinka erottaa kummasta käyttäjästä on kyse
  const userGroupNames = user?.ad_groups
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

  return viewType === 'design' ? <MyWorkloadDesignView /> : <MyWorkloadConstructionView />;
};

export default MyWorkloadBaseView;
