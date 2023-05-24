import { Icon, Toolbar } from '../../shared';
import { ReactComponent as IconNewItem } from '@/assets/icons/new-item.svg';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { GroupDialog } from '../GroupDialog';
import './styles.css';
const ProjectToolbar = () => {
  const { Dropdown, Item } = Navigation;
  const { t } = useTranslation();

  return (
    <Toolbar
      left={
        <>
          <Dropdown
            className="planning-toolbar-dropdown"
            label={t(`new`)}
            icon={<Icon icon={IconNewItem} />}
          >
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
