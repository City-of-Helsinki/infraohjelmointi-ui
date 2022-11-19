import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { LoadingSpinner } from 'hds-react/components/LoadingSpinner';
import { FC } from 'react';
import './styles.css';

/**
 * An overlay component for App.tsx that becomes visible when redux loading.isLoading = true.
 * The loading state is triggered in the axios interceptor.
 */
const Loader: FC = () => {
  const loading = useAppSelector((state: RootState) => state.loading);

  return (
    <>
      {loading.isLoading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <LoadingSpinner loadingText={loading.text || ''} />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
