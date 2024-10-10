import { IClass, IClassFinances } from '@/interfaces/classInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IAppForms, FormValueType, IGroupForm } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { getYear, updateYear } from './dates';
import _ from 'lodash';
import { IProjectFinances, IProjectRequest } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const removeDotsFromString = (value: string) => value.replace('.', '');

export const formatNumberToContainSpaces = (number: number) => {
  return String(new Intl.NumberFormat('de-DE').format(number)).replace(/\./g, ' ');
};
export const listItemToOption = (listItem: IListItem | undefined): IOption => ({
  label: listItem?.value ?? '',
  value: listItem?.id ?? '',
});

export const listItemsToOption = (listItems: Array<IListItem>): Array<IOption> =>
  listItems.map((listItem) => ({
    label: listItem?.value ?? '',
    value: listItem?.id ?? '',
  }));

export const locationItemsToOptions = (locationList: ILocation[]): IOption[] =>
  locationList.map((locationItem) => ({
    label: locationItem?.name ?? '',
    value: locationItem?.id ?? '',
  }));

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

const getLocation = (list: ILocation[], locationName: string) => {
  const location = list.find(({ name }) => name.includes(locationName));
  return location;
};

const getLocationList = (
  list: ILocation[] | undefined,
  parentClassId?: string,
  projectClass?: string,
) => {
  let locationList: ILocation[] = [];
  // projectClass is given as a parameter when we want to get a list of districts filtered by project's subclass or class
  // The list of distrcits is always filtered by parentClass, which is the projects class or subclass the project belongs to
  if (projectClass && list) {
    locationList = list.filter(({ parentClass }) => parentClass === projectClass);
  }
  // parentClassId is given as a parameter when we want to get a list of divisions or sub divisions filtered based on the
  // district or division id as divisions or sub divisions parent id
  else if (parentClassId && list) {
    locationList = list.filter(({ parent }) => parent === parentClassId);
  }
  return locationList;
};

const canGetNextLevel = (
  currentLevelId: string | undefined,
  previousLevelLocation: ILocation | undefined,
  nextLevelLocationList: ILocation[] | undefined,
): boolean => {
  if (currentLevelId && previousLevelLocation && nextLevelLocationList) {
    return true;
  }
  return false;
};

const getLowestLocationId = (
  hierarchyDistricts: ILocation[] | undefined,
  hierarchyDivisions: ILocation[] | undefined,
  hierarchySubDivisions: ILocation[] | undefined,
  form: IAppForms,
) => {
  let lowestLocationId: string | undefined;
  if (hierarchyDistricts) {
    const districts = getLocationList(hierarchyDistricts, undefined, form.subClass.value);
    const district = getLocation(districts, form.district.label);
    lowestLocationId = district?.id;
    if (canGetNextLevel(form.division.value, district, hierarchyDivisions)) {
      const divisions = getLocationList(hierarchyDivisions, district?.id);
      const division = getLocation(divisions, form.division.label);
      lowestLocationId = division?.id ?? district?.id;
      if (canGetNextLevel(form.subDivision.value, division, hierarchySubDivisions)) {
        const subDivisions = getLocationList(hierarchySubDivisions, division?.id);
        const subDivision = getLocation(subDivisions, form.subDivision.label);
        lowestLocationId = subDivision?.id ?? division?.id;
      }
    }
  }
  return lowestLocationId;
};

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

const getKey = (key: string) => {
  if (compareKeyToValues(key, ['masterClass', 'class', 'subClass'])) {
    return 'projectClass';
  } else if (compareKeyToValues(key, ['district', 'division', 'subDivision'])) {
    return 'projectDistrict';
  } else {
    return key;
  }
};

