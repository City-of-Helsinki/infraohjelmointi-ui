import { ChangeEvent, FC, useEffect, useState } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle, IconButton } from '@/components/shared';
import { IconFaceSmile, IconStar, IconStarFill } from 'hds-react/icons';
import { Select } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';
import { IOption, SelectCallback } from '@/interfaces/common';
import ProjectCardNameForm from './ProjectCardNameForm';
import { useOptions } from '@/hooks/useOptions';
import { listItemToOption } from '@/utils/common';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { patchProjectCardThunk } from '@/reducers/projectCardSlice';
import { Button } from 'hds-react/components/Button';

interface IPhaseDropdown {
  options: Array<IOption>;
  value: IOption;
  onChange: SelectCallback;
}

interface IFormState {
  selectedOption: IOption;
  favourite: boolean;
  name: string;
  address?: string;
  group: string;
}

const PhaseDropdown: FC<IPhaseDropdown> = ({ options, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <Select
          label=""
          value={value}
          icon={<IconFaceSmile />}
          placeholder={t('projectPhase') || ''}
          options={options}
          onChange={onChange}
        />
      </div>
    </>
  );
};

const ProjectCardHeader: FC = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { options } = useOptions('phase');

  // Adapt this to useForm() when we need to submit this
  const [formState, setFormState] = useState<IFormState>({
    favourite: false,
    selectedOption: { label: '', value: '' },
    name: '',
    address: '',
    group: 'Hakaniemi',
  });

  const handlePhaseChange = (o: IOption) => setFormState({ ...formState, selectedOption: o });
  const handleFavChange = () => setFormState({ ...formState, favourite: !formState.favourite });
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormState({ ...formState, name: e.target.value });
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormState({ ...formState, address: e.target.value });

  const handleSubmit = async () => {
    const projectId = projectCard?.id;
    const data: IProjectCardRequest = {
      name: formState.name,
    };
    if (projectId) {
      await dispatch(patchProjectCardThunk({ id: projectCard?.id, data: data }));
    }
  };

  // Add values on project card changes
  useEffect(
    () => {
      if (projectCard) {
        setFormState({
          ...formState,
          favourite: (user && projectCard.favPersons?.includes(user.id)) || false,
          selectedOption: listItemToOption(projectCard.phase, t),
          name: projectCard.name,
          address: projectCard.address,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, projectCard],
  );

  return (
    <div>
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
            <ProjectCardNameForm
              name={formState.name}
              address={formState.address}
              onNameChange={handleNameChange}
              onAddressChange={handleAddressChange}
            />
            <PhaseDropdown
              options={options}
              value={formState.selectedOption}
              onChange={handlePhaseChange}
            />
          </div>
        </div>
        <div className="right">
          <div className="right-wrapper">
            <div className="right-wrapper-inner">
              <div className="favourite-button-container">
                <IconButton
                  onClick={handleFavChange}
                  color="white"
                  icon={formState.favourite ? IconStarFill : IconStar}
                  text={formState.favourite ? 'removeFavourite' : 'addFavourite'}
                />
              </div>
              <Paragraph color="white" size="m" text={'inGroup'} />
              <Paragraph color="white" size="l" fontWeight="bold" text={formState.group} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button
          variant="primary"
          onClick={handleSubmit}
          style={{ marginLeft: '2rem', marginTop: '1rem' }}
        >
          Tallenna otsikon tiedot
        </Button>
      </div>
    </div>
  );
};

export default ProjectCardHeader;
