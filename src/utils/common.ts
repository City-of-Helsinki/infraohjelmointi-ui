import { IClass } from '@/interfaces/classInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IAppForms, FormValueType } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { getYear, updateYear } from './dates';
import _ from 'lodash';
import {
  IProject,
  IProjectEstDates,
  IProjectFinances,
  IProjectRequest,
} from '@/interfaces/projectInterfaces';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const removeDotsFromString = (value: string) => value.replace('.', '');

export const listItemToOption = (listItem: IListItem | undefined): IOption => ({
  label: listItem?.value ?? '',
  value: listItem?.id ?? '',
});

export const booleanToString = (
  boolVal: boolean | undefined,
  translate?: TFunction<'translation'>,
): string =>
  typeof boolVal === 'boolean' && translate ? translate(`option.${boolVal.toString()}`) : 'Ei';

export const isOptionEmpty = (option: IOption) => !option.value;
/**
 * Converts all empty string values from a form to null values. Useful when submitting forms,
 * since controlled forms always need to have a value as an empty string instead of null or undefined.
 */
export const emptyStringsToNull = (formData: IAppForms) => {
  const transformedFields = Object.keys(formData)
    .filter((field) => typeof formData[field as keyof IAppForms] === 'string')
    .reduce((accumulator, current) => {
      const key = current as keyof IAppForms;
      return { ...accumulator, [current]: formData[key] ?? null };
    }, {});

  return { ...formData, ...transformedFields };
};

export const getOptionId = (option: IOption) => option.value || null;

export const isOption = (obj: object) => _.has(obj, 'label') && _.has(obj, 'value');

/**
 * Make sure the projects planning dates are in sync with the planningStartYear
 */
const syncPlanningDates = (request: IProjectRequest, form: IAppForms) => {
  const requestCopy = { ...request };

  if (form.estPlanningStart) {
    if (_.has(requestCopy, 'estPlanningStart')) {
      request.planningStartYear = getYear(form.estPlanningStart);
    }

    if (
      _.has(requestCopy, 'planningStartYear') &&
      form.planningStartYear &&
      parseInt(form.planningStartYear)
    ) {
      request.estPlanningStart = updateYear(
        parseInt(form.planningStartYear),
        form.estPlanningStart,
      );
    }
  }
};

/**
 * Make sure the projects construction dates are in sync with the constructionEndYear
 */
const syncConstructionDates = (request: IProjectRequest, form: IAppForms) => {
  const requestCopy = { ...request };

  if (form.estConstructionEnd) {
    if (_.has(requestCopy, 'estConstructionEnd')) {
      request.constructionEndYear = getYear(form.estConstructionEnd);
    }
    if (
      _.has(requestCopy, 'constructionEndYear') &&
      form.constructionEndYear &&
      parseInt(form.constructionEndYear)
    ) {
      request.estConstructionEnd = updateYear(
        parseInt(form.constructionEndYear),
        form.estConstructionEnd,
      );
    }
  }
};

/**
 *
 * @param dirtyFields dirtyFields from react-hook-forms
 * @param form form object
 * @returns data object that can be used for a patch request
 */
export const dirtyFieldsToRequestObject = (
  dirtyFields: object,
  form: IAppForms,
  project: IProject | null,
) => {
  const request: IProjectRequest = {};
  const parseValue = (value: FormValueType) => {
    switch (true) {
      case value instanceof Object && isOption(value):
        return getOptionId(value as IOption);
      case value === '':
        return null;
      default:
        return value;
    }
  };

  for (const key in dirtyFields) {
    const getKey = () => {
      if (['masterClass', 'class', 'subClass'].includes(key)) {
        return 'projectClass';
      } else if (['district', 'division', 'subDivision'].includes(key)) {
        return 'projectLocation';
      } else {
        return key;
      }
    };

    _.assign(request, { [getKey()]: parseValue(form[key as keyof IAppForms]) });
  }

  // Remove the project location when the class is patched since the relation changes
  if (_.has(request, 'projectClass')) {
    _.assign(request, { projectLocation: null });
  }

  syncPlanningDates(request, form);
  syncConstructionDates(request, form);
  syncFinances(request, project);

  return request;
};

/**
 * Make sure the finances are moved to correct years if dates are changed
 * @param project IProject being updated
 * @param data IProjectRequest object with data to be patched
 */
