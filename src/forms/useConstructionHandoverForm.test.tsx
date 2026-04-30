import { renderHook } from '@testing-library/react';
import useConstructionHandoverForm from './useConstructionHandoverForm';
import { IProject } from '@/interfaces/projectInterfaces';

describe('useConstructionHandoverForm', () => {
  it('sets default form values from project data', () => {
    const project = {
      name: 'Testihanke',
      description: 'Peruskorjaus ja valaistuksen uusinta',
      constructionProcurementMethod: {
        id: '7eedb495-7d42-4511-b4bf-c54f3698d415',
        value: 'Yhteistoiminnalliset',
      },
      estConstructionStart: '01.01.2026',
      estConstructionEnd: '30.09.2028',
      personPlanning: {
        id: 'person-planning-1',
        firstName: 'Erkki',
        lastName: 'Esimerkki',
      },
      personProgramming: {
        id: 'person-programming-1',
        firstName: 'Matti',
        lastName: 'Mallikas',
      },
    } as IProject;

    const { result } = renderHook(() => useConstructionHandoverForm(project));
    const values = result.current.getValues();

    expect(values).toEqual({
      name: 'Testihanke',
      description: 'Peruskorjaus ja valaistuksen uusinta',
      constructionProcurementMethod: {
        label: 'Yhteistoiminnalliset',
        value: '7eedb495-7d42-4511-b4bf-c54f3698d415',
        selected: false,
        isGroupLabel: false,
        visible: true,
        disabled: false,
      },
      constructionStart: '01.01.2026',
      constructionEnd: '30.09.2028',
      otherTimelineNotes: '',
      personPlanning: {
        label: 'Erkki Esimerkki',
        value: 'person-planning-1',
      },
      personFinancing: {
        label: 'Matti Mallikas',
        value: 'person-programming-1',
      },
    });
  });
});
