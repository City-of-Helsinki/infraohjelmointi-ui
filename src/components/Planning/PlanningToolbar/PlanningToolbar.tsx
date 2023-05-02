import { Icon, Toolbar } from '../../shared';
import { ReactComponent as IconNewItem } from '@/assets/icons/new-item.svg';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { GroupDialog } from '../GroupDialog';

const ProjectToolbar = () => {
  const { Dropdown, Item } = Navigation;
  const { t } = useTranslation();

  return (
    <Toolbar
      left={
        <>
          <Dropdown label={t(`new`)} icon={<Icon icon={IconNewItem} />}>
            <Item>
              <GroupDialog />
            </Item>
          </Dropdown>
        </>
      }
    />
  );
};

export default ProjectToolbar;
