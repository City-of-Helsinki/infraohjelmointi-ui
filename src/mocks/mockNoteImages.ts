import type { INoteImage } from '@/interfaces/noteInterfaces';

const noteImages: INoteImage[] = [
  {
    id: '5e16efca-95fc-49a9-969a-4fd2f30f7602',
    url: 'https://example.com/images/first-image.jpg',
    fileName: 'first-image.jpg',
    contentType: 'image/jpeg',
    size: 1200,
    createdDate: '2024-05-13T10:00:00.000000+02:00',
    order: 0,
  },
  {
    id: '39bf8949-88be-41b4-8ab7-31a4c7f95f5a',
    url: 'https://example.com/images/second-image.jpg',
    fileName: 'second-image.jpg',
    contentType: 'image/jpeg',
    size: 3400,
    createdDate: '2024-05-13T10:05:00.000000+02:00',
    order: 1,
  },
];

export default noteImages;
