import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonVariant,
  FileInput,
  IconCheckCircle,
  IconPen,
  Notification,
  StatusLabel,
} from 'hds-react';
import { Language } from '@/i18n/language';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  PROJECT_PROGRAMME_LOCATION_MAP_FILE_FIELD,
  PROJECT_PROGRAMME_LOCATION_MAP_ROUTE,
  useSaveProjectProgrammeLocationMapMutation,
  useTransitionProjectProgrammeSectionStatusMutation,
} from '@/api/projectProgrammeApi';
import { IProjectProgramme, ProjectProgrammeStatus } from '@/interfaces/projectProgrammeInterfaces';
import { LOCATION_MAP_ELEMENT_ID } from './projectProgrammeSections';

const LOCATION_MAP_MAX_SIZE = 500 * 1024;
const LOCATION_MAP_ACCEPT = '.jpg,.jpeg,.png';

interface ILocationSectionProps {
  projectProgramme?: IProjectProgramme;
  programmeIsComplete: boolean;
}

function LocationSection({
  projectProgramme,
  programmeIsComplete,
}: Readonly<ILocationSectionProps>) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const dispatch = useAppDispatch();
  const [saveLocationMap, { isLoading: isSavingLocationMap }] =
    useSaveProjectProgrammeLocationMapMutation();
  const [transitionSectionStatus] = useTransitionProjectProgrammeSectionStatusMutation();
  // Remounting the FileInput clears its internal file list after a successful upload
  const [fileInputKey, setFileInputKey] = useState(0);

  const projectProgrammeId = projectProgramme?.id;
  const locationMap = projectProgramme?.locationMap;
  const locationMapSrc = locationMap?.downloadUrl ?? locationMap?.url;
  const sectionStatus = locationMap?.status;
  const sectionIsComplete = sectionStatus === 'COMPLETE';
  const showSectionStatus =
    Boolean(locationMapSrc) && (sectionStatus === 'DRAFT' || sectionIsComplete);
  const canEdit = !programmeIsComplete && !sectionIsComplete;

  async function handleFileChange(files: File[]) {
    const [file] = files;
    if (!file || !projectProgrammeId) return;

    const formData = new FormData();
    formData.append(PROJECT_PROGRAMME_LOCATION_MAP_FILE_FIELD, file);

    try {
      await saveLocationMap({
        id: projectProgrammeId,
        formData,
        isNew: !locationMap,
      }).unwrap();
      setFileInputKey((key) => key + 1);
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'projectProgrammeLocationMapSaveSuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeLocationMapSaveError',
          type: 'toast',
        }),
      );
    }
  }

  async function handleTransition(to: ProjectProgrammeStatus) {
    if (programmeIsComplete || !projectProgrammeId) return;

    const isMarkReady = to === 'COMPLETE';

    try {
      await transitionSectionStatus({
        id: projectProgrammeId,
        section: PROJECT_PROGRAMME_LOCATION_MAP_ROUTE,
        to,
      }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: isMarkReady
            ? 'projectProgrammeSectionMarkReadySuccess'
            : 'projectProgrammeSectionReturnToDraftSuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: isMarkReady
            ? 'projectProgrammeSectionMarkReadyError'
            : 'projectProgrammeSectionReturnToDraftError',
          type: 'toast',
        }),
      );
    }
  }

  return (
    <div
      className="project-programme-section"
      id={LOCATION_MAP_ELEMENT_ID}
      data-testid="project-programme-location-form"
    >
      <Notification
        type="info"
        label={
          <span className="flex w-full min-w-0 items-start gap-2">
            <span className="min-w-0 flex-1 break-words">
              {t('projectProgrammeForm.locationSectionTitle')}
            </span>
            {showSectionStatus && (
              <StatusLabel
                className="ml-auto shrink-0"
                type={sectionIsComplete ? 'success' : 'info'}
                iconStart={sectionIsComplete ? <IconCheckCircle /> : <IconPen />}
              >
                {t(
                  sectionIsComplete
                    ? 'projectProgrammeForm.sectionCompleteStatus'
                    : 'projectProgrammeForm.draftStatus',
                )}
              </StatusLabel>
            )}
          </span>
        }
      >
        <div className="project-programme-notification-content">
          <p>{t('projectProgrammeForm.locationSectionHelperText')}</p>
          {locationMapSrc && (
            <img
              src={locationMapSrc}
              alt={locationMap?.fileName ?? t('projectProgrammeForm.locationSectionTitle')}
              className="max-w-full"
              data-testid="project-programme-location-map-image"
            />
          )}
          {canEdit && (
            <FileInput
              key={fileInputKey}
              id="project-programme-location-map-input"
              className="project-programme-file-input"
              data-testid="project-programme-location-map-input"
              label={t('projectProgrammeForm.locationSectionTitle')}
              dragAndDropLabel={t('projectProgrammeForm.locationDragAndDropFieldLabel')}
              dragAndDropInputLabel={t('projectProgrammeForm.locationAttachFileButtonFieldLabel')}
              buttonLabel={t('projectProgrammeForm.locationAttachFileButtonLabel')}
              helperText={t('projectProgrammeForm.locationAttachmentInfoText')}
              language={language as Language}
              maxSize={LOCATION_MAP_MAX_SIZE}
              accept={LOCATION_MAP_ACCEPT}
              disabled={isSavingLocationMap}
              dragAndDrop
              onChange={handleFileChange}
            />
          )}
          {!programmeIsComplete && locationMapSrc && (
            <div className="flex flex-wrap gap-4">
              {sectionIsComplete ? (
                <Button
                  variant={ButtonVariant.Secondary}
                  style={{ backgroundColor: 'var(--color-white)' }}
                  type="button"
                  onClick={() => handleTransition('DRAFT')}
                >
                  {t('projectProgrammeForm.returnSectionToDraft')}
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.Primary}
                  type="button"
                  onClick={() => handleTransition('COMPLETE')}
                >
                  {t('projectProgrammeForm.markSectionReady')}
                </Button>
              )}
            </div>
          )}
        </div>
      </Notification>
    </div>
  );
}

export default memo(LocationSection);
