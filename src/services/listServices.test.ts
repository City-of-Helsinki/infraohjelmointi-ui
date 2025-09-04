import axios from 'axios';
import { getProgrammers } from './listServices';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('listServices', () => {
  describe('getProgrammers', () => {
    it('filters out empty programmer ("Ei Valintaa") from the list', async () => {
      // Mock API response with both regular and empty programmers
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: 'Ei', lastName: 'Valintaa' },
          { id: '3', firstName: 'Jane', lastName: 'Smith' },
        ],
      });

      const result = await getProgrammers();

      // Verify that "Ei Valintaa" is not in the result
      expect(result).toEqual([
        { id: '1', value: 'John Doe' },
        { id: '3', value: 'Jane Smith' },
      ]);
    });

    it('filters out programmers with empty names', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: '', lastName: 'Empty' },
          { id: '3', firstName: 'Empty', lastName: '' },
          { id: '4', firstName: ' ', lastName: 'Whitespace' },
        ],
      });

      const result = await getProgrammers();

      // Verify that only programmers with non-empty names are included
      expect(result).toEqual([{ id: '1', value: 'John Doe' }]);
    });

    it('handles API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      await expect(getProgrammers()).rejects.toThrow('API error');
    });
  });
});
