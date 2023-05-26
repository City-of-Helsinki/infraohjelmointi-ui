import { Icon, IconButton, Toolbar } from '../../shared';
import { ReactComponent as IconNewItem } from '@/assets/icons/new-item.svg';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { GroupDialog } from '../GroupDialog';
import './styles.css';
import { IconCross } from 'hds-react/icons/';
import { useCallback, useRef } from 'react';
const ProjectToolbar = () => {
  const { Dropdown, Item } = Navigation;
  const dropDownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => {
    dropDownRef.current?.click();
  }, [dropDownRef]);
  const { t } = useTranslation();

  return (
    <Toolbar
      left={
        <>
          <div ref={dropDownRef}>
            <Dropdown
              className="planning-toolbar-dropdown"
              label={t(`new`)}
              icon={<Icon icon={IconNewItem} />}
            >
              <div className="dropdown-header border-b-2 border-gray">
                <div>Uusi</div>
                <div>
                  <IconButton icon={IconCross} onClick={closeDropdown}></IconButton>
                </div>
              </div>
              <Item>
                <GroupDialog />
              </Item>
            </Dropdown>
          </div>
        </>
      }
    />
  );
};

export default ProjectToolbar;
