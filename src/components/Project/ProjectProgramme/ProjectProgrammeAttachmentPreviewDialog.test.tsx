import { getPreviewKind } from './ProjectProgrammeAttachmentPreviewDialog';

describe('getPreviewKind', () => {
  it.each([
    ['image/jpeg', 'photo', 'image'],
    ['image/gif', 'photo', 'image'],
    ['', 'photo.JPG', 'image'],
    ['application/octet-stream', 'photo.jpeg', 'image'],
    ['', 'photo.PNG', 'image'],
    ['application/pdf', 'document', 'pdf'],
    ['application/octet-stream', 'document.PDF', 'pdf'],
    ['', 'document.docx', 'unsupported'],
    ['application/msword', 'document.doc', 'unsupported'],
    ['', 'document', 'unsupported'],
  ])('classifies %s / %s as %s', (contentType, fileName, kind) => {
    expect(getPreviewKind(contentType, fileName)).toBe(kind);
  });
});
