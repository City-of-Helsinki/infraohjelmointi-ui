import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { Select } from 'hds-react/components/Select';
import { IconAlertCircle, IconStar, IconStarFill } from 'hds-react/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelIcon, Paragraph, ProgressCircle, Title } from '../shared';

const ProjectCardHeader = () => {
  const { t } = useTranslation();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const phaseOptions = [
    { label: <LabelIcon icon={IconAlertCircle} text={t('enums.underConstruction')} /> },
  ];

  // Vars that will come from API
  const [favourite, setFavourite] = useState(false);
  const address = 'Hämeentie 1, 00530 Helsinki';
  const group = 'Hakaniemi';

  //TODO: phase dropdown
  //TODO: route by id

  return (
    <div className="project-card-header-container">
      <div className="header-row">
        {/* left */}
        <div className="display-flex">
          {/* percent */}
          <div className="progress-indicator-container">
            <ProgressCircle color={'--color-engel'} percent={projectCard?.projectReadiness} />
          </div>
          {/* address & phase */}
          <div className="header-column">
            <div>
              <Title id="project-name" size="m" color="white" text={projectCard?.name} />
              <Paragraph id="project-address" size="l" color="white" text={address} />
            </div>
            <div data-testid="project-phase-dropdown">
              <Select label="" placeholder={t('projectPhase') || ''} options={phaseOptions} />
            </div>
          </div>
        </div>
        {/* right */}
        <div className="header-column text-right">
          <div>
            {/* favourite */}
            <button className="favourite-button" onClick={() => setFavourite(!favourite)}>
              <LabelIcon
                color="white"
                icon={favourite ? IconStarFill : IconStar}
                text={favourite ? 'removeFavourite' : 'addFavourite'}
              />
            </button>
            {/* group */}
            <Paragraph id="in-group" color="white" size="m" text={'inGroup'} />
            <Paragraph id="pc-group" color="white" size="l" fontWeight="bold" text={group} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardHeader;
