import React from 'react';
import Paragraph from '@/components/shared/Paragraph';
import Title from '@/components/shared/Title';

const ErrorView = () => {
  return (
    <>
      <Title size="xl" text="error.404" />
      <Paragraph size="xl" text="error.pageNotFound" />
    </>
  );
};

export default ErrorView;
