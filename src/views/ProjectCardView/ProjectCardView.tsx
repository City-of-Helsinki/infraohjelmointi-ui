import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { Paragraph, Title } from '@/components/shared';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);

  useEffect(() => {
    dispatch(getProjectCardsThunk()).then((res) => {
      if (res.type.includes('rejected')) {
        console.log('Call failed, do error stuff!');
      }
    });
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
