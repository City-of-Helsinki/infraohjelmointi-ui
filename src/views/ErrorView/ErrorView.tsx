import React from 'react';
import { Paragraph, Title } from '@/components/shared';

const ErrorView = () => {
  return (
    <>
      <Title size="xl" text="error.404" />
      <Paragraph size="xl" text="error.pageNotFound" />
    </>
  );
};

export default ErrorView;
