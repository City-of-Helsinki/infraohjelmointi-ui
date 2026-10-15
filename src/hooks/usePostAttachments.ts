import { useCallback } from 'react';

export type UploadAttachments = (targetId: string, formData: FormData) => Promise<unknown>;

/**
 * Generic hook for posting file attachments as multipart form data.
 * @param upload Function that sends the form data for the given target id. Should be memoized.
 * @param fieldName Form data field name used for each file.
 */
function usePostAttachments(upload: UploadAttachments, fieldName = 'file') {
  const postAttachments = useCallback(
    async (targetId: string, files: File[] | null) => {
      if (!files || files.length === 0) {
        return;
      }
      const formData = new FormData();
      for (const file of files) {
        formData.append(fieldName, file);
      }
      await upload(targetId, formData);
    },
    [upload, fieldName],
  );

  return { postAttachments };
}

export default usePostAttachments;
