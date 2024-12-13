import { IForm } from '@/interfaces/formInterfaces';
import { NumberInput } from 'hds-react/components/NumberInput';
import { FC, memo, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';
import { Tooltip } from 'hds-react';

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

  function getSapCostValue(field: IForm):string {
    let sapValue = 0;
    // Toteuma kuluva vuosi = project_task_cost + production_task_cost kuluvalta vuodelta
    if (field.name === 'realizedCostCurrentYear') {
        const projectTaskCosts = Number(field.sapCurrentYear?.project_task_costs) || 0;
        const productionTaskCosts = Number(field.sapCurrentYear?.production_task_costs) || 0;
        sapValue = projectTaskCosts + productionTaskCosts;
    }
    // Toteuma yhteensä = project_task_cost + production_task_cost haettuna 
    // projektin suunnittelun aloitusvuodesta kuluvan vuoden loppuun asti
    else if (field.name === 'realizedCost') {
      const projectTaskCosts = Number(field.sapCosts?.project_task_costs) || 0;
      const productionTaskCosts = Number(field.sapCosts?.production_task_costs) || 0;
      sapValue = projectTaskCosts + productionTaskCosts;
    }
    // Sitoumukset yhteensä = project_task_commitments + production_task_commitments 
    // haettuna projektin suunnittelun aloitusvuodesta kuluvan vuoden loppuun asti 
    else if (field.name === 'comittedCost') {
      const project_task_commitments = Number(field.sapCosts?.project_task_commitments) || 0;
      const production_task_commitments = Number(field.sapCosts?.production_task_commitments) || 0;
      sapValue = project_task_commitments + production_task_commitments;
    }
    // Käytetty (Toteuma yhteensä + kaikki sitoumukset yhteensä) -> tarvii infotekstin
    else if (field.name === 'spentCost') {
      const projectTaskCosts = Number(field.sapCosts?.project_task_costs) || 0;
      const productionTaskCosts = Number(field.sapCosts?.production_task_costs) || 0;
      const project_task_commitments = Number(field.sapCosts?.project_task_commitments) || 0;
      const production_task_commitments = Number(field.sapCosts?.production_task_commitments) || 0;
      const realizedCost = projectTaskCosts + productionTaskCosts;
      const comittedCost = project_task_commitments + production_task_commitments;
      sapValue = Number(comittedCost) + Number(realizedCost);
    }
    return Number(sapValue).toFixed(0);
  };

  const showTooltip = (field: IForm) => {
    if (field.name === 'realizedCostCurrentYear' || field.name === 'realizedCost' || field.name === 'comittedCost' || field.name === 'spentCost') {
        return true; 
    }
  }

  const renderTooltip = (field: IForm) => {
    let tooltipLabel = '';
    if (field.name === 'realizedCostCurrentYear') {
      tooltipLabel = t('projectForm.realizedCostCurrentYearTooltipLabel')
    }
    else if (field.name === 'realizedCost') {
      tooltipLabel = t('projectForm.realizedCostTooltipLabel')
    }
    else if (field.name === 'comittedCost') {
      tooltipLabel = t('projectForm.comittedCostTooltipLabel')
    }
    else if (field.name === 'spentCost') {
      tooltipLabel = t('projectForm.spentCostTooltipLabel')
    }
    return <Tooltip placement="top-start" className="list-field-tool-tip" >{tooltipLabel}</Tooltip>
  }

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

  useEffect(() => {
    if (cancelEdit && editing) {
      setEditing(false);
    }
  }, [cancelEdit]);

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
                <label className="list-field-label">{t(f.label)}{showTooltip(f) ? renderTooltip(f) : null}</label>
                
                {!editing || f.readOnly ? (
                  <div className="list-field-values">
                    <span>{f.isSapProject ? `${getSapCostValue(f)}` : `${Number(field.value).toFixed(0)}`}</span>
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
