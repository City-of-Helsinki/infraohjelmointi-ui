import { renderHook } from '@testing-library/react';
import useConstructionHandoverForm from './useConstructionHandoverForm';
import { IConstructionHandover } from '@/interfaces/constructionHandoverInterfaces';

describe('useConstructionHandoverForm', () => {
  it('sets default form values from construction handover data', () => {
    const constructionHandover = {
      id: 'handover-1',
      name: 'Testihanke',
      description: 'Peruskorjaus ja valaistuksen uusinta',
      constructionProcurementMethod: {
        id: '7eedb495-7d42-4511-b4bf-c54f3698d415',
        value: 'Yhteistoiminnalliset',
      },
      constructionStart: '2026-01-01',
      constructionEnd: '2028-09-30',
      otherTimelineNotes: '',
      personPlanning: {
        id: 'person-planning-1',
        firstName: 'Erkki',
        lastName: 'Esimerkki',
      },
      personFinancing: {
        id: 'person-programming-1',
        firstName: 'Matti',
        lastName: 'Mallikas',
      },
      project: 'project-123',
      status: 'DRAFT',
      linkDesignDrawings: null,
      linkCostAllocation: null,
      linkContractBoundaries: null,
      constructionProjectManager: null,
      totalCost: null,
    } as IConstructionHandover;

    const { result } = renderHook(() => useConstructionHandoverForm(constructionHandover));
    const values = result.current.getValues();

    expect(values).toEqual({
      id: 'handover-1',
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
      constructionHandoverFinancing: [],
      personPlanning: {
        label: 'Erkki Esimerkki',
        value: 'person-planning-1',
      },
      personFinancing: {
        label: 'Matti Mallikas',
        value: 'person-programming-1',
      },
      totalCost: '',
    });
  });

  it('keeps totalCost zero value formatted in form values', () => {
    const constructionHandover = {
      id: 'handover-2',
      name: 'Nollakustannus',
      description: '',
      constructionProcurementMethod: null,
      constructionStart: null,
      constructionEnd: null,
      otherTimelineNotes: '',
      personPlanning: null,
      personFinancing: null,
      project: 'project-123',
      status: 'DRAFT',
      linkDesignDrawings: null,
      linkCostAllocation: null,
      linkContractBoundaries: null,
      constructionProjectManager: null,
      totalCost: 0,
    } as unknown as IConstructionHandover;

    const { result } = renderHook(() => useConstructionHandoverForm(constructionHandover));

    expect(result.current.getValues().totalCost).toBe('0,00€');
  });
});
