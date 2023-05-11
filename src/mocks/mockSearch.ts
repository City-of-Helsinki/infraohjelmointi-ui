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
        name: 'Planning Project 1',
        id: 'planning-project-1',
        type: 'projects',
        hashTags: [
          {
            id: '5b970a63-1d3b-4ddb-bd1a-658c8a5d67b4',
            value: 'leikkipaikka',
          },
          {
            id: '04568b59-1471-4fa9-b65b-43207ee611dc',
            value: 'leikkipuisto',
          },
        ],
        phase: {
          id: '3c46274d-bcd7-4fb9-aa5b-d70169db34e0',
          value: 'warrantyPeriod',
        },
        path: 'test-master-class-1/test-class-1/',
      },
      {
        name: 'Koillinen suurpiiri',
        id: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
        type: 'classes',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/507e3e63-0c09-4c19-8d09-43549dcc65c8',
      },
    ],
  },
};

export const mockLongSearchResults: { data: ISearchResults } = {
  data: {
    next: 'http://localhost:8000/projects/?limit=10&masterClass=fa3ac589-816e-47cb-a2f9-0c6956e85913&order=new&page=2',
    previous:
      'http://localhost:8000/projects/?limit=10&masterClass=fa3ac589-816e-47cb-a2f9-0c6956e85913&order=new&page=1',
    count: 1548,
    results: [
      {
        name: 'Katupuiden korvausistutukset',
        id: 'c3f8007f-7d33-47e2-8be5-2512bf108cb4',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Pienet peruskorjaustyöt',
        id: '3693649e-62b0-484e-8765-2167b2745075',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Muut peruskorjaushankkeet',
        id: '9bb7e498-d4c6-4a69-95fc-c30f4ac3baa2',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Tattarisuon teollisuusalueen kadut (alsu)',
        id: 'e68e3764-fdd0-48e5-8fb9-ff5d4907190a',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Tattariharjun teollisuusalueen kadut (alsu)',
        id: '24a73742-ead6-4ad0-a0f8-c279af868c9e',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Maatullinkj (henrik forsiuksen t - kämnerink)',
        id: '14bf0da3-ae3a-4ae8-bf23-647f31eed9c8',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Mätäspolku',
        id: '27bee176-711d-4837-921b-5f3247a47d6f',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Puistolantori',
        id: '24623e08-73d8-4517-858f-b9c72496aa53',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Vaskihuhdantie',
        id: 'f0feede6-a959-427b-a67b-ee7dd1ee47ac',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
      {
        name: 'Pihlajistontie 3 alikulku hulevesiongelma',
        id: '392eae62-80f3-4595-aaef-0fcc9b3d1708',
        type: 'projects',
        hashTags: [],
        phase: null,
        path: '7b69a4ae-5950-4175-a142-66dc9c6306a4/c6294258-41b1-4ad6-afdf-0b10849ca000/55c6accb-80a4-4cb8-ad5b-8f605459e537',
      },
    ],
  },
};
