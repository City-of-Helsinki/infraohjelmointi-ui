import { HookFormControlType } from '@/interfaces/formInterfaces';
import { tempTags } from '@/mocks/common';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useState, MouseEvent, FC, forwardRef, Ref, useEffect } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import PenAndLabelButton from './PenAndLabelButton';
import TagsContainer from './TagsContainer';
import Title from './Title';

interface ITagsDialogProps {
  name: string;
  label: string;
  value: Array<string>;
  onChange: (tags: Array<string>) => void;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const TagsDialog: FC<ITagsDialogProps> = forwardRef(
  ({ name, label, value, onChange }, ref: Ref<HTMLDivElement>) => {
    const [tags, setTags] = useState(['']);
    const [isOpen, setIsOpen] = useState(false);

    const { Header, Content, ActionButtons } = Dialog;

    // Update tags with changes in value
    useEffect(() => {
      if (value) {
        setTags(value);
      }
    }, [value]);

    const onEdit = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    };

    const onSaveTags = () => {
      onChange(tags.filter((t) => t));
      setIsOpen(!isOpen);
    };

    return (
      <div className="input-wrapper" id={name} ref={ref}>
        <div className="display-flex-col">
          <Dialog
            id="tags-dialog"
            aria-labelledby={label}
            isOpen={isOpen}
            close={() => setIsOpen(!isOpen)}
            closeButtonLabelText="Sulje "
            className="tags-dialog"
          >
            <Header id={label} title="Hakaniementori - Hallitse tunnisteita" />
            <hr />
            <Content>
              <div className="tags-content-container">
                <div className="added-tags-title-container">
                  <Title size="xs" text="Hankkeen tunnisteet" />
                </div>
                <TagsContainer
                  tags={tags}
                  onDelete={(t) => setTags(tags.filter((tag) => tag !== t))}
                />
              </div>
            </Content>
            <hr />
            <Content>
              <div className="tags-content-container">
                <div className="all-tags-title-container">
                  <Title size="xs" text="Lisää hankkeelle uusi tunniste" />
                  <button className="text-button">Muokkaa yleistilaa</button>
                </div>
                <div className="all-tags-container">
                  <Button onClick={close} variant="secondary">
                    Hae tunnisteita tai luo uusi
                  </Button>
                </div>
                <TagsContainer tags={tempTags} onClick={(t) => setTags([...tags, t])} />
              </div>
            </Content>
            <ActionButtons>
              <Button onClick={() => onSaveTags()}>Tallenna</Button>
            </ActionButtons>
          </Dialog>
          <PenAndLabelButton text={'Tunnisteet'} onClick={(e) => onEdit(e)} />
          <TagsContainer tags={value} />
        </div>
      </div>
    );
  },
);

interface ITagsForm {
  name: string;
  label: string;
  control: HookFormControlType;
}

const TagsForm: FC<ITagsForm> = ({ name, label, control }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => <TagsDialog {...field} {...fieldState} label={label} />}
    />
  );
};

TagsDialog.displayName = 'TagsDialog';

export default TagsForm;
