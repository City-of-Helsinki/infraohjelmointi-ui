import { FreeSearchFormObject, IOption } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';

// Build a search parameter with all the choices from the search form
const buildSearchParams = (form: ISearchForm) => {
  const searchParams = [];
  for (const [key, value] of Object.entries(form)) {
    switch (key) {
      case 'masterClass':
      case 'classes':
      case 'subClass':
      case 'district':
      case 'division':
      case 'subDivision':
        value.forEach((v: IOption) => searchParams.push(`${key}=${v.value}`));
        break;
      case 'programmedYes':
        value && searchParams.push('programmed=true');
        break;
      case 'programmedNo':
        value && searchParams.push('programmed=false');
        break;
      case 'programmedYearMin':
      case 'programmedYearMax':
        value && searchParams.push(`${key}=${value}`);
        break;
      case 'phase':
      case 'personPlanning':
      case 'category':
        value.value && searchParams.push(`${key}=${value.value}`);
        break;
      case 'freeSearchParams':
        for (const [_, v] of Object.entries(value as FreeSearchFormObject)) {
          switch (v.type) {
            case 'groups':
              searchParams.push(`projectGroup=${v.value}`);
              break;
            case 'projects':
              searchParams.push(`project=${v.value}`);
              break;
            case 'hashtags':
              searchParams.push(`hashtag=${v.value}`);
              break;
          }
        }
        break;
      default:
        break;
    }
  }

  return searchParams.join('&');
};

export default buildSearchParams;
