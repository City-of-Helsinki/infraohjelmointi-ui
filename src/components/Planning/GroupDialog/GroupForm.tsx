import { useState, MouseEvent, FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { useAppDispatch } from '@/hooks/common';
import { IGroupForm } from '@/interfaces/formInterfaces';
import { IGroupRequest } from '@/interfaces/groupInterfaces';
import useGroupForm from '@/forms/useGroupForm';
import { IOption } from '@/interfaces/common';
import GroupProjectSearch from './GroupProjectSearch';
import { postGroupThunk } from '@/reducers/groupSlice';
import { IconAngleDown, IconAngleUp } from 'hds-react/icons';

import { SelectField, TextField } from '@/components/shared';
import { Button } from 'hds-react/components/Button';

interface IFormState {
  projectsForSubmit: Array<IOption>;
  showAdvanceFields: boolean;
}
interface IGroupFormProps {
  handleClose: () => void;
}

const GroupForm: FC<IGroupFormProps> = ({ handleClose }) => {
  return <div></div>;
};

export default GroupForm;
