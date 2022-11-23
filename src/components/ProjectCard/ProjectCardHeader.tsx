import { FC, useEffect, useState } from 'react';
import { RootState } from '@/store';
import { useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle, IconButton } from '@/components/shared';
import { IconFaceSmile, IconStar, IconStarFill } from 'hds-react/icons';
import { Select } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';
import { ProjectPhase } from '@/interfaces/projectCardInterfaces';
import { IOptionType, SelectCallback } from '@/interfaces/common';
import { getOptionsFromEnum } from '@/utils/common';
import ProjectCardNameForm from './ProjectCardNameForm';

interface IPhaseDropdown {
  options: Array<IOptionType>;
  selectedOption: string;
  onChange: SelectCallback;
}

const PhaseDropdown: FC<IPhaseDropdown> = ({ options, selectedOption, onChange }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* FIXME: this hack is here because HDS-Select component doesn't re-rendering the defaultValue */}
      {selectedOption && (
        <div>
          <Select
            label=""
            defaultValue={{ label: t(`enums.${selectedOption}`) }}
            icon={<IconFaceSmile />}
            placeholder={t('projectPhase') || ''}
            options={options}
            onChange={onChange}
          />
        </div>
      )}
    </>
  );
};

const ProjectCardHeader: FC = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const [favourite, setFavourite] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [name, setName] = useState('');

  // Vars that will come from API
  const group = 'Hakaniemi';

  useEffect(
    function onProjectCardChanges() {
      if (projectCard) {
        setFavourite((user && projectCard.favPersons.includes(user.id)) || false);
        setSelectedOption(projectCard.phase);
        setName(projectCard.name);
      }
    },
    [user, projectCard],
  );
  return (
    <div className="project-card-header-container">
      <div className="left">
        <div className="left-wrapper">
          <div className="readiness-container">
            <ProgressCircle color={'--color-engel'} percent={projectCard?.projectReadiness} />
          </div>
        </div>
      </div>
      <div className="center">
        <div className="center-wrapper">
          <ProjectCardNameForm name={name} onChange={(e) => setName(e.target.value)} />
          <PhaseDropdown
            options={getOptionsFromEnum(ProjectPhase)}
            selectedOption={selectedOption}
            onChange={(o) => setSelectedOption(o.label)}
          />
        </div>
      </div>
      <div className="right">
        <div className="right-wrapper">
          <div className="right-wrapper-inner">
            <div className="favourite-button-container">
              <IconButton
                onClick={() => setFavourite(!favourite)}
                color="white"
                icon={favourite ? IconStarFill : IconStar}
                text={favourite ? 'removeFavourite' : 'addFavourite'}
              />
            </div>
            <Paragraph color="white" size="m" text={'inGroup'} />
            <Paragraph color="white" size="l" fontWeight="bold" text={group} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardHeader;
