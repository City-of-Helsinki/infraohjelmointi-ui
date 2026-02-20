import { IAdminMenusMenuType } from './AdminMenus.types';
import { ListType } from '@/interfaces/common';

const menuCardItemContents = [
  {
    menuType: 'category' as IAdminMenusMenuType,
    listName: 'categories' as ListType,
    translateValues: true,
  },
  {
    menuType: 'type' as IAdminMenusMenuType,
    listName: 'types' as ListType,
    translateValues: true,
  },
  {
    menuType: 'phase' as IAdminMenusMenuType,
    listName: 'phases' as ListType,
    translateValues: true,
  },
  {
    menuType: 'constructionPhaseDetail' as IAdminMenusMenuType,
    listName: 'constructionPhaseDetails' as ListType,
    translateValues: true,
  },
  {
    menuType: 'constructionProcurementMethod' as IAdminMenusMenuType,
    listName: 'constructionProcurementMethods' as ListType,
    translateValues: true,
  },
  {
    menuType: 'projectQualityLevel' as IAdminMenusMenuType,
    listName: 'projectQualityLevels' as ListType,
    translateValues: true,
  },
  {
    menuType: 'planningPhase' as IAdminMenusMenuType,
    listName: 'planningPhases' as ListType,
    translateValues: true,
  },
  {
    menuType: 'constructionPhase' as IAdminMenusMenuType,
    listName: 'constructionPhases' as ListType,
    translateValues: true,
  },
  {
    menuType: 'responsibleZone' as IAdminMenusMenuType,
    listName: 'responsibleZones' as ListType,
    translateValues: true,
  },
  {
    menuType: 'responsiblePersonsList' as IAdminMenusMenuType,
    listName: 'responsiblePersons' as ListType,
    translateValues: true,
  },
  {
    menuType: 'programmer' as IAdminMenusMenuType,
    listName: 'programmers' as ListType,
    translateValues: true,
  },
  {
    menuType: 'budgetOverrunReason' as IAdminMenusMenuType,
    listName: 'budgetOverrunReasons' as ListType,
    translateValues: true,
  },
];

export { menuCardItemContents };
