import { FC, ReactNode } from 'react';

interface IToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

const Toolbar: FC<IToolbarProps> = ({ left, right }) => {
  return (
    <div className="h-14 flex items-center justify-between px-6" data-testid="toolbar">
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
