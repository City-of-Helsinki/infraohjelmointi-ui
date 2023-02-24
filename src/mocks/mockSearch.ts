import { IFreeSearchResult } from '@/interfaces/common';
import { ISearchResult } from '@/interfaces/searchInterfaces';
import mockProject from './mockProject';

export const mockFreeSearchResult: { data: IFreeSearchResult } = {
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

export const mockSearchResult: { data: ISearchResult } = {
  data: {
    groups: [],
    classes: [
      {
        id: 'f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
        name: 'Muu esirakentaminen',
        path: '41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
      },
    ],
    projects: [
      {
        path: '41d6bd7b-4a86-4ea4-95b7-4bff4f179095/354edbb1-f257-432c-b5bf-4a7e4f02aeba/f2ffb57e-d7a4-49d1-b7bf-3fa4f9c2b1df',
        project: mockProject.data,
      },
    ],
    locations: [],
  },
};
