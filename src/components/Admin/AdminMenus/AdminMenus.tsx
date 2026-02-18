import { memo } from 'react';
import './styles.css';
import AdminMenusSideNavigation from './AdminMenusSideNavigation';
import AdminMenusCard from './AdminMenusCard';

const AdminMenus = () => {
  return (
    <div className="admin-menus-view">
      <AdminMenusSideNavigation />
      <div className="admin-menus-content">
        <AdminMenusCard menuType="category" listName="categories" translateValues={true} />
        <AdminMenusCard menuType="type" listName="types" translateValues={true} />
        {/* <AdminMenusCard menuType="program" listName="" translateValues={true}/> */}
        <AdminMenusCard menuType="phase" listName="phases" translateValues={true} />
        {/* <AdminMenusCard menuType="projectPhaseSpesification" listName="" translateValues={true}/> */}
        <AdminMenusCard
          menuType="constructionPhaseDetail"
          listName="constructionPhaseDetails"
          translateValues={true}
        />
        <AdminMenusCard
          menuType="constructionProcurementMethod"
          listName="constructionProcurementMethods"
          translateValues={true}
        />
        {/* <AdminMenusCard menuType="projectCost" listName="" translateValues={true}/> */}
        {/* <AdminMenusCard menuType="planningCostEstimate" listName="" translateValues={true}/> */}
        {/* <AdminMenusCard menuType="buildingCostEstimate" listName="" translateValues={true}/> */}
        <AdminMenusCard
          menuType="responsibleZone"
          listName="responsibleZones"
          translateValues={true}
        />
        <AdminMenusCard
          menuType="responsiblePersonsList"
          listName="responsiblePersons"
          translateValues={false}
        />
        <AdminMenusCard menuType="programmer" listName="programmers" translateValues={false} />
        <AdminMenusCard
          menuType="budgetOverrunReason"
          listName="budgetOverrunReasons"
          translateValues={true}
        />
      </div>
    </div>
  );
};

export default memo(AdminMenus);
