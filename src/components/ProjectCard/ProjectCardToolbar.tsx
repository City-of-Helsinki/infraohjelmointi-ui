import { IconArrowDown, IconMap, IconPlus } from 'hds-react/icons';
import { IconButton } from '../shared';

const ProjectCardToolbar = () => {
  const click = () => console.log('click');
  return (
    <div className="project-card-toolbar-container">
      {/* left (new & share) */}
      <div className="display-flex">
        <IconButton icon={IconPlus} text="new" onClick={() => click()} />
        <IconButton icon={IconArrowDown} text="shareProject" onClick={() => click()} />
      </div>
      {/* right (map) */}
      <div className="display-flex">
        <IconMap aria-label="map" data-testid="test" />
      </div>
    </div>
  );
};

export default ProjectCardToolbar;
