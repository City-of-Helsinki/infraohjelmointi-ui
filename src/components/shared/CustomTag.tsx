import { FC, ReactNode } from 'react';

interface ICustomTagProps {
  text: string;
  icon?: ReactNode;
  color?: string;
  size?: string;
  weight?: string;
}

/**
 * A rounded border tag like a HDS tag, but it fits an icon better and is easily customizeable
 * by us.
 */
const CustomTag: FC<ICustomTagProps> = ({ icon, text, color, size, weight }) => {
  return (
    <div
      className="custom-tag-container"
      style={{
        background: color || 'var(--color-silver)',
      }}
    >
      {icon}
      <span
        className={`font-${weight ? weight : 'bold'}`}
        style={{ fontSize: size === 'm' ? '1rem' : '0.875rem' }}
      >
        {text}
      </span>
    </div>
  );
};

export default CustomTag;
