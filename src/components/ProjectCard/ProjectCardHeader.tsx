import { useAppSelector } from '@/hooks/common';
import { ProjectPhase } from '@/interfaces/projectCardInterfaces';
import { RootState } from '@/store';
import { Select } from 'hds-react/components/Select';
import { IconAlertCircle, IconFaceSmile, IconStar, IconStarFill } from 'hds-react/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelIcon, Paragraph, ProgressCircle, Title } from '../shared';

interface OptionType {
  label: string;
}

const ProjectCardHeader = () => {
  const { t } = useTranslation();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [favourite, setFavourite] = useState(false);

  // Vars that will come from API
  const address = 'Hämeentie 1, 00530 Helsinki';
  const group = 'Hakaniemi';

  const getPhaseOptions = () => {
    const phaseOptions: Array<OptionType> = [];
    Object.values(ProjectPhase).map((p) => phaseOptions.push({ label: t(`enums.${p}`) }));
    return phaseOptions;
  };

  useEffect(
    function checkIfUserHasFavoured() {
      if (user && projectCard && projectCard.favPersons.length > 0) {
        setFavourite(projectCard?.favPersons.includes(user.id));
      }
    },
    [user, projectCard],
  );

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
              <Select
                label=""
                defaultValue={{ label: t(`enums.${projectCard?.phase}`) }}
                icon={<IconFaceSmile />}
                placeholder={t('projectPhase') || ''}
                options={getPhaseOptions()}
              />
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
