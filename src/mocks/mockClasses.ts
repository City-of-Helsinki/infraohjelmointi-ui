import { IClass } from '@/interfaces/classInterfaces';

export const mockProjectClasses: { data: Array<IClass> } = {
  data: [
    {
      id: '6f41c344-3550-49f1-872d-a106daa8698b',
      name: '801 Esirakentmainen (kiinteä omaisuus)',
      path: '801 Esirakentmainen (kiinteä omaisuus)',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
    {
      id: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      name: '803 Kadut, liikenneväylät',
      path: '803 Kadut, liikenneväylät',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
    {
      id: '85077f3c-e79b-45ba-ad6e-c68b06710d83',
      name: '804 Puistot ja liikunta-alueet',
      path: '804 Puistot ja liikunta-alueet',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
    {
      id: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      name: 'Uudisrakentaminen',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
      forCoordinatorOnly: false,
      parent: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      relatedTo: null,
    },
    {
      id: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      name: 'Koillinen suurpiiri',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen/Koillinen suurpiiri',
      forCoordinatorOnly: false,
      parent: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      relatedTo: null,
    },
  ],
};

export const mockMasterClasses: { data: Array<IClass> } = {
  data: [
    {
      id: '6f41c344-3550-49f1-872d-a106daa8698b',
      name: '801 Esirakentmainen (kiinteä omaisuus)',
      path: '801 Esirakentmainen (kiinteä omaisuus)',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
    {
      id: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      name: '803 Kadut, liikenneväylät',
      path: '803 Kadut, liikenneväylät',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
    {
      id: '85077f3c-e79b-45ba-ad6e-c68b06710d83',
      name: '804 Puistot ja liikunta-alueet',
      path: '804 Puistot ja liikunta-alueet',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
    },
  ],
};

export const mockClasses: { data: Array<IClass> } = {
  data: [
    {
      id: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      name: 'Uudisrakentaminen',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
      forCoordinatorOnly: false,
      parent: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      relatedTo: null,
    },
  ],
};

export const mockSubClasses: { data: Array<IClass> } = {
  data: [
    {
      id: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      name: 'Koillinen suurpiiri',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen/Koillinen suurpiiri',
      forCoordinatorOnly: false,
      parent: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      relatedTo: null,
    },
  ],
};
