import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { Paragraph, Title } from '@/components/shared';
import { setProjectCard } from '@/reducers/projectCardSlice';
import mockProjectCard from '@/mocks/mockProjectCard';

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
      {projectCard && <Paragraph size="m" text="Project card fetched" />}
      <Outlet />
    </>
  );
};

export default ProjectCardView;
