import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { RootState, setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { act, waitFor, within, screen } from '@testing-library/react';
import AdminView from './AdminView';
import { mockHashTags } from '@/mocks/mockHashTags';
import AdminFunctions from '@/components/Admin/AdminFunctions';
import AdminHashtags from '@/components/Admin/AdminHashtags';
import { adminFunctions } from '@/interfaces/adminInterfaces';
import { mockUser } from '@/mocks/mockUsers';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const store = setupStore();
const mockedAxios = axios as jest.Mocked<typeof axios>;

const defaultState: RootState = {
  ...store.getState(),
  hashTags: {
    hashTags: mockHashTags.data.hashTags,
    popularHashTags: mockHashTags.data.popularHashTags,
    error: null,
  },
  auth: {
    ...store.getState().auth,
    user: {
      ...mockUser.data,
    },
  },
};

const render = async (customState?: object | null, customRoute?: string) =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/admin" element={<AdminView />}>
          <Route path="functions" element={<AdminFunctions />} />
          <Route path="hashtags" element={<AdminHashtags />} />
        </Route>
      </>,
      {
        preloadedState: customState ?? defaultState,
      },
      { route: customRoute ? customRoute : '/admin/functions' },
    ),
  );

describe('AdminView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and admin functions using the outlet and has all but hashtag functions disabled', async () => {
    const { findByTestId, getByTestId } = await render();

    expect(await findByTestId('admin-view-title')).toHaveTextContent('helloUser');

    adminFunctions.forEach((af) => {
      expect(getByTestId(`admin-card-${af}`)).toBeInTheDocument();
      if (af === 'hashtags' || af === 'forcedtoframestate') {
        expect(getByTestId(`admin-card-button-${af}`)).not.toBeDisabled();
      } else {
        expect(getByTestId(`admin-card-button-${af}`)).toBeDisabled();
      }
    });
  });

  it('can navigate to admin hashtags', async () => {
    const { findByTestId, user } = await render();
    const hashtagsButton = await findByTestId('admin-card-button-hashtags');

    await user.click(hashtagsButton);

    const title = await findByTestId('admin-view-title');

    expect(title).not.toHaveTextContent('helloUser');
    expect(title).toHaveTextContent('adminFunctions.hashtags.name');
    expect(await findByTestId('admin-hashtags')).toBeInTheDocument();
  });

  describe('AdminHashtags', () => {
    it('renders 10 hashtag rows at a time to the table and can move with the pagination', async () => {
      const { findByTestId, store, queryByTestId } = await render(null, '/admin/hashtags');

      const allHashtags = store.getState().hashTags.hashTags;
      const firstPageHashtags = allHashtags.slice(0, 10);
      const secondPageHashtags = allHashtags.slice(10, 20);

      // Renders the first 10 hashtags and creates a cell for each key in the hashtags object
      firstPageHashtags.forEach(async (fph, i) => {
        Object.keys(fph).forEach(async (k) => {
          if (k !== 'id') {
            expect(await findByTestId(`${k}-${i}`));
          }
        });
      });

      // Doesn't render an 11th hashtag row
      expect(queryByTestId('value-10')).toBeNull();

      // Renders two pages (1 and 2)
      expect(
        (await findByTestId('hds-pagination')).getElementsByTagName('ul')[0].children.length,
      ).toBe(2);

      const nextButton = screen.getByRole('button', { name: /Seuraava/i });
      expect(nextButton).toBeInTheDocument();
      // Renders the rest of the hashtags and creates a cell for each key in the hashtags object
      secondPageHashtags.forEach(async (fph, i) => {
        Object.keys(fph).forEach(async (k) => {
          if (k !== 'id') {
            expect(await findByTestId(`${k}-${i}`));
          }
        });
      });
    });

    it('can search for hashtags in the table', async () => {
      const { findByTestId, user } = await render(null, '/admin/hashtags');

      await user.type(
        (await findByTestId('admin-hashtags-toolbar')).getElementsByTagName('input')[0],
        'testhashtag',
      );

      // displays the hashtags that contain the search word
      expect(await findByTestId('value-0')).toHaveTextContent('testhashtag1');

      for (let i = 1; i < 5; i++) {
        expect(await findByTestId(`value-${i - 1}`)).toHaveTextContent(`testhashtag${i}`);
      }

      await user.clear(
        (await findByTestId('admin-hashtags-toolbar')).getElementsByTagName('input')[0],
      );

      // resets the list after clearing the search field
      expect(await findByTestId('value-0')).toHaveTextContent('leikkipaikka');
    });

    it('can archive a hashtag by patching', async () => {
      const patchHashtagResponse = {
        data: {
          value: 'leikkipaikka',
          id: 'hashtag-1',
          usageCount: 0,
          archived: true,
          createdDate: '2023-08-04T15:51:02.348709+03:00',
        },
      };

      mockedAxios.patch.mockResolvedValueOnce(patchHashtagResponse);

      const { findByTestId, user, store } = await render(null, '/admin/hashtags');

      const hashtagIdToPatch = mockHashTags.data.hashTags[0].id;

      expect(await findByTestId(`archive-hashtag-${hashtagIdToPatch}`)).toHaveTextContent(
        'archive',
      );
      expect(await findByTestId(`archived-0`)).toHaveTextContent('inUse');
      await user.click(await findByTestId(`archive-hashtag-${hashtagIdToPatch}`));

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `localhost:4000/project-hashtags/${hashtagIdToPatch}/`,
        {
          archived: true,
        },
      );

      const response = await mockedAxios.patch.mock.results[0].value;

      expect(response).toStrictEqual(patchHashtagResponse);

      expect(store.getState().hashTags.hashTags[0].archived).toBeTruthy();

      await waitFor(async () => {
        expect(await findByTestId(`archive-hashtag-${hashtagIdToPatch}`)).toHaveTextContent(
          'restore',
        );
        expect(await findByTestId(`archived-0`)).toHaveTextContent('archived');
      });
    });

    it('can add a new hashtag', async () => {
      const newHashtagResponse = {
        data: {
          value: 'aakkonen',
          id: 'hashtag-12',
          usageCount: 0,
          archived: false,
          createdDate: '2023-08-04T15:51:02.348709+03:00',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(newHashtagResponse);

      const { findByTestId, user, findByRole, store } = await render(null, '/admin/hashtags');

      await user.click(await findByTestId('add-hashtag-button'));

      const dialog = within(await findByRole('dialog'));

      expect(await dialog.findByText(`addHashTag`)).toBeInTheDocument();
      expect(await dialog.findByText(`hashtagName`)).toBeInTheDocument();
      expect(await dialog.findByText(`save`)).toBeInTheDocument();
      expect(await dialog.findByText(`cancel`)).toBeInTheDocument();

      await user.type(await dialog.findByTestId('hashtag-name-input'), 'aakkonen');
      await user.click(await dialog.findByTestId('submit-hashtag-button'));

      const response = await mockedAxios.post.mock.results[0].value;

      expect(response).toStrictEqual(newHashtagResponse);

      expect(mockedAxios.post).toHaveBeenCalledWith('localhost:4000/project-hashtags/', {
        value: 'aakkonen',
      });

      // Adds it alphabetically to the top of the hashtags list
      expect(store.getState().hashTags.hashTags[0]).toStrictEqual(newHashtagResponse.data);

      // Renders the new hashtag at the top of the table
      await waitFor(async () => {
        expect(await findByTestId('value-0')).toHaveTextContent(newHashtagResponse.data.value);
      });
    });
  });
});
