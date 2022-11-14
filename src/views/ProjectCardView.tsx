import React from 'react';
import Title from '@/components/shared/Title';
import { Outlet } from 'react-router';

const ProjectCardView = () => {
  return (
    <>
      <Title size="xl" text="projectCard.projectCard" />
      <Outlet />
    </>
  );
};

export default ProjectCardView;
