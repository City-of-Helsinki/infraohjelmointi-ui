import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { LoadingSpinner } from 'hds-react/components/LoadingSpinner';
import { FC, ReactNode } from 'react';
import './styles.css';

interface ILoaderProps {
  children: ReactNode;
}

/**
 * Wrap any component(s) that shouldn't be rendered before data is fetched in this component,
 * to add a loading spinner in the middle of the screen.
 *
 * @param children ReactNode, component(s) to render
 */
const Loader: FC<ILoaderProps> = ({ children }) => {
  const loading = useAppSelector((state: RootState) => state.loading);

  return (
    <>
      {loading.isLoading ? (
        <div className="loader-container">
          <LoadingSpinner loadingText={loading.text || ''} />
        </div>
      ) : (
        <div>{children}</div>
      )}
    </>
  );
};

export default Loader;
