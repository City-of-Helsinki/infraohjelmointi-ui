import mockI18next from '@/mocks/mockI18next';
import ProjectTalpaForm, { mapTalpaFormToRequest } from './ProjectTalpaForm';
import { BudgetItemNumber } from './budgetItemNumber';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import {
  ITalpaProjectOpening,
  TalpaPriority,
  TalpaReadiness,
  TalpaSubject,
} from '@/interfaces/talpaInterfaces';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import mockTalpaProject from '@/mocks/mockTalpaProject';
import { saveAs } from 'file-saver';
import {
  downloadExcel,
  getTalpaProjectOpeningByProject,
  patchTalpaProjectOpening,
  postTalpaProjectOpening,
} from '@/services/talpaServices';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('@/services/talpaServices', () => ({
  downloadExcel: jest.fn(),
  getTalpaProjectOpeningByProject: jest.fn(),
  patchTalpaProjectOpening: jest.fn(),
  postTalpaProjectOpening: jest.fn(),
  markTalpaProjectAsSent: jest.fn(),
}));

jest.mock('react-i18next', () => mockI18next());

const downloadExcelMock = downloadExcel as jest.MockedFunction<typeof downloadExcel>;
const patchTalpaProjectOpeningMock = patchTalpaProjectOpening as jest.MockedFunction<
  typeof patchTalpaProjectOpening
>;
const postTalpaProjectOpeningMock = postTalpaProjectOpening as jest.MockedFunction<
  typeof postTalpaProjectOpening
>;
const getTalpaProjectOpeningByProjectMock = getTalpaProjectOpeningByProject as jest.MockedFunction<
  typeof getTalpaProjectOpeningByProject
>;
const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>;

async function render(talpaProjectOverrides: Partial<ITalpaProjectOpening> = {}) {
  return await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectTalpaForm />} />, {
      preloadedState: {
        talpa: {
          talpaProject: { ...mockTalpaProject, ...talpaProjectOverrides },
          error: null,
        },
      },
    }),
  );
}

