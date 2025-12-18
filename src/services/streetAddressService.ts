/**
 * Extracts the non-numeric prefix of a street address, trimming trailing whitespace.
 *
 * @param input - The street address text to parse.
 * @returns The street name portion (leading non-digit characters) or an empty string if none are found.
 */
function getStreetName(input: string) {
  const matches = /^\D+/.exec(input);
  if (matches) {
    return matches[0].trimEnd();
  }
  return '';
}

/**
 * Extracts the trailing numeric sequence from a street address string.
 *
 * @param input - The street address that may end with a numeric component.
 * @returns The numeric substring found at the end of the address, or `'1'` if no digits are present.
 */
function getStreetNumber(input: string) {
  const matches = /\d{1,5}$/.exec(input);
  if (matches) {
    return matches[0];
  }
  return '1';
}

/**
 * Retrieves address metadata from the City of Helsinki open data service using the provided address.
 *
 * @param address - The full address string used to extract the street name and number for the query.
 * @returns A promise resolving to the JSON payload returned by the geoserver.
 */
export async function fetchAddressData(address: string) {
  const streetName = getStreetName(address);
  const streetNumber = getStreetNumber(address);

  let url =
    'https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=avoindata:Helsinki_osoiteluettelo&OUTPUTFORMAT=json&SORTBY=katunimi,osoitenumero&COUNT=300';

  url += `&CQL_FILTER=((katunimi%20ILIKE%20%27${streetName}%25%27%20OR%20gatan%20ILIKE%20%27${streetName}%25%27)AND(osoitenumero=%27${streetNumber}%27))`;

  const response = await fetch(url);
  return response.json();
}
