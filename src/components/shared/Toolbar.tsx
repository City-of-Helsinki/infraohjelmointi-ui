import { FC, ReactNode } from 'react';
import './styles.css';

interface IToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

const Toolbar: FC<IToolbarProps> = ({ left, right }) => {
  return (
    <div className="toolbar-container" data-testid="toolbar">
      {/* left (new & share) */}
      <div className="flex" data-testid="toolbar-left">
        {left}
      </div>
      {/* right (map) */}
      <div className="flex" data-testid="toolbar-right">
        {right}
      </div>
    </div>
  );
};

export default Toolbar;
