import { FormSectionTitle, NumberField, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectTalpaAssetClasses, selectTalpaServiceClasses } from '@/reducers/listsSlice';
import { useFormContext } from 'react-hook-form';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import { useEffect } from 'react';
import { groupOptions } from '@/utils/common';
import { BudgetItemNumber } from './budgetItemNumber';
import { InvestmentProfile } from './investmentProfile';
import { validateRequired } from '@/utils/validation';
import { TalpaReadiness } from '@/interfaces/talpaInterfaces';
import { TalpaProfileName } from './profileName';

export default function ProjectClassesSection() {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { dirtyFields },
  } = useFormContext<IProjectTalpaForm>();

  const talpaServiceClasses = useSelector(selectTalpaServiceClasses);
  const talpaAssetClasses = useSelector(selectTalpaAssetClasses);

  const [budgetItemNumber, assetClass] = watch(['budgetItemNumber', 'assetClass']);
  const budgetItemNumberDirty = Boolean(dirtyFields?.budgetItemNumber);

  const filteredServiceClasses = talpaServiceClasses.filter(
    (serviceClass) => serviceClass.projectTypePrefix === budgetItemNumber,
  );

  const serviceClassOptions = filteredServiceClasses.map((serviceClass) => ({
    label: `${serviceClass.code} ${serviceClass.name}`,
    value: serviceClass.id,
    selected: false,
    isGroupLabel: false,
    visible: true,
    disabled: false,
  }));

  const assetClassGroups = groupOptions(
    talpaAssetClasses,
    (assetClass) => assetClass.category,
    (assetClass) => ({
      label: `${assetClass.name} / ${assetClass.componentClass}`,
      value: assetClass.id,
      selected: false,
      isGroupLabel: false,
      visible: true,
      disabled: false,
    }),
  );

  useEffect(() => {
    if (budgetItemNumberDirty) {
      setValue('serviceClass', null);
    }

    if (budgetItemNumber === BudgetItemNumber.InfraInvestment) {
      setValue('investmentProfile', InvestmentProfile.InfraInvestment);
      setValue('profileName', TalpaProfileName.FixedStructures);
    } else {
      setValue('investmentProfile', InvestmentProfile.PreConstruction);
      setValue('profileName', TalpaProfileName.LandAndWater);
    }
  }, [budgetItemNumber, budgetItemNumberDirty, setValue, t]);

  useEffect(() => {
    const selectedAssetClass = talpaAssetClasses.find((ac) => ac.id === assetClass?.value);
    if (selectedAssetClass) {
      setValue('holdingTime', selectedAssetClass.holdingPeriodYears);
    }
  }, [assetClass, talpaAssetClasses, setValue]);

  return (
    <div>
      <FormSectionTitle label="projectTalpaForm.projectClasses" name="projectClasses" />
      {/* Palveluluokka */}
      <SelectField
        {...getFieldProps('serviceClass')}
        options={serviceClassOptions}
        shouldTranslate={false}
        size="full"
        rules={{ ...validateRequired('serviceClass', t) }}
        placeholder={t('projectTalpaForm.serviceClassPlaceholder')}
      />
      {/* Käyttöomaisuusluokka */}
      <SelectField
        {...getFieldProps('assetClass')}
        groups={assetClassGroups}
        size="full"
        rules={{ ...validateRequired('assetClass', t) }}
        placeholder={t('projectTalpaForm.assetClassPlaceholder')}
      />
      {/* Proﬁiilin nimi */}
      <TextField {...getFieldProps('profileName')} size="full" />
      <div className={styles.formRowWithColumns}>
        {/* Pitoaika */}
        <NumberField {...getFieldProps('holdingTime')} size="full" />
        {/* Investointiproﬁli */}
        <TextField {...getFieldProps('investmentProfile')} size="full" />
        {/* Valmius */}
        <SelectField
          {...getFieldProps('readiness')}
          options={[
            { label: TalpaReadiness.Kesken, value: TalpaReadiness.Kesken },
            { label: TalpaReadiness.Valmis, value: TalpaReadiness.Valmis },
          ]}
          size="full"
          wrapperClassName="basis-1/3"
        />
      </div>
    </div>
  );
}
