import { fetchAddressData } from './streetAddressService';
import type { Mock } from 'vitest';

describe('fetchAddressData', () => {
  const baseUrl =
    'https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=avoindata:Helsinki_osoiteluettelo&OUTPUTFORMAT=json&SORTBY=katunimi,osoitenumero&COUNT=300';

  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('calls the address service with the parsed street data', async () => {
    const jsonMock = vi.fn().mockResolvedValue({ features: [] });
    (globalThis.fetch as unknown as Mock).mockResolvedValue({ json: jsonMock });

    const address = 'Mannerheimintie 10';
    const expectedUrl =
      `${baseUrl}&CQL_FILTER=((katunimi%20ILIKE%20%27Mannerheimintie%25%27%20OR%20gatan%20ILIKE%20%27Mannerheimintie%25%27)` +
      `AND(osoitenumero=%2710%27))`;

    const result = await fetchAddressData(address);

    expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(jsonMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ features: [] });
  });

  it('does not return search param for street number when no trailing digits exist', async () => {
    const jsonMock = vi.fn().mockResolvedValue({ features: [{ id: 1 }] });
    (globalThis.fetch as unknown as Mock).mockResolvedValue({ json: jsonMock });

    const address = 'Testikuja 5B';
    const expectedUrl = `${baseUrl}&CQL_FILTER=((katunimi%20ILIKE%20%27Testikuja%25%27%20OR%20gatan%20ILIKE%20%27Testikuja%25%27))`;

    const result = await fetchAddressData(address);

    expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(jsonMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ features: [{ id: 1 }] });
  });
});
