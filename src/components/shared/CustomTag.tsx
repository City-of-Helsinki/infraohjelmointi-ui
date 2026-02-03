import { LoadingSpinner } from 'hds-react';
import { FC, memo, ReactNode } from 'react';

interface ICustomTagProps {
  text: string;
  icon?: ReactNode;
  color?: string;
  size?: string;
  weight?: string;
  id?: string;
  textColor?: string;
  showLoading?: boolean;
  circular?: boolean;
}

/**
 * A rounded border tag like a HDS tag, but it fits an icon better and is easily customizeable
 * by us.
 */
const CustomTag: FC<ICustomTagProps> = ({
  icon,
  text,
  color,
  size,
  weight,
  id,
  textColor,
  showLoading,
  circular,
}) => {
  const containerClassName = circular
    ? 'custom-tag-container custom-tag-container--circular'
    : 'custom-tag-container';

  return (
    <div
      className={containerClassName}
      data-testid={id ?? ''}
      style={{
        background: color ?? 'var(--color-silver)',
        color: textColor ?? 'var(--color-black-90)',
      }}
    >
      {icon}
      <span
        className={`font-${weight ? weight : '500'}`}
        style={{ fontSize: size === 'm' ? '1rem' : '0.875rem' }}
      >
        {text}
      </span>
      {showLoading && (
        <div className="ml-[0.3rem]">
          <LoadingSpinner theme={{ '--spinner-color': 'var(--color-white)' }} small />
        </div>
      )}
    </div>
  );
};

export default memo(CustomTag);
