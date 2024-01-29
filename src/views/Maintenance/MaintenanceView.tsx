import { t } from 'i18next';

import './styles.css';

const MaintenanceView = () => {
    return (
        <div className='maintenance-mode-view'>
            <div className='maintenance-mode-view-container'>
                <h1 className='text-heading-xl'>{t('maintenanceMode.title')}</h1>
                <div className='mb-4'>
                    <p className='text-xl'>{t('maintenanceMode.description')}</p>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceView;