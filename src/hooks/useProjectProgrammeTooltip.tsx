import { useTranslation } from 'react-i18next';
import { Tooltip } from 'hds-react';

export function useProjectProgrammeTooltip() {
  const { t } = useTranslation();

  return function renderTooltip(fieldName: string) {
    return <Tooltip>{t(`projectProgrammeForm.${fieldName}Tooltip`)}</Tooltip>;
  };
}
