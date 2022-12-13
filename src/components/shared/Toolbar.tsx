import { FC, ReactNode } from 'react';

interface IToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

const Toolbar: FC<IToolbarProps> = ({ left, right }) => {
  return (
    <div className="toolbar-container">
      {/* left (new & share) */}
      <div className="display-flex">{left}</div>
      {/* right (map) */}
      <div className="display-flex">{right}</div>
    </div>
  );
};

export default Toolbar;
