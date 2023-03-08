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

export const mockLongSearchResults: { data: ISearchResults } = {
  data: {
    next: 'http://localhost:8000/projects/?limit=10&masterClass=fa3ac589-816e-47cb-a2f9-0c6956e85913&order=new&page=2',
    previous:
      'http://localhost:8000/projects/?limit=10&masterClass=fa3ac589-816e-47cb-a2f9-0c6956e85913&order=new&page=1',
    count: 1548,
    results: [
      {
        name: 'B-katu',
        id: '55e62889-d027-4dd1-81c2-e86879a45aa4',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '2ac560e5-162d-4ab1-ac1b-0a0a0f5cc194',
          value: 'programming',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/c4708dad-d8ea-4873-8916-3fd5d847d459/6730686a-5af8-49dc-a5ad-8caeda765c26',
      },
      {
        name: 'Siltasaarenkatu',
        id: 'aeb23c29-1045-4859-bb7f-f199cd85b660',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/8124df76-56ef-4502-b329-61149ea7e42d',
      },
      {
        name: 'Lauttasaarentien pyörätiet (Klaarantie-Tallberginkatu)',
        id: '730ecc23-7d3f-400f-8a19-e8b32f3b10b6',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '2ac560e5-162d-4ab1-ac1b-0a0a0f5cc194',
          value: 'programming',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/8124df76-56ef-4502-b329-61149ea7e42d',
      },
      {
        name: 'Rautatieläisenkadun alikulku',
        id: 'a0ccc618-897c-468e-b26d-84a309006519',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '2ac560e5-162d-4ab1-ac1b-0a0a0f5cc194',
          value: 'programming',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/50248381-dc83-41d6-a43e-325318c6dd13',
      },
      {
        name: 'Länsibaana',
        id: '4da5f0e0-3dce-4a4d-a306-7e43365f20fe',
        type: 'projects',
        hashTags: [],
        phase: {
          id: 'dcd6828b-348b-46d7-8780-05349e03f5a7',
          value: 'proposal',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/8124df76-56ef-4502-b329-61149ea7e42d',
      },
      {
        name: 'Keijontie 1 liikennejärjestelyt',
        id: '27731ebb-ab87-4510-9f65-b64afab5e989',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/169ef002-9274-48ab-baf2-cfc7789b58f9',
      },
      {
        name: 'Aarrepuiston kevyen liikenteen putkisilta',
        id: 'b2d46cc5-3e0a-44b5-aa7b-06c8794baa9c',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/2090f4f9-d134-4d5b-97d1-93f451aa85d0',
      },
      {
        name: 'Somerikkotie ‐ Huokotie liittymä',
        id: '0a853972-62e1-43d4-9812-299cac1c5954',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/76e22195-84c9-4627-87d6-a5bd0edaf4ca',
      },
      {
        name: 'Puustellintie',
        id: 'b700b0c9-e813-434e-8316-edcc0457bd2d',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913',
      },
      {
        name: 'Mustapuron putkisilta',
        id: '3ae068fc-c979-442f-8fcc-0fa20d74755e',
        type: 'projects',
        hashTags: [],
        phase: {
          id: '4d7440ff-ef68-4e20-8d64-43ba3955de78',
          value: 'draftInitiation',
        },
        path: 'fa3ac589-816e-47cb-a2f9-0c6956e85913/08367ffc-7d8f-4c8a-962a-cd33367d43d1/2090f4f9-d134-4d5b-97d1-93f451aa85d0',
      },
    ],
  },
};
