import mockI18next from '@/mocks/mockI18next';
import { act, screen } from '@testing-library/react';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectToolbar from './ProjectToolbar';
import mockPersons from '@/mocks/mockPersons';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectToolbar', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectToolbar />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('renders component wrapper', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('toolbar-container').length).toBe(1);
  });

  it('renders two containers', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('display-flex').length).toBe(2);
  });

  it('renders all right left elements', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('display-flex')[0].childElementCount).toBe(2);
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shareProject/i })).toBeInTheDocument();
  });

  it('renders all left side elements', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('display-flex')[1].childElementCount).toBe(1);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