describe('talpa form', () => {
  describe('map talpa form data to request', () => {
    it('maps a creation request for a pre-construction project', () => {
      const templateOption: IOption = { label: 'Template Option', value: 'template-1' };

      const formData: IProjectTalpaForm = {
        budgetItemNumber: BudgetItemNumber.PreConstruction,
        budgetAccount: '8 03 01 01 Uudisrakentaminen',
        projectNumberRange: { label: 'Range Label', value: 'range-1' },
        templateProject: templateOption,
        projectType: { label: 'Type', value: 'type-1' },
        priority: { label: 'Priority', value: 'project-type-id' },
        projectName: 'Talpa Demo',
        projectStart: '01.12.2025',
        projectEnd: '31.12.2025',
        streetAddress: 'Testikatu 1',
        postalCode: '00100',
        responsiblePerson: 'Jane Doe',
        responsiblePersonEmail: 'jane@example.com',
        serviceClass: { label: 'SC 01', value: 'service-1' },
        assetClass: { label: 'Asset / class', value: 'asset-1' },
        profileName: 'Profile A',
        holdingTime: 12,
        investmentProfile: 'Infra',
        readiness: TalpaReadiness.Kesken,
      };

      const request = mapTalpaFormToRequest(formData, 'create', 'project-1');

      expect(request).toEqual({
        subject: TalpaSubject.Uusi,
        budgetAccount: '8 03 01 01 Uudisrakentaminen',
        projectNumberRangeId: 'range-1',
        templateProject: 'Template Option',
        projectTypeId: 'project-type-id',
        priority: TalpaPriority.Normaali,
        projectName: 'Talpa Demo',
        projectStart: '2025-12-01',
        projectEnd: '2025-12-31',
        streetAddress: 'Testikatu 1',
        postalCode: '00100',
        responsiblePerson: 'Jane Doe',
        responsiblePersonEmail: 'jane@example.com',
        serviceClassId: 'service-1',
        assetClassId: 'asset-1',
        profileName: 'Profile A',
        holdingTime: '12',
        investmentProfile: 'Infra',
        readiness: TalpaReadiness.Kesken,
        project: 'project-1',
      });
    });

    it('maps an update request and falls back to defaults when values are missing', () => {
      const formData: IProjectTalpaForm = {
        id: 'talpa-123',
        budgetItemNumber: BudgetItemNumber.InfraInvestment,
        budgetAccount: '',
        projectNumberRange: null,
        templateProject: 'Infra Template',
        projectType: null,
        priority: null,
        projectName: '',
        projectStart: '2025-05-01T00:00:00Z',
        projectEnd: null,
        streetAddress: '',
        postalCode: '',
        responsiblePerson: '',
        responsiblePersonEmail: '',
        serviceClass: null,
        assetClass: null,
        profileName: '',
        holdingTime: null,
        investmentProfile: '',
        readiness: TalpaReadiness.Valmis,
      };

      const request = mapTalpaFormToRequest(formData, 'update', 'project-2');

      expect(request).toEqual({
        subject: TalpaSubject.Muutos,
        budgetAccount: '',
        projectNumberRangeId: '',
        templateProject: 'Infra Template',
        projectTypeId: '',
        priority: TalpaPriority.Normaali,
        projectName: '',
        projectStart: '2025-05-01',
        projectEnd: null,
        streetAddress: '',
        postalCode: '',
        responsiblePerson: '',
        responsiblePersonEmail: '',
        serviceClassId: '',
        assetClassId: '',
        profileName: '',
        holdingTime: '',
        investmentProfile: '',
        readiness: TalpaReadiness.Valmis,
        project: 'project-2',
      });
    });
  });

  describe('talpa project locked', () => {
    it('should disable fields when talpa project is locked', async () => {
      await render({ isLocked: true });

      expect(screen.getByRole('radio', { name: /infraInvestment/i })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /preConstruction/i })).toBeDisabled();

      expect(screen.getByText('projectTalpaForm.projectSentText')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /budgetAccount/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /projectNumberRange/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('textbox', { name: /templateProject/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /projectType/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('button', { name: /priority/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('textbox', { name: /projectName/i })).toBeDisabled();

      expect(screen.getByRole('textbox', { name: /projectStart/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /projectEnd/i })).toBeDisabled();

      expect(screen.getByRole('textbox', { name: /streetAddress/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /postalCode/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /responsiblePerson(?!Email)/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /responsiblePersonEmail/i })).toBeDisabled();

      expect(screen.getByRole('combobox', { name: /serviceClass/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('combobox', { name: /assetClass/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('textbox', { name: /profileName/i })).toBeDisabled();
      expect(screen.getByRole('spinbutton', { name: /holdingTime/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /investmentProfile/i })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /readiness/i })).toBeDisabled();

      expect(screen.getByRole('button', { name: /saveInformation/i })).toBeDisabled();
    });
  });

  describe('submit form', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      getTalpaProjectOpeningByProjectMock.mockResolvedValue(mockTalpaProject);
      patchTalpaProjectOpeningMock.mockResolvedValue(mockTalpaProject);
      postTalpaProjectOpeningMock.mockResolvedValue(mockTalpaProject);
    });

    it('downloads talpa excel after updating an existing talpa project', async () => {
      const excelBlob = new Blob(['excel-content']);
      downloadExcelMock.mockResolvedValueOnce(excelBlob);

      const { user } = await render();
      await user.click(screen.getByRole('button', { name: 'saveInformation' }));

      await waitFor(() => {
        expect(downloadExcelMock).toHaveBeenCalledWith(mockTalpaProject.id);
        expect(saveAsMock).toHaveBeenCalledWith(excelBlob, 'projektin_avauslomake.xlsx');
      });
    });
  });
});
