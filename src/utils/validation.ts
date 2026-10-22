import { IError, IOption } from '@/interfaces/common';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { UseFormGetValues } from 'react-hook-form';
import _ from 'lodash';
import { isBefore, isSameOrBefore } from './dates';
import { isUserOnlyProjectAreaPlanner, isUserOnlyProjectManager } from './userRoleHelpers';
import { IUser } from '@/interfaces/userInterfaces';

export const validateMaxLength = (value: number, t: TFunction<'translation'>) => ({
  maxLength: { value: value, message: t('validation.maxLength', { value: value }) },
});

export const validateInteger = (t: TFunction<'translation'>) => ({
  validate: {
    isInteger: (value: string | number) =>
      Number.isInteger(Number(value)) ? true : t('validation.wholeNumber'),
  },
});

export const validateRequired = (field: string, t: TFunction<'translation'>) => ({
  required: t('validation.required', { field: t(`validation.${field}`) }) ?? '',
});

// Validation for select fields where the value is an object with a 'value' property
export const validateRequiredSelect = (field: string, t: TFunction<'translation'>) => ({
  validate(option: IOption | null | undefined) {
    if (!option || option.value === '') {
      return t('validation.required', { field: t(`validation.${field}`) });
    }
  },
});

export const validateMaxNumber = (max: number, t: TFunction<'translation'>) => ({
  min: {
    value: 0,
    message: t('validation.minValue', { value: '0' }),
  },
  max: {
    value: max,
    message: t('validation.maxValue', { value: max }),
  },
});

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const validateEmail = (t: TFunction<'translation'>) => ({
  validate: {
    isEmail: (value: string | null | undefined) =>
      !value || emailRegex.test(value) ? true : t('validation.invalidEmail'),
  },
});

/**
 * Date range validators that work directly on date string values, without depending on
 * a specific react-hook-form form shape. These are shared between forms that edit the
 * same project dates (e.g. ProjectForm and MyWorkloadEditDialog) to avoid duplicating the
 * date order rules in multiple places.
 */
export const validateDateIsBefore = (
  startDate: string | null,
  endDate: string | null,
  endDateFieldLabel: string,
  t: TFunction<'translation'>,
) => {
  if (!isBefore(startDate, endDate)) {
    return t('validation.isBefore', {
      value: t(`validation.${endDateFieldLabel}`),
    });
  }
  return true;
};

export const validateDateIsAfter = (
  endDate: string | null,
  startDate: string | null,
  startDateFieldLabel: string,
  t: TFunction<'translation'>,
) => {
  if (!isBefore(startDate, endDate)) {
    return t('validation.isAfter', {
      value: t(`validation.${startDateFieldLabel}`),
    });
  }
  return true;
};

export const validateDateIsSameOrAfter = (
  endDate: string | null,
  startDate: string | null,
  startDateFieldLabel: string,
  t: TFunction<'translation'>,
) => {
  if (!isSameOrBefore(startDate, endDate)) {
    return t('validation.isSameOrAfter', {
      value: t(`validation.${startDateFieldLabel}`),
    });
  }
  return true;
};

export const validateBefore = (
  startDate: string | null,
  endDateField: string,
  getValues: UseFormGetValues<IProjectForm>,
  t: TFunction<'translation'>,
) =>
  validateDateIsBefore(
    startDate,
    getValues(endDateField as keyof IProjectForm) as string,
    endDateField,
    t,
  );

export const validateAfter = (
  endDate: string | null,
  startDateField: string,
  getValues: UseFormGetValues<IProjectForm>,
  t: TFunction<'translation'>,
) =>
  validateDateIsAfter(
    endDate,
    getValues(startDateField as keyof IProjectForm) as string,
    startDateField,
    t,
  );

export const validateSameOrAfter = (
  endDate: string | null,
  startDateField: string,
  getValues: UseFormGetValues<IProjectForm>,
  t: TFunction<'translation'>,
) =>
  validateDateIsSameOrAfter(
    endDate,
    getValues(startDateField as keyof IProjectForm) as string,
    startDateField,
    t,
  );

/**
 * The set of project schedule dates that have order rules between them (planning,
 * presence, visibility and construction). Keyed by canonical names so the same rules
 * can be reused by forms that name their fields differently (e.g. ProjectForm's
 * `estPlanningStart` vs MyWorkloadEditDialog's `planningStart`).
 */
export interface IScheduleDates {
  planningStart: string | null;
  planningEnd: string | null;
  presenceStart: string | null;
  presenceEnd: string | null;
  visibilityStart: string | null;
  visibilityEnd: string | null;
  constructionStart: string | null;
  constructionEnd: string | null;
}

export type ScheduleDateField = keyof IScheduleDates;

