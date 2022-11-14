import React, { useEffect } from 'react';
import Title from '@/components/shared/Title';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import Paragraph from '@/components/shared/Paragraph';
import { setProjectCard } from '@/reducers/projectCardSlice';
import { mockProjectCard } from '@/mocks/mockProjectCard';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);

  useEffect(() => {
    // TODO: redux thunk call here
    dispatch(setProjectCard(mockProjectCard.data));
  }, [dispatch]);

  return (
    <>
      <Title size="xl" text="projectCard.projectCard" />
      {projectCard && <Paragraph size="m" text="Project card loaded" />}
      <Outlet />
    </>
  );
};

export default ProjectCardView;
