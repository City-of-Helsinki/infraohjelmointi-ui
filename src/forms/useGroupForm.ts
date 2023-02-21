import { FormField, HookFormControlType, IForm, IGroupForm } from '@/interfaces/formInterfaces';

import { useForm } from 'react-hook-form';

import { t, TFunction } from 'i18next';
import { useMemo } from 'react';

const buildGroupFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    {
      name: 'name',
      type: FormField.Text,
      rules: { required: 'This field is required' },
    },
    {
      name: 'masterClass',
      type: FormField.Select,
      placeholder: 'Valitse',
      rules: { required: 'This field is required' },
    },
    {
      name: 'class',
      type: FormField.Select,
      placeholder: 'Valitse',
      rules: { required: 'This field is required' },
    },
    {
      name: 'subClass',
      type: FormField.Select,
      placeholder: 'Valitse',
    
    },
  ];

  const GroupFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`groupForm.${formField.name}`),
  }));

  return GroupFormFields;
};

const useGroupValues = () => {
  // const masterClasses = useAppSelector(selectMasterClasses);
  // const classes = useAppSelector(selectClasses);
  // const subClasses = useAppSelector(selectSubClasses);

  // const getGroupClassFields = (group?: IGroup ) => {
  //     const classAsListItem = (classRelation: IClass | undefined): IListItem => ({
  //       id: classRelation?.id || '',
  //       value: classRelation?.name || '',
  //     });

  //     const selectedSubClass = group
  //       ? subClasses.find(({ id }) => id === group.classRelation)
  //       : undefined;

  //     const groupClassId = selectedSubClass?.parent || group?.classRelation;

  //     const selectedClass = groupClassId
  //       ? classes.find(({ id }) => id === groupClassId)
  //       : undefined;

  //     const masterClassId = selectedClass?.parent || group?.classRelation;

  //     const selectedMasterClass = masterClassId
  //       ? masterClasses.find(({ id }) => id === masterClassId)
  //       : undefined;

  //     return {
  //       masterClass: listItemToOption(classAsListItem(selectedMasterClass) || []),
  //       class: listItemToOption(classAsListItem(selectedClass) || []),
  //       subClass: listItemToOption(classAsListItem(selectedSubClass) || []),
  //     };
  //   };

  const formValues = useMemo(
    () => ({
      name: '',
      masterClass: {},
      class: {},
      subClass: {},
    }),
    [],
  );
  return { formValues };
};

const useGroupForm = () => {
  const { formValues } = useGroupValues();

  const formMethods = useForm<IGroupForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control } = formMethods;
  const formFields = useMemo(() => buildGroupFormFields(control, t), [control]);

  return { formMethods, formValues, formFields };
};

export default useGroupForm;
