import { createElement, ReactNode } from 'react';

const passthrough = ({ children }: { children?: ReactNode }) =>
  createElement('div', null, children);

export const Document = passthrough;
export const Page = passthrough;
export const View = passthrough;
export const Text = passthrough;

export const Image = ({ src }: { src?: string }) => createElement('img', { src });

export const Link = ({ children, src }: { children?: ReactNode; src?: string }) =>
  createElement('a', { href: src }, children);

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
};

export const Font = {
  register: () => undefined,
};

export const pdf = () => ({
  toBlob: () => Promise.resolve(new Blob([], { type: 'application/pdf' })),
});
