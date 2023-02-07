import mockI18next from '@/mocks/mockI18next';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectBasics from './ProjectBasics';
import { act } from '@testing-library/react';
import mockPersons from '@/mocks/mockPersons';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectBasics', () => {
  let renderResult: CustomRenderResult;

  const spyScrollTo = jest.fn();
  Object.defineProperty(global.window, 'scrollTo', { value: spyScrollTo });

  beforeEach(async () => {
    spyScrollTo.mockClear();

    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectBasics />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('renders all component wrappers', async () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-content-container').length).toBe(1);
    expect(container.getElementsByClassName('side-panel').length).toBe(1);
    expect(container.getElementsByClassName('form-panel').length).toBe(1);
  });

  it('renders SideNavigation and links', () => {
    const { container, getByRole } = renderResult;

    const navItems = [
      'nav.basics',
      'nav.status',
      'nav.schedule',
      'nav.financial',
      'nav.responsiblePersons',
      'nav.location',
      'nav.projectProgram',
    ];

    expect(container.getElementsByClassName('side-nav').length).toBe(1);

    navItems.forEach((n) => {
      expect(
        getByRole('link', {
          name: n,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders ProjectBasicsForm', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });
});
