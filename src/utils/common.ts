import { IClass } from '@/interfaces/classInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IAppForms, FormValueType } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { getYear, updateYear } from './dates';
import _ from 'lodash';
import { IProjectRequest } from '@/interfaces/projectInterfaces';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const removeDotsFromString = (value: string) => value.replace('.', '');

export const listItemToOption = (
  listItem: IListItem | undefined,
  translate?: TFunction<'translation'>,
): IOption => ({
  label:
    listItem?.value && translate
      ? translate(`enums.${removeDotsFromString(listItem?.value)}`)
      : listItem?.value ?? '',
  value: listItem?.id ?? '',
});

export const booleanToString = (
  boolVal: boolean | undefined,
  translate?: TFunction<'translation'>,
): string =>
  typeof boolVal === 'boolean' && translate ? translate(`enums.${boolVal.toString()}`) : 'Ei';

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

const syncProgrammedWithPhase = (
  request: IProjectRequest,
  form: IAppForms,
  phases?: Array<IOption>,
) => {
  const requestCopy = { ...request };

  const draftPhase = phases && phases[0].value;
  const programmedPhase = phases && phases[2].value;

  // We patch phase to 'Hanke-ehdotus' if user switch programmed off
  if (requestCopy.programmed === false && form.phase.value !== draftPhase) {
    request.phase = draftPhase;
  }
  // We patch phase to 'Ohjelmoitu' if user switch programmed on
  if (requestCopy.programmed === true && form.phase.value !== programmedPhase) {
    request.phase = programmedPhase;
  }
  // We patch programmed to true if user changes phase to 'Ohjelmoitu'
  if (requestCopy.phase === programmedPhase && !form.programmed) {
    request.programmed = true;
  }
  // We patch programmed to false if user changes phase to 'Hanke-ehdotus'
  if (requestCopy.phase === draftPhase && form.programmed) {
    request.programmed = false;
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
  phases?: Array<IOption>,
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
  syncProgrammedWithPhase(request, form, phases);

  return request;
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
