import { Tag } from 'hds-react/components/Tag';
import { TextInput } from 'hds-react/components/TextInput';
import { Title } from '../shared';

const ProjectCardBasicsForm = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 'var(--spacing-l)' }}>
        <Title size="l" text="Hankkeen perustiedot" />
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        {/* First 4 form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hanketyyppi"
              placeholder="Placeholder"
              required
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
        </div>
        {/* Readonly Fields next to first 4 fields */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              readOnly
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <TextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              readOnly
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-l)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <legend
                style={{
                  color: ' var(--label-color-default,var(--color-black-90))',
                  display: 'block',
                  fontSize: 'var(--fontsize-body-m)',
                  fontWeight: '500',
                  marginBottom: 'var(--spacing-m)',
                }}
              >
                Verkkonumerot
              </legend>
              <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                <label
                  style={{
                    color: ' var(--label-color-default,var(--color-black-90))',
                    fontSize: 'var(--fontsize-body-l)',
                    fontWeight: 'bold',
                    width: '110px',
                    display: 'inline-block',
                  }}
                >
                  RAKE
                </label>
                <span style={{ fontSize: 'var(--fontsize-body-l)' }}>A39390033390</span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                <label
                  style={{
                    color: ' var(--label-color-default,var(--color-black-90))',
                    fontSize: 'var(--fontsize-body-l)',
                    fontWeight: 'bold',
                    width: '110px',
                    display: 'inline-block',
                  }}
                >
                  MAKA
                </label>
                <span style={{ fontSize: 'var(--fontsize-body-l)' }}>A28930988284</span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                <label
                  style={{
                    color: ' var(--label-color-default,var(--color-black-90))',
                    fontSize: 'var(--fontsize-body-l)',
                    fontWeight: 'bold',
                    width: '110px',
                    display: 'inline-block',
                  }}
                >
                  Toim.ohj.
                </label>
                <span style={{ fontSize: 'var(--fontsize-body-l)' }}>B39838939923</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tags */}
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
        <label
          style={{
            color: ' var(--label-color-default,var(--color-black-90))',
            display: 'block',
            fontSize: 'var(--fontsize-body-m)',
            fontWeight: '500',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          Tunnisteet
        </label>
        <div style={{ display: 'flex', width: '100%', height: 'auto', flexWrap: 'wrap' }}>
          <div style={{ margin: '0 var(--spacing-xs) var(--spacing-xs) 0' }}>
            <Tag>News</Tag>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardBasicsForm;
