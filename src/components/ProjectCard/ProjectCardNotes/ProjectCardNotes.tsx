import { FormFieldLabel, Paragraph, Span, Title } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getNotesByProjectCardThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';
import _ from 'lodash';
import { useEffect } from 'react';
import { IconAngleDown, IconPenLine, IconTrash } from 'hds-react/icons';

const ProjectCardNotes = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard?.id,
    _.isEqual,
  );
  const notes = useAppSelector((state: RootState) => state.projectCard.notes, _.isEqual);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectCardThunk(projectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div style={{ margin: 'var(--spacing-layout-l) var(--spacing-layout-xl)' }}>
      <Title size="m" text="notes" />
      <Paragraph size="m" text="Tallenna hankkeeseen liittyvät muistiinpanot tähän" />
      {/* note form */}
      <div style={{ width: '70%', maxWidth: '40rem' }}>
        <div
          style={{
            border: '0.125rem solid rgb(204, 204, 204)',
            padding: 'var(--spacing-m)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            margin: 'var(--spacing-m) 0',
          }}
        >
          <div style={{ width: '100%', margin: '0 0 var(--spacing-m) 0' }}>
            <TextArea id="textarea" label="Kirjoita muistiinpano" placeholder="Placeholder" />
          </div>
          <Button>Tallenna</Button>
        </div>
        <div>
          {notes?.map((n) => (
            <div key={n.id} style={{ background: 'rgb(247, 247, 248)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-m) var(--spacing-m) 0 var(--spacing-m)',
                }}
              >
                <div>
                  <Span text={'23.11.2022 8:05'} size="s" fontWeight="light" />
                  <FormFieldLabel text="Mikko Mallikas" />
                </div>
                <div>
                  <StatusLabel type="alert">Muokattu</StatusLabel>
                </div>
              </div>
              <div
                style={{
                  padding: '0 var(--spacing-m) var(--spacing-l) var(--spacing-m)',
                }}
              >
                <p>
                  {
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In luctus lacus sit amet accumsan dapibus. Curabitur blandit interdum consectetur. Nullam ultrices sem nec placerat convallis. In mollis arcu elementum iaculis facilisis. Morbi porttitor facilisis mauris. Vivamus condimentum viverra sem, a lacinia ex fringilla vel. Nulla tincidunt ante sed lorem molestie vulputate. Mauris interdum venenatis rutrum. Morbi odio dolor, eleifend sed lorem nec, egestas porta est.'
                  }
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 var(--spacing-xs) var(--spacing-s) var(--spacing-xs)',
                }}
              >
                <Button size="small" variant="supplementary" iconRight={<IconAngleDown />}>
                  Muokkaushistoria
                </Button>
                <div>
                  <Button size="small" variant="supplementary" iconLeft={<IconTrash />}>
                    Poista
                  </Button>
                  <Button size="small" variant="supplementary" iconLeft={<IconPenLine />}>
                    Muokkaa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardNotes;
