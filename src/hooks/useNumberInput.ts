import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

const useNumberInput = (value?: string) => {
  const [inputValue, setInputValue] = useState<string | number | undefined>(
    value ? parseInt(value.replace(/\s/g, '')) : '0',
  );

  const parsedValue = useMemo(() => inputValue?.toString(), [inputValue]);

  // Removes the zero value on change if there is only one zero in the value
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // If the value is more than one zero set the form value normally
    if (/^0{2,}/.exec(e.target.value)) {
      setInputValue(e.target.value);
    }
    // If value is just a zero replace it
    else {
      setInputValue(e.target.value ? +e.target.value : 0);
    }
  }, []);

  // Update frame budget when a new value is emitted
  useEffect(() => {
    setInputValue(value ? parseInt(value.replace(/\s/g, '')) : '0');
  }, [value]);

  return { value: parsedValue, onChange };
};

export default useNumberInput;
