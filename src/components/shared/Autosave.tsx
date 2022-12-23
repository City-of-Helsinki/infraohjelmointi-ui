import { debounce } from 'lodash';
import { FC, memo, useCallback } from 'react';

import { FieldValues, SubmitHandler, useFormContext, useWatch } from 'react-hook-form';
import useDeepCompareEffect from 'use-deep-compare-effect';

interface IAutosaveProps {
  onSubmit: SubmitHandler<FieldValues>;
}

/**
 * Autosave component that needs to be wrapped inside a FormProvider. It will watch the form values and
 * trigger the onSubmit function related to the form with a 3s debounce delay.
 *
 * @param onSubmit react-hook-forms onSubmit function
 */
const Autosave: FC<IAutosaveProps> = ({ onSubmit }) => {
  const formMethods = useFormContext();
  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = formMethods;

  // Call the form onSubmit function after 3s, timer will reset onChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(() => {
      handleSubmit(onSubmit)();
    }, 3000),
    [dirtyFields],
  );

  // Watch form control change to check if there are dirty fields
  const watchedData = useWatch({
    control: control,
  });

  // Call debounceSave() if form is dirty
  useDeepCompareEffect(() => {
    isDirty && debouncedSave();
  }, [watchedData]);

  return null;
};

Autosave.displayName = 'Autosave';

export default memo(Autosave);
