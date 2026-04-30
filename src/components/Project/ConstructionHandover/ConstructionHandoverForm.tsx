import { FieldPath, FormProvider } from 'react-hook-form';
import NameAndDescriptionSection from './NameAndDescriptionSection';
import useConstructionHandoverForm from '@/forms/useConstructionHandoverForm';
import { IProject } from '@/interfaces/projectInterfaces';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import ScheduleSection from './ScheduleSection';
import ContactsSection from './ContactsSection';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, IconLink } from 'hds-react';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';

export function getFieldProps(name: FieldPath<IConstructionHandoverForm>) {
  return {
    name: name,
    label: `constructionHandoverForm.${name}`,
  };
}

interface IConstructionHandoverFormProps {
  project: IProject | null;
}

export default function ConstructionHandoverForm({
  project,
}: Readonly<IConstructionHandoverFormProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useConstructionHandoverForm(project);

  function onCopyLinkClick() {
    navigator.clipboard
      .writeText(globalThis.location.href)
      .then(() => {
        dispatch(
          notifySuccess({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            duration: 3500,
          }),
        );
      })
      .catch(() => {
        dispatch(
          notifyError({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            duration: 3500,
          }),
        );
      });
  }

  return (
    <FormProvider {...formMethods}>
      <form>
        <NameAndDescriptionSection />
        <ScheduleSection />
        <ContactsSection />

        <div className="project-form-banner">
          <div className="project-form-banner-container">
            <Button
              variant={ButtonVariant.Secondary}
              iconStart={<IconLink />}
              type="button"
              onClick={onCopyLinkClick}
            >
              {t('copyLink')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
