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

    const debounceId = window.setTimeout(() => {
      fetchAddressData(address)
        .then((data) => {
          if (!isActive) {
            return;
          }

          if (data?.features && data.features.length > 0) {
            const postalCode = data.features[0].properties.postinumero;
            const city = data.features[0].properties.kaupunki;
            setPostalCode(postalCode);
            setCity(city);
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
      window.clearTimeout(debounceId);
    };
  }, [address]);

  return { postalCode, city };
}
