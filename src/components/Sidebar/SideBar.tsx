import React from 'react';
import { SideNavigation } from 'hds-react/components/SideNavigation';
import './styles.css';

/**
 * TODO: Implement actual functionality, this is just a placeholder to help style the rest of the page
 */
const SideBar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-container-inner">
        <SideNavigation
          id="side-navigation-icons"
          style={{ background: 'var(--color-silver-light)' }}
          toggleButtonLabel=""
        />
      </div>
    </div>
  );
};

export default SideBar;
