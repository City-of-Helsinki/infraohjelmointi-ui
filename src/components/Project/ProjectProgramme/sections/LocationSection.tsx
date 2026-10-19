import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, FileInput, IconTrash, Notification } from 'hds-react';
import { Language } from '@/i18n/language';
import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  getProjectProgrammeLocationMapBlob,
  useDeleteProjectProgrammeLocationMapMutation,
  useSaveProjectProgrammeLocationMapMutation,
} from '@/api/projectProgrammeApi';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { LOCATION_MAP_ELEMENT_ID } from './projectProgrammeSections';

const LOCATION_MAP_MAX_SIZE = 500 * 1024;
const LOCATION_MAP_ACCEPT = '.jpg,.jpeg,.png';

interface ILocationSectionProps {
  projectProgramme?: IProjectProgramme;
  programmeIsComplete: boolean;
}

/** Fetches the map with the auth header and exposes it as an object URL for <img>. */
function useLocationMapObjectUrl(url?: string | null) {
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    setObjectUrl(undefined);
    // Same guard as notesApi: object URLs are missing in some environments (jsdom)
    if (!url || typeof URL.createObjectURL !== 'function') return undefined;

    let cancelled = false;
    let createdUrl: string | undefined;
    getProjectProgrammeLocationMapBlob(url)
      .then((blob) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        // The section stays usable without the preview; a new upload replaces the map.
      });

    return () => {
      cancelled = true;
      if (createdUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(createdUrl);
    };
  }, [url]);

  return objectUrl;
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
  const { isConfirmed } = useConfirmDialog();
  const [saveLocationMap, { isLoading: isSavingLocationMap }] =
    useSaveProjectProgrammeLocationMapMutation();
  const [deleteLocationMap, { isLoading: isDeletingLocationMap }] =
    useDeleteProjectProgrammeLocationMapMutation();
  // Remounting the FileInput clears its internal file list after a successful upload
  const [fileInputKey, setFileInputKey] = useState(0);

  const projectProgrammeId = projectProgramme?.id;
  const locationMap = projectProgramme?.locationMap;
  const locationMapSrc = useLocationMapObjectUrl(locationMap?.url);
  // The map has no status of its own: it can be changed while the programme is a draft
  const canEdit = !programmeIsComplete;

  async function handleFileChange(files: File[]) {
    const [file] = files;
    if (!file || !projectProgrammeId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await saveLocationMap({ id: projectProgrammeId, formData }).unwrap();
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

  async function handleDelete() {
    if (!projectProgrammeId) return;

    const confirm = await isConfirmed({
      dialogType: 'delete',
      confirmButtonText: t('projectProgrammeForm.deleteLocationMapDialog.delete'),
      title: t('projectProgrammeForm.deleteLocationMapDialog.title'),
      description: t('projectProgrammeForm.deleteLocationMapDialog.description'),
    });
    if (confirm === false) return;

    try {
      await deleteLocationMap({ id: projectProgrammeId }).unwrap();
      dispatch(
        notifySuccess({
          title: 'deleteSuccess',
          message: 'projectProgrammeLocationMapDeleteSuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'deleteError',
          message: 'projectProgrammeLocationMapDeleteError',
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
      <Notification type="info" label={t('projectProgrammeForm.locationSectionTitle')}>
        <div className="project-programme-notification-content">
          <p>{t('projectProgrammeForm.locationSectionHelperText')}</p>
          {locationMapSrc && (
            <img
              src={locationMapSrc}
              alt={locationMap?.originalName ?? t('projectProgrammeForm.locationSectionTitle')}
              className="max-w-full"
              data-testid="project-programme-location-map-image"
            />
          )}
          {canEdit && locationMap && (
            <Button
              className="self-start"
              variant={ButtonVariant.Secondary}
              style={{ backgroundColor: 'var(--color-white)' }}
              type="button"
              iconStart={<IconTrash />}
              disabled={isDeletingLocationMap}
              onClick={handleDelete}
              data-testid="project-programme-location-map-delete"
            >
              {t('projectProgrammeForm.deleteLocationMap')}
            </Button>
          )}
          {canEdit && !locationMap && (
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
              required
              language={language as Language}
              maxSize={LOCATION_MAP_MAX_SIZE}
              accept={LOCATION_MAP_ACCEPT}
              disabled={isSavingLocationMap}
              dragAndDrop
              onChange={handleFileChange}
            />
          )}
        </div>
      </Notification>
    </div>
  );
}

export default memo(LocationSection);
