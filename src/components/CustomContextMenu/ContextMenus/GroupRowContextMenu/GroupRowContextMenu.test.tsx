import { render, screen } from '@testing-library/react';
import GroupRowContextMenu from './GroupRowContextMenu';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderMenu = (canDelete?: boolean) =>
  render(
    <GroupRowContextMenu
      groupName="Group"
      onShowGroupDeleteDialog={vi.fn()}
      onShowGroupEditDialog={vi.fn()}
      onCloseMenu={vi.fn()}
      canDelete={canDelete}
    />,
  );

describe('GroupRowContextMenu', () => {
  it('shows edit and delete by default', () => {
    renderMenu();
    expect(screen.getByTestId('open-group-edit-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('open-delete-group-dialog')).toBeInTheDocument();
  });

  it('hides delete when canDelete is false (IO-756)', () => {
    renderMenu(false);
    expect(screen.getByTestId('open-group-edit-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('open-delete-group-dialog')).not.toBeInTheDocument();
  });
});
