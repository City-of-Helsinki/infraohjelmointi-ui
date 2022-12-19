import { IconArrowDown, IconMap } from 'hds-react/icons';
import { IconButton, Toolbar } from '../../shared';
import { ReactComponent as IconNewItem } from '@/assets/icons/new-item.svg';

const ProjectToolbar = () => {
  const click = () => console.log('click');
  return (
    <Toolbar
      left={
        <>
          <IconButton icon={IconNewItem} text="new" onClick={() => click()} />
          <IconButton icon={IconArrowDown} text="shareProject" onClick={() => click()} />
        </>
      }
      right={<IconMap aria-label="map" data-testid="test" />}
    />
  );
};

export default ProjectToolbar;