const compareKeyToValues = (key: string, values: string[]): boolean => {
  return values.includes(key);
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
  hierarchyDistricts?: ILocation[],
  hierarchyDivisions?: ILocation[],
  hierarchySubDivisions?: ILocation[],
) => {
  const request: IProjectRequest = {};

  for (const key in dirtyFields) {
    const parsedValue = parseValue(form[key as keyof IAppForms]);
    const convertedKey = getKey(key);
    const assignValueToKey = (key: string, value: any) => {
      if (value !== undefined) {
        request[key as keyof IAppForms] = value;
      }
    };

    if (compareKeyToValues(key, ['district', 'division', 'subDivision']) && parsedValue) {
      _.assign(request, {
        projectLocation: getLowestLocationId(
          hierarchyDistricts,
          hierarchyDivisions,
          hierarchySubDivisions,
          form,
        ),
      });
    }

    // if subDivision or division is removed, we need to set projectDistrict to be the new lowest
    // selected location class (e.g. if subDivision is removed, new lowest selected would be division)
    switch (true) {
      case !parsedValue && compareKeyToValues(key, ['subDivision']):
        assignValueToKey(convertedKey, parseValue(form['division' as keyof IAppForms]));
        break;
      case !parsedValue && compareKeyToValues(key, ['division']):
        assignValueToKey(convertedKey, parseValue(form['district' as keyof IAppForms]));
        break;
      default:
        assignValueToKey(convertedKey, parsedValue);

        if (compareKeyToValues(key, ['district']) && hierarchyDistricts) {
          const subClass = parseValue(form['subClass' as keyof IAppForms]);
          const projectClass = parseValue(form['class' as keyof IAppForms]);
          assignValueToKey('projectClass', subClass ?? projectClass);
        }
    }
  }

  return request;
};

