import { FC } from 'react';
import Title from './Title';

interface IFormSectionTitleProps {
  name: string;
  label: string;
}
const FormSectionTitle: FC<IFormSectionTitleProps> = ({ label, name }) => (
  <div className="input-wrapper" id={'formTitle'}>
    <Title size="m" text={label} id={name} />
  </div>
);

export default FormSectionTitle;
