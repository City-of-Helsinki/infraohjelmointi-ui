import { IClass } from '@/interfaces/classInterfaces';
import { mockClassFinances } from './mockClassFinances';

export const mockProjectClasses: { data: Array<IClass> } = {
  data: [
    {
      id: 'test-master-class-1',
      name: '801 Esirakentmainen (kiinteä omaisuus)',
      path: '801 Esirakentmainen (kiinteä omaisuus)',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      name: '803 Kadut, liikenneväylät',
      path: '803 Kadut, liikenneväylät',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '85077f3c-e79b-45ba-ad6e-c68b06710d83',
      name: '804 Puistot ja liikunta-alueet',
      path: '804 Puistot ja liikunta-alueet',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-class-1',
      name: 'TestClass',
      path: '801 Esirakentmainen (kiinteä omaisuus)/TestClass',
      forCoordinatorOnly: false,
      parent: 'test-master-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      name: 'Uudisrakentaminen',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
      forCoordinatorOnly: false,
      parent: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'test-sub-class-1',
      name: 'TestSubClass',
      path: '801 Esirakentmainen (kiinteä omaisuus)/TestClass/TestSubClass',
      forCoordinatorOnly: false,
      parent: 'test-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      name: 'Koillinen suurpiiri',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen/Koillinen suurpiiri',
      forCoordinatorOnly: false,
      parent: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockMasterClasses: { data: Array<IClass> } = {
  data: [
    {
      id: 'test-master-class-1',
      name: '801 Esirakentmainen (kiinteä omaisuus)',
      path: '801 Esirakentmainen (kiinteä omaisuus)',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      name: '803 Kadut, liikenneväylät',
      path: '803 Kadut, liikenneväylät',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '85077f3c-e79b-45ba-ad6e-c68b06710d83',
      name: '804 Puistot ja liikunta-alueet',
      path: '804 Puistot ja liikunta-alueet',
      forCoordinatorOnly: false,
      parent: null,
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockClasses: { data: Array<IClass> } = {
  data: [
    {
      id: 'test-class-1',
      name: 'TestClass',
      path: '801 Esirakentmainen (kiinteä omaisuus)/TestClass',
      forCoordinatorOnly: false,
      parent: 'test-master-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      name: 'Uudisrakentaminen',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen',
      forCoordinatorOnly: false,
      parent: '7b69a4ae-5950-4175-a142-66dc9c6306a4',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};

export const mockSubClasses: { data: Array<IClass> } = {
  data: [
    {
      id: 'test-sub-class-1',
      name: 'TestSubClass',
      path: '801 Esirakentmainen (kiinteä omaisuus)/TestClass/TestSubClass',
      forCoordinatorOnly: false,
      parent: 'test-class-1',
      relatedTo: null,
      finances: mockClassFinances,
    },
    {
      id: '507e3e63-0c09-4c19-8d09-43549dcc65c8',
      name: 'Koillinen suurpiiri',
      path: '803 Kadut, liikenneväylät/Uudisrakentaminen/Koillinen suurpiiri',
      forCoordinatorOnly: false,
      parent: 'c6294258-41b1-4ad6-afdf-0b10849ca000',
      relatedTo: null,
      finances: mockClassFinances,
    },
  ],
};
