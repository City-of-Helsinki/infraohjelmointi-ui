import { IHashTagsResponse } from '@/interfaces/hashTagsInterfaces';

export const mockHashTags: { data: IHashTagsResponse } = {
  data: {
    hashTags: [
      {
        id: '9d6d4ccb-db3d-4335-8bf6-6d542ebf3eba',
        value: 'leikkipaikka',
      },
      {
        id: 'b8f172d3-a92f-4c51-b3f9-58f5e1a48b75',
        value: 'leikkipuisto',
      },
      {
        id: '816cc173-6340-45ed-9b49-4b4976b2a48b',
        value: 'hulevesi',
      },
      {
        id: '8346d18f-f836-4179-b0e7-74ee43cb65b0',
        value: 'aukio/tori',
      },
      {
        id: '83c3124f-839c-4ea4-86cc-614a8036eee7',
        value: 'raidejokeri',
      },
      {
        id: '630f8b95-66db-4f9a-89f9-6ceb7563fe8e',
        value: 'viima-ratiotie',
      },
    ],
    popularHashTags: [
      {
        id: '83c3124f-839c-4ea4-86cc-614a8036eee7',
        value: 'raidejokeri',
      },
      {
        id: '630f8b95-66db-4f9a-89f9-6ceb7563fe8e',
        value: 'viima-ratiotie',
      },
    ],
  },
};
