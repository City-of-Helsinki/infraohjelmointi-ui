import { IFreeSearchResults } from '@/interfaces/common';
import { ISearchResults } from '@/interfaces/searchInterfaces';

export const mockFreeSearchResults: { data: IFreeSearchResults } = {
  data: {
    hashtags: [
      {
        value: 'leikkipuisto',
        id: '123',
      },
      {
        value: 'leikkipaikka',
        id: '123',
      },
    ],
    projects: [
      {
        value: 'Laituri',
        id: '123',
      },
      {
        value: 'Lauttasaaren ostoskeskus',
        id: '123',
      },
    ],
    groups: [
      {
        value: 'Laajasalo',
        id: '123',
      },
      {
        value: 'Lauttasaari',
        id: '123',
      },
    ],
  },
};

export const mockSearchResults: { data: ISearchResults } = {
  data: {
    next: null,
    previous: null,
    count: 2,
    results: [
      {
        name: 'Yhteiskouluntie ja aukio',
        id: 'ffe0d7fe-f40e-471c-8c38-3c6dcba5712f',
        type: 'projects',
        hashTags: [
          {
            id: 'ccf89105-ee58-49f1-be0a-2cffca8711ab',
            value: 'leikkipaikka',
          },
        ],
        phase: {
          id: '3c46274d-bcd7-4fb9-aa5b-d70169db34e0',
          value: 'warrantyPeriod',
        },
        path: '41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
      },
      {
        name: 'Muu esirakentaminen',
        id: 'f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
        type: 'classes',
        path: '41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
        phase: null,
        hashTags: [],
      },
    ],
  },
};
