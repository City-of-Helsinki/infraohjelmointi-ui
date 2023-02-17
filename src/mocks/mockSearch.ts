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
    groups: [
      {
        id: '123456789',
        name: 'Kalasatama',
        path: '123/456/789',
      },
      {
        id: '123456789',
        name: 'Koirapuisto',
        path: '123/456/789',
      },
    ],
    classes: [
      {
        id: '123456789',
        name: 'Meluesteet',
        path: '123/456/789',
      },
      {
        id: '123456789',
        name: 'Keskinen suurpiiri',
        path: '123/456/789',
      },
    ],
    locations: [
      {
        id: '123456789',
        name: 'Hakaniemi',
        path: '123/456/789',
      },
      {
        id: '123456789',
        name: 'Lauttasaari',
        path: '123/456/789',
      },
    ],
    projects: [{ path: '123/456/789', project: mockProject.data }],
  },
};
