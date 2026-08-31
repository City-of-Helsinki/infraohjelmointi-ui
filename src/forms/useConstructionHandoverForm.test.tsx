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
      staraProcurementReason: {
        id: '8eedb495-7d42-4511-b4bf-c54f3698d415',
        value: 'urgentWork',
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
      staraProcurementReason: {
        label: 'urgentWork',
        value: '8eedb495-7d42-4511-b4bf-c54f3698d415',
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

  it('maps totalCost zero value as formatted currency in form values', () => {
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

  it('maps numeric totalCost as formatted currency in form values', () => {
    const constructionHandover = {
      id: 'handover-3',
      name: 'Kustannusarvio',
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
      totalCost: 1234567.89,
    } as unknown as IConstructionHandover;

    const { result } = renderHook(() => useConstructionHandoverForm(constructionHandover));

    expect(result.current.getValues().totalCost).toBe('1 234 567,89€');
  });

  it('maps financing budgets from backend with null, zero and number values', () => {
    const constructionHandover = {
      id: 'handover-4',
      name: 'Rahoitusrivit',
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
      totalCost: null,
      constructionHandoverFinancing: [
        {
          id: 'fin-1',
          financingParty: 'OTHER',
          description: 'No budget',
          budgetItem: null,
          projectNumber: 'HEL-1',
          budget: null,
        },
        {
          id: 'fin-2',
          financingParty: 'OTHER',
          description: 'Zero budget',
          budgetItem: null,
          projectNumber: 'HEL-2',
          budget: 0,
        },
        {
          id: 'fin-3',
          financingParty: 'OTHER',
          description: 'Numeric budget',
          budgetItem: null,
          projectNumber: 'HEL-3',
          budget: 1000.5,
        },
      ],
    } as unknown as IConstructionHandover;

    const { result } = renderHook(() => useConstructionHandoverForm(constructionHandover));

    expect(result.current.getValues().constructionHandoverFinancing).toEqual([
      expect.objectContaining({ budget: '' }),
      expect.objectContaining({ budget: '0,00€' }),
      expect.objectContaining({ budget: '1 000,50€' }),
    ]);
  });
});
