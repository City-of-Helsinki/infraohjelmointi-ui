import { useCallback } from 'react';
import { usePostNoteImageMutation } from '@/api/notesApi';

/**
 * Custom hook for posting note images.
 * @returns An object containing the `postImages` function and `isPostingNoteImage` boolean.
 */
function usePostNoteImages() {
  const [postNoteImage, { isLoading: isPostingNoteImage }] = usePostNoteImageMutation();

  const postImages = useCallback(
    async (noteId: string, files: File[] | null) => {
      if (files && files.length > 0) {
        const formData = new FormData();
        for (const file of files) {
          formData.append('file', file);
        }
        await postNoteImage({
          noteId,
          formData,
        });
      }
    },
    [postNoteImage],
  );

  return { postImages, isPostingNoteImage };
}

export default usePostNoteImages;
