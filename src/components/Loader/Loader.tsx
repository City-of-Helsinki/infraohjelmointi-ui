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
        <div className="h-full w-full fixed z-[9] overflow-hidden -mt-20">
          <div className="absolute top-1/2 left-1/2 translate-x-1/2 translate-y-1/2">
            <LoadingSpinner loadingText={text || ''} />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
