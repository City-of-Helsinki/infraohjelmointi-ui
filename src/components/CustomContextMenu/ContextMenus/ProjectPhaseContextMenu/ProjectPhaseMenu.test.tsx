import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectPhaseMenu from './ProjectPhaseMenu';

jest.mock('@/hooks/useOptions', () => ({
  useOptions: () => [
    { value: 'phase-1', label: 'planning' },
    { value: 'phase-2', label: 'construction' },
  ],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ProjectPhaseMenu', () => {
  const onCloseMenu = jest.fn();
  const onSubmitPhase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = (isReadOnly: boolean) =>
    render(
      <ProjectPhaseMenu
        title="Project"
        phase="phase-1"
        isReadOnly={isReadOnly}
        onCloseMenu={onCloseMenu}
        onSubmitPhase={onSubmitPhase}
      />,
    );

  it('shows phases read-only without Save and still allows closing', async () => {
    const user = userEvent.setup();
    renderMenu(true);

    expect(screen.getByTestId('project-phase-menu')).toBeInTheDocument();
    expect(screen.getByTestId('select-phase-1')).toBeDisabled();
    expect(screen.getByTestId('select-phase-2')).toBeDisabled();
    expect(screen.queryByTestId('patch-project-phase')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('select-phase-2'));

    expect(screen.getByTestId('project-phase-menu-option-phase-1')).toHaveClass('selected');
    expect(screen.getByTestId('project-phase-menu-option-phase-2')).not.toHaveClass('selected');
    expect(onSubmitPhase).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '' }));

    expect(onCloseMenu).toHaveBeenCalledTimes(1);
  });

  it('preserves phase selection and saving for other users', async () => {
    const user = userEvent.setup();
    renderMenu(false);

    expect(screen.getByTestId('select-phase-2')).toBeEnabled();

    await user.click(screen.getByTestId('select-phase-2'));

    expect(screen.getByTestId('project-phase-menu-option-phase-2')).toHaveClass('selected');

    await user.click(screen.getByTestId('patch-project-phase'));

    expect(onSubmitPhase).toHaveBeenCalledWith({ phase: 'phase-2' });
    expect(onCloseMenu).toHaveBeenCalledTimes(1);
  });
});
