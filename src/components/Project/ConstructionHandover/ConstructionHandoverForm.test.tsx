import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ConstructionHandoverForm from './ConstructionHandoverForm';

jest.mock('react-i18next', () => mockI18next());

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Button: ({
      children,
      onClick,
      type = 'button',
    }: {
      children?: ReactNode;
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
      type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    }) => (
      <button type={type} onClick={onClick}>
        {children}
      </button>
    ),
    IconLink: () => <span aria-hidden="true" />,
  };
});

describe('ConstructionHandoverForm copy link', () => {
  it('copies to clipboard and dispatches success notification when copy button is clicked', async () => {
    const { store } = await act(async () =>
      renderWithProviders(
        <Route path="/" element={<ConstructionHandoverForm project={null} />} />,
      ),
    );

    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const copyButton = screen.getByRole('button', { name: 'copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(window.location.href);
      expect(store.getState().notifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            color: 'success',
            duration: 3500,
          }),
        ]),
      );
    });

    writeTextSpy.mockRestore();
  });

  it('dispatches error notification when clipboard write fails', async () => {
    const { store } = await act(async () =>
      renderWithProviders(
        <Route path="/" element={<ConstructionHandoverForm project={null} />} />,
      ),
    );

    const writeTextSpy = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard unavailable'));

    const copyButton = screen.getByRole('button', { name: 'copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(store.getState().notifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            color: 'error',
            duration: 3500,
          }),
        ]),
      );
    });

    writeTextSpy.mockRestore();
  });
});
