import { FC, ReactNode } from 'react';

interface IToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

const Toolbar: FC<IToolbarProps> = ({ left, right }) => {
  return (
    <div className="h-14 flex items-center justify-between px-6">
      {/* left (new & share) */}
      <div className="flex">{left}</div>
      {/* right (map) */}
      <div className="flex">{right}</div>
    </div>
  );
};

export default Toolbar;
