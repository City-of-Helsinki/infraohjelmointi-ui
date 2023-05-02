import { IconArrowDown, IconMap } from 'hds-react/icons';
import { IconButton, Toolbar } from '../../shared';
import { ReactComponent as IconNewItem } from '@/assets/icons/new-item.svg';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { GroupDialog } from '../GroupDialog';

const ProjectToolbar = () => {
  const { Dropdown, Item } = Navigation;
  const { t } = useTranslation();

  const click = () => console.log('click');
  return (
    <Toolbar
      left={
        <>
          <Dropdown label={t('nav.notifications')}>
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
