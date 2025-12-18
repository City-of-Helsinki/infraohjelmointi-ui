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

  useEffect(() => {
    if (address) {
      fetchAddressData(address)
        .then((data) => {
          if (data?.features && data.features.length > 0) {
            const postalCode = data.features[0].properties.postinumero;
            setPostalCode(postalCode);
          }
        })
        .catch((error) => {
          console.error('Error fetching postal code:', error);
        });
    }
  }, [address]);

  return postalCode;
}
