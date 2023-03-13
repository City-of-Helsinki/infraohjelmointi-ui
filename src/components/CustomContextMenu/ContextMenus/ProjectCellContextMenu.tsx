import { Button } from 'hds-react/components/Button';
import { IconCross } from 'hds-react/icons';
import './styles.css';

const ProjectCellContextMenu = ({
  handleCloseContextMenu,
}: {
  handleCloseContextMenu: () => void;
}) => {
  return (
    <div className="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title">{'Hakaniemenpuiston esirakentaminen'}</p>
        </div>
        <IconCross className="close-icon" onClick={handleCloseContextMenu} />
      </div>
      <div className="project-cell-menu-content">
        <p className="font-bold">2026</p>
        <ul className="py-2">
          <li className="mb-2 flex h-8 items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-black"></div>
            <span className="">Suunnittelu</span>
          </li>
          <li className="flex h-8 items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-black"></div>
            <span className="">Rakentaminen</span>
          </li>
        </ul>
      </div>
      <div className="project-cell-menu-footer flex flex-col ">
        <Button variant="supplementary" iconLeft={undefined}>
          Poista vuosi aikajanalta
        </Button>
        <Button variant="supplementary" iconLeft={undefined}>
          Muokkaa aikajanaa
        </Button>
      </div>
    </div>
  );
};

export default ProjectCellContextMenu;
