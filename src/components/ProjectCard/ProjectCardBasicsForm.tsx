import useProjectCardBasicsForm from '@/hooks/useProjectCardBasicsForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { RootState } from '@/store';
import { Tag } from 'hds-react/components/Tag';
import { IconPenLine } from 'hds-react/icons';
import { FC, useState, MouseEvent, MouseEventHandler } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { FormFieldCreator, Span, Title } from '../shared';
import { Button } from 'hds-react/components/Button';
import { patchProjectCardThunk, postProjectCardThunk } from '@/reducers/projectCardSlice';
import { useParams } from 'react-router-dom';

interface IPenAndLabelProps {
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const PenAndLabel: FC<IPenAndLabelProps> = ({ text, onClick }) => {
  return (
    <div style={{ display: 'flex' }}>
      <label>{text}</label>
      <button onClick={onClick}>
        <IconPenLine style={{ transform: 'translate(20px, -6px)' }} />
      </button>
    </div>
  );
};

const NetworkNumbers = () => {
  // Temp values until API returns / enables these
  const [networkNumbers, setNetworkNumber] = useState([
    {
      label: 'RAKE',
      value: 'A39390033390',
    },
    {
      label: 'MAKA',
      value: 'A28930988284',
    },
    {
      label: 'Toim.ohj.',
      value: 'B39838939923',
    },
  ]);

  const addNetworkNumber = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNetworkNumber([...networkNumbers, { label: 'TESTI', value: 'X56838939563' }]);
  };

  return (
    <div className="display-flex-col">
      <PenAndLabel text="Verkkonumerot" onClick={(e) => addNetworkNumber(e)} />
      {networkNumbers.map((nn) => (
        <div className="nn-row" key={nn.label}>
          <label className="nn-label">{nn.label}</label>
          <Span size="m" text={nn.value} />
        </div>
      ))}
    </div>
  );
};

const Identifiers = () => {
  // Temp values until API returns / enables these
  const [tags, setTags] = useState(['uudisrakentaminen', 'pyöräily', 'pohjoinensuurpiiri']);

  const onEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTags([...tags, 'testi']);
  };

  return (
    <div className="input-wrapper">
      <div className="display-flex-col">
        <PenAndLabel text={'Tunnisteet'} onClick={(e) => onEdit(e)} />
        <div className="tags-container">
          {tags.map((t) => (
            <div key={t} className="tag-wrapper">
              <Tag>{t}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectCardBasicsForm: FC = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const { handleSubmit, formFields } = useProjectCardBasicsForm(projectCard);

  const onSubmit: SubmitHandler<IProjectCardBasicsForm> = async (data) => {
    if (projectId) {
      dispatch(patchProjectCardThunk({ id: projectId, data })).then((res) => {
        console.log('PATCH response: ', res);
      });
    } else {
      dispatch(postProjectCardThunk({ data })).then((res) => {
        console.log('POST response: ', res);
      });
    }
  };

  /*
   * TODO: create a component that works with the "Pen icon" to add network numbers and edit/add tags,
   * add it to form when types are known
   */
  return (
    <div className="basics-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-wrapper">
          <Title size="l" text="Hankkeen perustiedot" />
        </div>
        <div className="display-flex">
          {/* First 4 form fields */}
          <div className="basics-form-column">
            <FormFieldCreator form={formFields[0]} />
          </div>
          {/* Readonly Fields next to first 4 fields */}
          <div className="basics-form-column">
            <FormFieldCreator form={formFields[1]} />
            <NetworkNumbers />
          </div>
        </div>
        {/* Tags */}
        <Identifiers />
        <Button type="submit">Lähetä</Button>
      </form>
    </div>
  );
};

export default ProjectCardBasicsForm;
