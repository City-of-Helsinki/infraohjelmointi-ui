import { Select } from 'hds-react/components/Select';
import { IconAlertCircle, IconStarFill } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { LabelIcon, Paragraph, ProgressCircle, Title } from '../shared';

const ProjectCardHeader = () => {
  const { t } = useTranslation();
  const phaseOptions = [
    { label: <LabelIcon icon={IconAlertCircle} text={t('enums.underConstruction')} /> },
  ];

  return (
    <div className="project-card-header-container">
      <div className="header-row">
        {/* left */}
        <div className="display-flex">
          {/* percent */}
          <div className="progress-indicator-container">
            <ProgressCircle color={'--color-engel'} percent={45} />
          </div>
          {/* address & phase */}
          <div className="header-column">
            <div>
              <Title size="m" color="white" text="Hakaniementori" />
              <Paragraph size="l" color="white" text="Hämeentie 1, 00530 Helsinki" />
            </div>
            <Select label="" placeholder={t('projectPhase') || ''} options={phaseOptions} />
          </div>
        </div>
        {/* right */}
        <div className="header-column">
          <div className="text-right">
            {/* favourite */}
            <button className="favourite-button">
              <LabelIcon color="white" icon={IconStarFill} text={'removeFavourite'} />
            </button>
            {/* group */}
            <Paragraph color="white" size="m" text={'inGroup'} />
            <Paragraph color="white" size="l" fontWeight="bold" text="Hakaniemi" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardHeader;
