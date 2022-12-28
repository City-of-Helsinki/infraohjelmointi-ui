import { IconArrowDown, IconMap, IconPlus } from 'hds-react/icons';
import { IconButton, Toolbar } from '../../shared';

const ProjectCardToolbar = () => {
  const click = () => console.log('click');
  return (
    <Toolbar
      left={
        <>
          <IconButton icon={IconPlus} text="new" onClick={() => click()} />
          <IconButton icon={IconArrowDown} text="shareProject" onClick={() => click()} />
        </>
      }
      right={<IconMap aria-label="map" data-testid="test" />}
    />
  );
};

export default ProjectCardToolbar;
