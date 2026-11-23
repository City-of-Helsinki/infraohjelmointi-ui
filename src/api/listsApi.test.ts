import axios from 'axios';
import { listsApi } from './listsApi';
import { setupStore } from '@/store';
import type { MockedFunction } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as MockedFunction<typeof axios>;

const getProgrammers = () =>
  setupStore().dispatch(listsApi.endpoints.getProgrammers.initiate()).unwrap();

describe('listsApi', () => {
  describe('getProgrammers', () => {
    it('filters out empty programmer ("Ei Valintaa") from the list', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: 'Ei', lastName: 'Valintaa' },
          { id: '3', firstName: 'Jane', lastName: 'Smith' },
        ],
      });

      expect(await getProgrammers()).toEqual([
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '3', firstName: 'Jane', lastName: 'Smith' },
      ]);
    });

    it('filters out programmers with empty names', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: '', lastName: 'Empty' },
          { id: '3', firstName: 'Empty', lastName: '' },
          { id: '4', firstName: ' ', lastName: 'Whitespace' },
        ],
      });

      expect(await getProgrammers()).toEqual([{ id: '1', firstName: 'John', lastName: 'Doe' }]);
    });

    it('rejects on API errors', async () => {
      mockedAxios.mockRejectedValueOnce(new Error('API error'));

      await expect(getProgrammers()).rejects.toEqual({ status: undefined, data: 'API error' });
    });
  });
});
