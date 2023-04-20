import { LoadingSpinner } from 'hds-react/components/LoadingSpinner';
import { FC } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectIsLoading } from '@/reducers/loaderSlice';
import './styles.css';

/**
 * An overlay component for App.tsx that becomes visible when redux loading.isLoading = true.
 * The loading state is triggered in the axios interceptor.
 */
const Loader: FC = () => {
  const isLoading = useAppSelector(selectIsLoading);

  return (
    <>
      {isLoading && (
        <div className="loader-container" data-testid="loader-wrapper">
          <div className="loader-wrapper" data-testid="loader">
            <LoadingSpinner loadingText={'loading'} />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
