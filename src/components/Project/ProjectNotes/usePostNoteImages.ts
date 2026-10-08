import { useCallback } from 'react';
import { usePostNoteImageMutation } from '@/api/notesApi';
import usePostAttachments from '../../../hooks/usePostAttachments';

/**
 * Custom hook for posting note images.
 * @returns An object containing the `postImages` function and `isPostingNoteImage` boolean.
 */
function usePostNoteImages() {
  const [postNoteImage, { isLoading: isPostingNoteImage }] = usePostNoteImageMutation();
  const upload = useCallback(
    (noteId: string, formData: FormData) => postNoteImage({ noteId, formData }),
    [postNoteImage],
  );
  const { postAttachments: postImages } = usePostAttachments(upload);

  return { postImages, isPostingNoteImage };
}

export default usePostNoteImages;
