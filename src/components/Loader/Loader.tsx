import { useAppSelector } from '@/hooks/common';
import { selectIsLoading, selectLoadingText } from '@/reducers/loadingSlice';
import { LoadingSpinner } from 'hds-react/components/LoadingSpinner';
import { FC } from 'react';

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
        <div
          className="fixed z-[9] -mt-20 h-full w-full overflow-hidden"
          data-testid="loader-wrapper"
        >
          <div
            className="absolute top-1/2 left-1/2 translate-x-1/2 translate-y-1/2"
            data-testid="loader"
          >
            <LoadingSpinner loadingText={text || ''} />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