export const getLocationRelationId = (
  form: IGroupForm,
  hierarchyDistricts: ILocation[],
  hierarchyDivisions: ILocation[],
) => {
  const relatedDistricts = hierarchyDistricts.filter(({ parentClass }) =>
    parentClass === form.subClass.value ? true : parentClass === form.class.value,
  );
  if (form.district.label) {
    const relatedDistrict = relatedDistricts.find(({ name }) => name.includes(form.district.label));
    if (form.division.label && relatedDistrict) {
      const relatedDivisions = hierarchyDivisions.filter(
        ({ parent }) => parent === relatedDistrict.id,
      );
      const relatedDivision = relatedDivisions.find(({ name }) =>
        name.includes(form.division.label),
      );
      if (relatedDivision) {
        return relatedDivision.id;
      }
      return relatedDistrict.id;
    } else if (relatedDistrict) {
      return relatedDistrict.id;
    }
  }
  return '';
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

const isWithinYearRange = (yearIndex: number) => yearIndex >= 0 && yearIndex <= 10;

/**
 * This function is used to set the finance data from a project-update event to correct years to state. It's needed
 * because the startYear of the finance data from the update event is different than what the user has selected
 * when another user has modified project budgets after moving the timeline and triggers the update event. The function
 * loops through 10 finance years, cause currently the backend returns 10 years of finance data at a time.
 *
 * @param financesFromState finance data that already exists in the state and that needs to be modified
 * @param financesFromUpdateEvent finance data from the update event that is used to update the data in state
 * @param startYear the start year of the timeline that the user has selected
 * @returns an IProjectFinances object with the updated finance data
 */
export const syncUpdatedProjectFinancesWithStartYear = (
  financesFromState: IProjectFinances,
  financesFromUpdateEvent: IProjectFinances,
  startYear: number,
) => {
  let convertedFinances: IProjectFinances = {
    ...financesFromState,
    year: startYear,
  };

  const yearDifference = financesFromUpdateEvent.year - startYear;
  const convertToFinanceKey = (yearIndex: number) =>
    yearIndex <= 3
      ? (('budgetProposalCurrentYearPlus' + yearIndex) as keyof IProjectFinances)
      : (('preliminaryCurrentYearPlus' + yearIndex) as keyof IProjectFinances);

  for (let financeYearIndex = 0; financeYearIndex <= 10; financeYearIndex++) {
    const adjustedFinanceYearIndex = financeYearIndex + yearDifference;
    if (isWithinYearRange(adjustedFinanceYearIndex)) {
      const sourceFinanceYearKey = convertToFinanceKey(financeYearIndex);
      const destinationFinanceYearKey = convertToFinanceKey(adjustedFinanceYearIndex);
      convertedFinances = {
        ...convertedFinances,
        [destinationFinanceYearKey]: financesFromUpdateEvent[sourceFinanceYearKey],
      };
    }
  }
  return convertedFinances;
};

/**
 * This function is used to set the finance data from a finance-update event to correct years to state. It's needed
 * because the startYear of the finance data from the update event is different than what the user has selected
 * when another user has modified project or class or group budgets after moving the timeline and triggers the update event.
 * The function loops through 10 finance years, cause currently the backend returns 10 years of finance data at a time.
 *
 * @param financesFromState finance data that already exists in the state and that needs to be modified
 * @param financesFromUpdateEvent finance data from the update event that is used to update the data in state
 * @param startYear the start year of the timeline that the user has selected
 * @returns an IClassFinances object with the updated finance data
 */
export const syncUpdatedClassFinancesWithStartYear = (
  financesFromState: IClassFinances,
  financesFromUpdateEvent: IClassFinances,
  startYear: number,
) => {
  let convertedFinances: IClassFinances = {
    ...financesFromState,
    year: startYear,
    budgetOverrunAmount: financesFromUpdateEvent.budgetOverrunAmount,
    projectBudgets: financesFromUpdateEvent.projectBudgets,
  };

  const yearDifference = startYear - financesFromState.year;
  const convertToFinanceKey = (yearIndex: number) => ('year' + yearIndex) as keyof IClassFinances;

  for (let financeYearIndex = 0; financeYearIndex <= 10; financeYearIndex++) {
    const adjustedFinanceYearIndex = financeYearIndex + yearDifference;
    if (isWithinYearRange(adjustedFinanceYearIndex)) {
      const sourceFinanceYearKey = convertToFinanceKey(financeYearIndex);
      const destinationFinanceYearKey = convertToFinanceKey(adjustedFinanceYearIndex);
      convertedFinances = {
        ...convertedFinances,
        [destinationFinanceYearKey]: financesFromUpdateEvent[sourceFinanceYearKey],
      };
    }
  }

  return convertedFinances;
};

export const getLocationParent = (locationList: IListItem[], locationId: string | undefined) => {
  return locationList.find((location) => location.id === locationId)?.parent;
};

export const enum IconKey {
  Proposal = 'proposal',
  Design = 'design',
  Programming = 'programming',
  DraftInitiation = 'draftInitiation',
  DraftApproval = 'draftApproval',
  ConstructionPlan = 'constructionPlan',
  ConstructionWait = 'constructionWait',
  Construction = 'construction',
  WarrantyPeriod = 'warrantyPeriod',
  Completed = 'completed',
  Location = 'location',
  Person = 'person',
}

export const mapIconKey = (type: string): IconKey => {
  switch (type) {
    case 'proposal':
    case 'Hanke-ehdotus':
      return IconKey.Proposal;
    case 'design':
    case 'Yleissuunnittelu':
      return IconKey.Design;
    case 'programming':
    case 'Ohjelmointi':
      return IconKey.Programming;
    case 'draftInitiation':
    case 'Katu- ja puistosuunnittelun aloitus/suunnitelmaluonnos':
      return IconKey.DraftInitiation;
    case 'draftApproval':
    case 'Katu-/puistosuunnitelmaehdotus ja hyväksyminen':
      return IconKey.DraftApproval;
    case 'constructionPlan':
    case 'Rakennussuunnitelma':
      return IconKey.ConstructionPlan;
    case 'constructionWait':
    case 'Odottaa rakentamista':
      return IconKey.ConstructionWait;
    case 'construction':
    case 'Rakentaminen':
      return IconKey.Construction;
    case 'warrantyPeriod':
    case 'Takuuaika':
      return IconKey.WarrantyPeriod;
    case 'completed':
    case 'Valmis / ylläpidossa':
      return IconKey.Completed;
    default:
      return IconKey.Programming;
  }
};
