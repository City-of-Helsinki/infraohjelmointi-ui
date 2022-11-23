import { FC } from 'react';
import Title from './Title';

interface IFormSectionTitleProps {
  label: string;
}
const FormSectionTitle: FC<IFormSectionTitleProps> = ({ label }) => (
  <div className="input-wrapper" id={'formTitle'}>
    <Title size="l" text={label} />
  </div>
);

export default FormSectionTitle;
