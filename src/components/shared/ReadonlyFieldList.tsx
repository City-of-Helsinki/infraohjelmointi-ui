import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

interface IReadonlyFieldListProps {
  fields: readonly string[];
  pathPrefix?: string;
  translationNamespace?: string;
}

export default function ReadonlyFieldList({
  fields,
  pathPrefix,
  translationNamespace,
}: IReadonlyFieldListProps) {
  const { t } = useTranslation();
  const { getValues } = useFormContext();

  function getLabel(field: string) {
    return translationNamespace ? t(`${translationNamespace}.${field}`) : t(field);
  }

  function getValue(field: string) {
    return getValues(pathPrefix ? `${pathPrefix}.${field}` : field) || '';
  }

  return (
    <>
      {fields.map((field) => {
        const fieldValue = getValue(field);

        if (!fieldValue) {
          return null;
        }

        return (
          <div key={field} className="mb-6">
            <label className="heading-xs">{getLabel(field)}</label>
            <p className="whitespace-pre-wrap">{fieldValue}</p>
          </div>
        );
      })}
    </>
  );
}
