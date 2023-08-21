import { IHashTagsResponse } from '@/interfaces/hashTagsInterfaces';

export const mockHashTags: { data: IHashTagsResponse } = {
  data: {
    hashTags: [
      {
        id: 'hashtag-1',
        value: 'leikkipaikka',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-2',
        value: 'leikkipuisto',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-3',
        value: 'hulevesi',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-4',
        value: 'aukio/tori',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-5',
        value: 'raidejokeri',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-6',
        value: 'viima-ratiotie',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
    ],
    popularHashTags: [
      {
        id: 'hashtag-5',
        value: 'raidejokeri',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
      {
        id: 'hashtag-6',
        value: 'viima-ratiotie',
        usageCount: 0,
        archived: false,
        createdDate: '2023-08-04T15:51:02.348709+03:00',
      },
    ],
  },
};
