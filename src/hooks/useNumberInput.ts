import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

const useNumberInput = (v?: string) => {
  const value = v ? v?.replace("−", "-") : '0';
  
  const [inputValue, setInputValue] = useState<string | number | undefined>(
    parseInt(value.replace(/\s/g, '')),
  );
  
  const parsedValue = useMemo(() => inputValue?.toString(), [inputValue]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
  }, []);

  // Update frame budget when a new value is emitted
  useEffect(() => {
    setInputValue(value ? parseInt(value.replace(/\s/g, '')) : '0');
  }, [value]);

  return { value: parsedValue, onChange };
};

export default useNumberInput;
