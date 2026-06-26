import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react';
import { FC, memo, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';
import { Tooltip } from 'hds-react';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { formatNumberToContainSpaces } from '@/utils/common';

interface IListFieldProps {
  name: string;
  label: string;
  fields?: Array<IForm>;
  readOnly?: boolean;
  cancelEdit?: boolean;
  disabled?: boolean;
}

const ListField: FC<IListFieldProps> = ({
  name,
  label,
  fields,
  readOnly,
  cancelEdit,
  disabled,
}) => {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();

  function sumCosts(
    costs: IProjectSapCost | undefined | null,
    costType1: string,
    costType2: string,
  ): number {
    return costs
      ? (Number(costs[costType1 as keyof IProjectSapCost]) || 0) +
          (Number(costs[costType2 as keyof IProjectSapCost]) || 0)
      : 0;
  }

  function getSapCostValue(field: IForm): string {
    let sapValue = 0;

    switch (field.name) {
      case 'realizedCostCurrentYear':
        sapValue = sumCosts(field.sapCurrentYear, 'project_task_costs', 'production_task_costs');
        break;

      case 'realizedCost':
        sapValue = sumCosts(field.sapCosts, 'project_task_costs', 'production_task_costs');
        break;

      case 'comittedCost':
        sapValue = sumCosts(
          field.sapCosts,
          'project_task_commitments',
          'production_task_commitments',
        );
        break;

      case 'spentCost':
        sapValue =
          sumCosts(field.sapCosts, 'project_task_costs', 'production_task_costs') +
          sumCosts(field.sapCosts, 'project_task_commitments', 'production_task_commitments');
        break;

      default:
        break;
    }
    return formatNumberToContainSpaces(Number(sapValue.toFixed(0)));
  }

  const showTooltip = (field: IForm) => {
    if (
      field.name === 'realizedCostCurrentYear' ||
      field.name === 'realizedCost' ||
      field.name === 'comittedCost' ||
      field.name === 'spentCost'
    ) {
      return true;
    }
  };

  const renderTooltip = (field: IForm) => {
    const tooltipLabels: { [key: string]: string } = {
      realizedCostCurrentYear: t('projectForm.realizedCostCurrentYearTooltipLabel'),
      realizedCost: t('projectForm.realizedCostTooltipLabel'),
      comittedCost: t('projectForm.comittedCostTooltipLabel'),
      spentCost: t('projectForm.spentCostTooltipLabel'),
    };
    const tooltipLabel = tooltipLabels[field.name] || '';
    return (
      <Tooltip placement="top-start" className="list-field-tool-tip">
        {tooltipLabel}
      </Tooltip>
    );
  };

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  useEffect(() => {
    if (cancelEdit && editing) {
      setEditing(false);
    }
  }, [cancelEdit, editing]);

  const formatFieldValue = (fieldValue: string) => {
    return formatNumberToContainSpaces(Number(Number(fieldValue).toFixed(0)));
  };

  return (
    <div className="input-wrapper" id={name} data-testid={name}>
      <div className="flex flex-col">
        <div style={{ marginBottom: '1rem' }}>
          <FormFieldLabel
            disabled={disabled}
            text={t(label)}
            onClick={readOnly ? undefined : handleSetEditing}
          />
        </div>
        {fields?.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            rules={f.rules}
            control={f.control as Control<FieldValues>}
            render={({ field, fieldState: { error } }) => (
              <div className="list-field-container" key={f.label}>
                <label className="list-field-label">
                  {t(f.label)}
                  {showTooltip(f) ? renderTooltip(f) : null}
                </label>

                {!editing || f.readOnly ? (
                  <div className="list-field-values">
                    <span>
                      {f.isSapProject
                        ? `${getSapCostValue(f)}`
                        : `${formatFieldValue(field.value)}`}
                    </span>
                    <span>{f.isSapProject ? '€' : 'keur'}</span>
                  </div>
                ) : (
                  <>
                    <NumberInput
                      disabled={disabled}
                      className="list-field-input"
                      {...field}
                      label={''}
                      hideLabel={true}
                      id={field.name}
                      readOnly={!editing || f.readOnly}
                      errorText={error?.message}
                    />
                  </>
                )}
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ListField);
