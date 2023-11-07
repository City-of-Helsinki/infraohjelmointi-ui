import { formattedNumberToNumber } from '@/utils/calculations';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

const useNumberInput = (value?: string) => {
 
  const [inputValue, setInputValue] = useState<string | number | undefined>(
    formattedNumberToNumber(value),
  );
  
  const parsedValue = useMemo(() => inputValue?.toString(), [inputValue]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value.includes(",") && !e.target.value.includes(".")) {
        setInputValue(e.target.value);
      }
  }, []);

  // Update frame budget when a new value is emitted
  useEffect(() => {
    setInputValue(formattedNumberToNumber(value) || '0');
  }, [value]);

  return { value: parsedValue, onChange, setInputValue };
};

export default useNumberInput;
