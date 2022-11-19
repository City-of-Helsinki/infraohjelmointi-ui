import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { RootState } from '@/store';
import { useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle, IconButton, Title } from '@/components/shared';
import { IconFaceSmile, IconPenLine, IconStar, IconStarFill } from 'hds-react/icons';
import { TextInput } from 'hds-react/components/TextInput';
import { Select } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';
import { ProjectPhase } from '@/interfaces/projectCardInterfaces';
import { IOptionType, SelectCallback } from '@/interfaces/common';

interface INameFormProps {
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const NameForm: FC<INameFormProps> = ({ name, onChange }) => {
  const [editing, setEditing] = useState(false);
  const address = 'Hämeentie 1, 00530 Helsinki';
  return (
    <div className="edit-name-form">
      <div>
        {editing ? (
          <TextInput id="textinput" value={name || ''} onChange={onChange} required />
        ) : (
          <>
            <Title size="m" color="white" text={name} />
            <Paragraph size="l" color="white" text={address} />
          </>
        )}
      </div>
      <IconButton
        onClick={() => setEditing(!editing)}
        icon={IconPenLine}
        color="white"
        label="edit-project-name"
      />
    </div>
  );
};

interface IProjectPhaseDropdown {
  selectedOption: string;
  onChange: SelectCallback;
}

const ProjectPhaseDropdown: FC<IProjectPhaseDropdown> = ({ selectedOption, onChange }) => {
  const { t } = useTranslation();

  const getPhaseOptions = () => {
    const phaseOptions: Array<IOptionType> = [];
    Object.values(ProjectPhase).map((p) => phaseOptions.push({ label: t(`enums.${p}`) }));
    return phaseOptions;
  };

  return (
    <>
      {/* FIXME: this hack is here because HDS-Select component doesn't re-rendering the defaultValue */}
      {selectedOption && (
        <div className="phase-dropdown">
          <Select
            label=""
            defaultValue={{ label: t(`enums.${selectedOption}`) }}
            icon={<IconFaceSmile />}
            placeholder={t('projectPhase') || ''}
            options={getPhaseOptions()}
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
      <div className="header-row">
        {/* left */}
        <div className="display-flex">
          <div className="progress-indicator-container">
            <ProgressCircle color={'--color-engel'} percent={projectCard?.projectReadiness} />
          </div>
          <div className="header-column">
            <NameForm name={name} onChange={(e) => setName(e.target.value)} />
            <ProjectPhaseDropdown
              selectedOption={selectedOption}
              onChange={(o) => setSelectedOption(o.label)}
            />
          </div>
        </div>
        {/* right */}
        <div className="header-column text-right">
          <div>
            <div className="favourite-button-container">
              <IconButton
                onClick={() => setFavourite(!favourite)}
                color="white"
                icon={favourite ? IconStarFill : IconStar}
                text={favourite ? 'removeFavourite' : 'addFavourite'}
              />
            </div>
            <div>
              <Paragraph color="white" size="m" text={'inGroup'} />
              <Paragraph color="white" size="l" fontWeight="bold" text={group} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardHeader;
