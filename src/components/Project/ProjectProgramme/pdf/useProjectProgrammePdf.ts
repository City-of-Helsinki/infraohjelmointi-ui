import { useCallback, useState } from 'react';
import { t } from 'i18next';
import { skipToken } from '@reduxjs/toolkit/query';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { useAppDispatch } from '@/hooks/common';
import useGetProject from '@/hooks/useGetProject';
import { useGetProjectProgrammeByProjectQuery } from '@/api/projectProgrammeApi';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { getProjectProgrammeSections } from '../sections/projectProgrammeSections';
import { getProjectProgrammePdfFileName } from './projectProgrammePdfUtils';
import { createProjectProgrammePdfBlob } from './createProjectProgrammePdf';

const LOADING_PROJECT_PROGRAMME_PDF = 'loading-project-programme-pdf';

export default function useProjectProgrammePdf() {
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();
  const { data: projectProgramme } = useGetProjectProgrammeByProjectQuery(project?.id ?? skipToken);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async () => {
    if (!projectProgramme) {
      return;
    }

    setIsGenerating(true);
    dispatch(setLoading({ text: 'Loading pdf data', id: LOADING_PROJECT_PROGRAMME_PDF }));

    try {
      const isBrief = projectProgramme.briefProjectProgramme ?? true;
      const sections = getProjectProgrammeSections(t, isBrief)
        .filter((section) => !isBrief || section.showInBrief)
        .map(({ id, label }) => ({ id, label }));
      const projectName = projectProgramme.basicInfo?.projectName?.trim() || project?.name || '';
      const now = moment();
      const blob = await createProjectProgrammePdfBlob({
        projectProgramme,
        sections,
        projectName,
        createdDate: now.format('D.M.YYYY'),
      });

      saveAs(
        blob,
        getProjectProgrammePdfFileName(
          t('projectProgrammeForm.pdfTitle'),
          projectName,
          now.format('YYYY-MM-DD'),
        ),
      );
    } catch (error) {
      console.error('Error generating project programme pdf: ', error);
      dispatch(
        notifyError({
          title: 'undefined',
          message: 'projectProgrammePdfGenerationError',
          type: 'toast',
        }),
      );
    } finally {
      dispatch(clearLoading(LOADING_PROJECT_PROGRAMME_PDF));
      setIsGenerating(false);
    }
  }, [dispatch, project, projectProgramme, t]);

  return { generatePdf, isGenerating, canGeneratePdf: Boolean(projectProgramme) };
}
