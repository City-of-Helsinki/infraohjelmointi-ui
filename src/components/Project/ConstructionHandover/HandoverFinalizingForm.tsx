import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Notification, Tooltip } from 'hds-react';
import { SelectField } from '@/components/shared';
import { useOptions } from '@/hooks/useOptions';
import { FormProvider, useForm } from 'react-hook-form';
import { IConstructionHandoverFinalizingForm } from '@/interfaces/formInterfaces';
import {
  ConstructionHandoverStatus,
  IConstructionHandover,
  IConstructionHandoverRequest,
} from '@/interfaces/constructionHandoverInterfaces';
import { usePatchConstructionHandoverMutation } from '@/api/constructionHandoverApi';
import { listItemToOption, personToOption } from '@/utils/common';
import { validateRequiredSelect } from '@/utils/validation';
import useConstructionProcurementMethod from '@/hooks/useConstructionProcurementMethod';

function useHandoverFinalizingForm(constructionHandover: IConstructionHandover | null) {
  const formMethods = useForm<IConstructionHandoverFinalizingForm>({
    values: {
      constructionProjectManager: personToOption(constructionHandover?.constructionProjectManager),
      constructionProcurementMethod: listItemToOption(
        constructionHandover?.constructionProcurementMethod,
      ),
      staraProcurementReason: listItemToOption(constructionHandover?.staraProcurementReason),
    },
    mode: 'onBlur',
  });

  const [patchConstructionHandover] = usePatchConstructionHandoverMutation();

  function submitForm(data: IConstructionHandoverFinalizingForm) {
    if (!constructionHandover) return;

    let requestData: Partial<IConstructionHandoverRequest>;
    const isSubmittedToConstruction =
      constructionHandover.status === ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION;
    const procurementMethodId = data.constructionProcurementMethod?.value;
    const staraProcurementReasonId = data.staraProcurementReason?.value;

    if (isSubmittedToConstruction) {
      requestData = {
        constructionProjectManager: data.constructionProjectManager.value,
      };

      if (procurementMethodId) {
        requestData = {
          ...requestData,
          constructionProcurementMethod: procurementMethodId,
        };
      }
      if (staraProcurementReasonId) {
        requestData = {
          ...requestData,
          staraProcurementReason: staraProcurementReasonId,
        };
      }
    } else {
      requestData = {
        constructionProcurementMethod: procurementMethodId,
      };
      if (staraProcurementReasonId) {
        requestData = {
          ...requestData,
          staraProcurementReason: staraProcurementReasonId,
        };
      }
    }

    patchConstructionHandover({ id: constructionHandover.id, data: requestData });
  }

  return {
    formMethods,
    submitForm,
  };
}

interface IHandoverFinalizingFormProps {
  constructionHandover: IConstructionHandover;
}

function HandoverFinalizingForm({ constructionHandover }: Readonly<IHandoverFinalizingFormProps>) {
  const { t } = useTranslation();

  const responsiblePersons = useOptions('responsiblePersons');

  const { formMethods, submitForm } = useHandoverFinalizingForm(constructionHandover);
  const { handleSubmit } = formMethods;

  const { watch, setValue } = formMethods;

  const { constructionProcurementMethods, staraProcurementReasons, showStaraProcurementReason } =
    useConstructionProcurementMethod(
      watch,
      setValue,
      'constructionProcurementMethod',
      'staraProcurementReason',
    );

  const isSubmittedToConstruction =
    constructionHandover.status === ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION;
  const isProjectManagerNamed =
    constructionHandover.status === ConstructionHandoverStatus.PROJECT_MANAGER_NAMED;

  const notificationLabel = isSubmittedToConstruction
    ? t('constructionHandoverForm.nameProjectManager')
    : t('constructionHandoverForm.moveToConstructionPreparation');

  const buttonText = isSubmittedToConstruction
    ? t('constructionHandoverForm.saveProjectManagerButton')
    : t('constructionHandoverForm.moveToConstructionPreparationButton');

  return (
    <FormProvider {...formMethods}>
      <form className="mb-10" onSubmit={handleSubmit(submitForm)}>
        <Notification label={notificationLabel} style={{ overflow: 'visible' }}>
          <div className="mt-4">
            {Boolean(constructionHandover.constructionProjectManager) &&
              isSubmittedToConstruction && (
                <p className="text-body mb-4">{t('constructionHandoverForm.projectManagerSet')}</p>
              )}
            {isProjectManagerNamed && (
              <p className="text-body mb-4">{t('constructionHandoverForm.checkInformation')}</p>
            )}
            {isSubmittedToConstruction && (
              <SelectField
                name="constructionProjectManager"
                label="constructionHandoverForm.constructionProjectManager"
                options={responsiblePersons}
                size="full"
                tooltip={
                  <Tooltip placement="top">
                    {t('constructionHandoverForm.nameProjectManagerTooltip')}
                  </Tooltip>
                }
                required
                rules={{ ...validateRequiredSelect('person', t) }}
              />
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <SelectField
                  name="constructionProcurementMethod"
                  label="constructionHandoverForm.constructionProcurementMethod"
                  options={constructionProcurementMethods}
                  size="full"
                  required={isProjectManagerNamed}
                  rules={
                    isProjectManagerNamed
                      ? {
                          ...validateRequiredSelect('constructionProcurementMethod', t),
                        }
                      : undefined
                  }
                />
              </div>
              {showStaraProcurementReason && (
                <div className="flex-1">
                  <SelectField
                    name="staraProcurementReason"
                    label="constructionHandoverForm.staraProcurementReason"
                    options={staraProcurementReasons}
                    clearable
                  />
                </div>
              )}
            </div>
            <Button type="submit">{buttonText}</Button>
          </div>
        </Notification>
      </form>
    </FormProvider>
  );
}

export default memo(HandoverFinalizingForm);
