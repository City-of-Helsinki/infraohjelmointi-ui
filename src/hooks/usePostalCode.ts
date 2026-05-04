import { useEffect, useState } from 'react';
import { fetchAddressData } from '@/services/streetAddressService';

/**
 * Custom hook that retrieves and returns the postal code for a given address.
 *
 * @param address - The address used to look up the corresponding postal code.
 * @returns The resolved postal code for the provided address, or an empty string if unavailable.
 */
export function usePostalCode(address: string) {
  const [postalCode, setPostalCode] = useState<string>('');
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    if (!address) {
      setPostalCode('');
      setCity('');
      return;
    }

    let isActive = true;

    const debounceId = globalThis.setTimeout(() => {
      fetchAddressData(address)
        .then((data) => {
          if (!isActive) {
            return;
          }

          if (data?.features && data.features.length > 0) {
            const firstItemInListThatContainsPostalCode = data.features.find(
              (feature: { properties?: { postinumero?: string } }) =>
                feature?.properties?.postinumero,
            )?.properties;
            const postalCode = firstItemInListThatContainsPostalCode?.postinumero || '';
            const city = firstItemInListThatContainsPostalCode?.kaupunki || '';
            setPostalCode(postalCode);
            setCity(city);
          } else {
            setPostalCode('');
            setCity('');
          }
        })
        .catch((error) => {
          if (isActive) {
            console.error('Error fetching postal code:', error);
          }
        });
    }, 200);

    return () => {
      isActive = false;
      globalThis.clearTimeout(debounceId);
    };
  }, [address]);

  return { postalCode, city };
}
