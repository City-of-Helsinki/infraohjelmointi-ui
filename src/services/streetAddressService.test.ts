import { fetchAddressData } from './streetAddressService';

describe('fetchAddressData', () => {
  const baseUrl =
    'https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=avoindata:Helsinki_osoiteluettelo&OUTPUTFORMAT=json&SORTBY=katunimi,osoitenumero&COUNT=300';

  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('calls the address service with the parsed street data', async () => {
    const jsonMock = jest.fn().mockResolvedValue({ features: [] });
    (global.fetch as unknown as jest.Mock).mockResolvedValue({ json: jsonMock });

    const address = 'Mannerheimintie 10';
    const expectedUrl =
      `${baseUrl}&CQL_FILTER=((katunimi%20ILIKE%20%27Mannerheimintie%25%27%20OR%20gatan%20ILIKE%20%27Mannerheimintie%25%27)` +
      `AND(osoitenumero=%2710%27))`;

    const result = await fetchAddressData(address);

    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(jsonMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ features: [] });
  });

  it('falls back to street number 1 when no trailing digits exist', async () => {
    const jsonMock = jest.fn().mockResolvedValue({ features: [{ id: 1 }] });
    (global.fetch as unknown as jest.Mock).mockResolvedValue({ json: jsonMock });

    const address = 'Testikuja 5B';
    const expectedUrl =
      `${baseUrl}&CQL_FILTER=((katunimi%20ILIKE%20%27Testikuja%25%27%20OR%20gatan%20ILIKE%20%27Testikuja%25%27)` +
      `AND(osoitenumero=%271%27))`;

    const result = await fetchAddressData(address);

    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(jsonMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ features: [{ id: 1 }] });
  });
});
