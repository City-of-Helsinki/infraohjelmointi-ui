import { useAppSelector } from '@/hooks/common';
import { selectIsLoading, selectLoadingText } from '@/reducers/loadingSlice';
import { LoadingSpinner } from 'hds-react/components/LoadingSpinner';
import { FC } from 'react';
import './styles.css';

/**
 * An overlay component for App.tsx that becomes visible when redux loading.isLoading = true.
 * The loading state is triggered in the axios interceptor.
 */
const Loader: FC = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const text = useAppSelector(selectLoadingText);

  return (
    <>
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <LoadingSpinner loadingText={text || ''} />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