/**
 * Cross-field date order validation shared by ProjectForm's schedule section and MyWorkloadEditDialog.
 */
export const validateScheduleDateOrder = (
  field: ScheduleDateField,
  value: string | null,
  dates: IScheduleDates,
  t: TFunction<'translation'>,
): string | true => {
  switch (field) {
    case 'planningStart':
      return validateDateIsBefore(value, dates.planningEnd, 'estPlanningEnd', t);

    case 'planningEnd': {
      const afterPlanningStart = validateDateIsAfter(
        value,
        dates.planningStart,
        'estPlanningStart',
        t,
      );
      if (afterPlanningStart !== true) {
        return afterPlanningStart;
      }
      return validateDateIsBefore(value, dates.constructionStart, 'estConstructionStart', t);
    }

    case 'presenceStart': {
      const beforePresenceEnd = validateDateIsBefore(value, dates.presenceEnd, 'presenceEnd', t);
      if (beforePresenceEnd !== true) {
        return beforePresenceEnd;
      }
      const afterPlanningStart = validateDateIsAfter(
        value,
        dates.planningStart,
        'estPlanningStart',
        t,
      );
      if (afterPlanningStart !== true) {
        return afterPlanningStart;
      }
      return validateDateIsBefore(value, dates.planningEnd, 'estPlanningEnd', t);
    }

    case 'presenceEnd': {
      const afterPresenceStart = validateDateIsAfter(
        value,
        dates.presenceStart,
        'presenceStart',
        t,
      );
      if (afterPresenceStart !== true) {
        return afterPresenceStart;
      }
      return validateDateIsBefore(value, dates.planningEnd, 'estPlanningEnd', t);
    }

    case 'visibilityStart': {
      const beforeVisibilityEnd = validateDateIsBefore(
        value,
        dates.visibilityEnd,
        'visibilityEnd',
        t,
      );
      if (beforeVisibilityEnd !== true) {
        return beforeVisibilityEnd;
      }
      return validateDateIsAfter(value, dates.planningStart, 'estPlanningStart', t);
    }

    case 'visibilityEnd': {
      const afterVisibilityStart = validateDateIsAfter(
        value,
        dates.visibilityStart,
        'visibilityStart',
        t,
      );
      if (afterVisibilityStart !== true) {
        return afterVisibilityStart;
      }
      return validateDateIsBefore(value, dates.planningEnd, 'estPlanningEnd', t);
    }

    case 'constructionStart': {
      const afterPlanningEnd = validateDateIsAfter(value, dates.planningEnd, 'estPlanningEnd', t);
      if (afterPlanningEnd !== true) {
        return afterPlanningEnd;
      }
      return validateDateIsBefore(value, dates.constructionEnd, 'estConstructionEnd', t);
    }

    case 'constructionEnd':
      return validateDateIsAfter(value, dates.constructionStart, 'estConstructionStart', t);

    default:
      return true;
  }
};

export const getFieldsIfEmpty = (
  fields: Array<string>,
  getValues: UseFormGetValues<IProjectForm>,
) =>
  fields.filter((f) => {
    if (_.has(getValues(f as keyof IProjectForm), 'value')) {
      return !(getValues(f as keyof IProjectForm) as IOption).value;
    } else {
      return !getValues(f as keyof IProjectForm);
    }
  });

/**
 * Looks through a given error object's errors list for a given attribute
 * and returns a translated error text if that attribute if found within the errors list.
 *
 * @param attribute an attribute/key to look for in the errors
 * @param error an IError object
 * @param translate
 * @returns
 */
export const getErrorText = (
  attribute: string,
  error: IError,
  translate: TFunction<'translation', undefined>,
) => {
  if (error?.errors && error?.errors?.length > 0) {
    for (const e of error.errors) {
      if (e.attr === attribute) {
        return translate(`error.${e.code}`);
      }
    }
  } else {
    return '';
  }
};

/**
 *  Input is disabled based on user roles:
 * - if the user is a project planner then all fields can be edited if the masterClass is 808,
 * otherwise the given fields will be disabled
 * - if the user is a project manager then all the given fields will be disabled
 */
export const canUserEditProjectFormField = (
  selectedMasterClassName: string,
  user: IUser | null,
) => {
  // If user is only project area planner then the form field will be disabled if
  // the master class is selected and not 8 08
  if (isUserOnlyProjectAreaPlanner(user)) {
    if (!selectedMasterClassName) {
      return false;
    }

    if (selectedMasterClassName?.startsWith('808') || selectedMasterClassName?.startsWith('8 08')) {
      return false;
    }

    return true;
  }

  // The form field is always disabled if the user is project manager
  return isUserOnlyProjectManager(user);
};
