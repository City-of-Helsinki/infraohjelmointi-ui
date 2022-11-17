import { IconArrowDown, IconMap, IconPlus } from 'hds-react/icons';
import { LabelIcon } from '../shared';

const ProjectCardToolbar = () => {
  return (
    <div className="project-card-toolbar-container">
      {/* left (new & share) */}
      <div className="display-flex">
        <button className="toolbar-button">
          <LabelIcon icon={IconPlus} text="new" />
        </button>
        <button className="toolbar-button">
          <LabelIcon icon={IconArrowDown} text="shareProject" />
        </button>
      </div>
      {/* right (map) */}
      <div className="display-flex">
        <IconMap aria-label="map" />
      </div>
    </div>
  );
};

export default ProjectCardToolbar;