export const syncFinances = (request: IProjectRequest, project: IProject | null) => {
  if (!project?.finances) {
    return;
  }

  const adjustBudgets = (
    budgetObject: IProjectFinances,
    estProjectDates: IProjectEstDates,
  ): IProjectFinances => {
    /**
     * Moves the provided finance value to its new finance location and sets current to null
     * @param newFieldYear year for the new finance field which needs to be updated
     * @param financeValue value which will be summed in the new year
     * @param currentFinanceFieldName finance field name which the value belongs to
     */
    const updateFinanceValue = (
      newFieldYear: number,
      financeValue: number,
      currentFinanceFieldName: keyof IProjectFinances,
    ) => {
      const newFinanceFieldName = yearToBudgetKey[newFieldYear - adjustedBudgetObject.year];
      (adjustedBudgetObject[newFinanceFieldName] as string) = String(
        safeParseInt(adjustedBudgetObject[newFinanceFieldName]) + financeValue,
      );
      (adjustedBudgetObject[currentFinanceFieldName] as null) = null;
    };
    // Year number to finance field name mapping
    const yearToBudgetKey: { [key: number]: keyof IProjectFinances } = {
      0: 'budgetProposalCurrentYearPlus0',
      1: 'budgetProposalCurrentYearPlus1',
      2: 'budgetProposalCurrentYearPlus2',
      3: 'preliminaryCurrentYearPlus3',
      4: 'preliminaryCurrentYearPlus4',
      5: 'preliminaryCurrentYearPlus5',
      6: 'preliminaryCurrentYearPlus6',
      7: 'preliminaryCurrentYearPlus7',
      8: 'preliminaryCurrentYearPlus8',
      9: 'preliminaryCurrentYearPlus9',
      10: 'preliminaryCurrentYearPlus10',
    };
    const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd } =
      estProjectDates;
    const planningStartYear = estPlanningStart ? getYear(estPlanningStart) : null;
    const planningEndYear = estPlanningEnd ? getYear(estPlanningEnd) : null;
    const constructionStartYear = estConstructionStart ? getYear(estConstructionStart) : null;
    const constructionEndYear = estConstructionEnd ? getYear(estConstructionEnd) : null;

    const adjustedBudgetObject: IProjectFinances = {
      ...budgetObject,
    };
    // looping over all budgetfields in the project
    let fieldName: keyof IProjectFinances;
    for (fieldName in adjustedBudgetObject) {
      if (fieldName !== 'year') {
        // current budget field year, extract from field name
        const fieldYear = adjustedBudgetObject.year + parseInt(fieldName.match(/\d+/)?.[0] || '0');

        // current budget field value
        const fieldValue = safeParseInt(adjustedBudgetObject[fieldName as keyof IProjectFinances]);

        if (fieldValue) {
          // value exists before the planning timeline starts
          if (planningStartYear && fieldYear < planningStartYear) {
            updateFinanceValue(planningStartYear, fieldValue, fieldName);
          }
          // value exists after planning timeline ends
          else if (planningEndYear && fieldYear > planningEndYear && project?.estPlanningEnd) {
            const oldPlanningEndYear = getYear(project.estPlanningEnd);
            // Check if current finance field used to be in the planning phase timeline
            if (oldPlanningEndYear >= fieldYear) {
              updateFinanceValue(planningEndYear, fieldValue, fieldName);
            }
          }
          // value exists before construction timeline begins
          else if (
            constructionStartYear &&
            fieldYear < constructionStartYear &&
            project?.estConstructionStart
          ) {
            const oldConstructionStartYear = getYear(project.estConstructionStart);
            // Check if current finance field used to be in the construction phase timeline
            if (oldConstructionStartYear <= fieldYear) {
              updateFinanceValue(constructionStartYear, fieldValue, fieldName);
            }
          }
          // value exists after the construction timeline ends
          else if (constructionEndYear !== null && fieldYear > constructionEndYear) {
            updateFinanceValue(constructionEndYear, fieldValue, fieldName);
          } else {
            (adjustedBudgetObject[fieldName] as string) = String(fieldValue);
          }
        }
      }
    }

    return adjustedBudgetObject;
  };

  const projectTimelineYears = {
    estPlanningStart: request.estPlanningStart ? request.estPlanningStart : null,
    estPlanningEnd: request.estPlanningEnd ? request.estPlanningEnd : null,
    estConstructionStart: request.estConstructionStart ? request.estConstructionStart : null,
    estConstructionEnd: request.estConstructionEnd ? request.estConstructionEnd : null,
  };

  request.finances = { ...adjustBudgets(project.finances, projectTimelineYears) };
};

/**
 * Helper function to safely convert strings to numbers
 * @param value to be converted to a number
 * @returns value converted to number from string
 */
export const safeParseInt = (value: string | number | null): number => {
  if (value === null) return 0;
  return typeof value === 'string' ? parseInt(value, 10) : value;
};
export const setProgrammedYears = () => {
  const currentYear = new Date().getFullYear();
  const years: Array<IListItem> = [];

  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push({ id: i.toString(), value: i.toString() });
  }
  return years;
};

export const arrayHasValue = (arr: Array<unknown> | undefined, value: string) =>
  arr && arr.indexOf(value) !== -1;

export const classesToListItems = (classes: Array<IClass>): Array<IListItem> =>
  classes.map((mc) => ({
    id: mc.id,
    value: mc.name,
  }));

export const classesToOptions = (classes: Array<IClass>): Array<IOption> =>
  classes.map((mc) => ({
    value: mc.id,
    label: mc.name,
  }));

export const setHoveredClassToMonth = (month: string) => {
  const elementsForHoveredMonth = document.getElementsByClassName(`hoverable-${month}`);

  if (elementsForHoveredMonth.length > 0) {
    Array.from(elementsForHoveredMonth).forEach((element) => {
      element.classList.add('hovered');
    });
  }
};

export const removeHoveredClassFromMonth = (month: string) => {
  const elementsForHoveredMonth = document.getElementsByClassName(`hoverable-${month}`);
  if (elementsForHoveredMonth.length > 0) {
    Array.from(elementsForHoveredMonth).forEach((element) => {
      element.classList.remove('hovered');
    });
  }
};
