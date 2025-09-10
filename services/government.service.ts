import type {
  ActiveSubsidy,
  KALIAApplicationData,
  KALIAEligibilityResult,
  KALIAScheme,
  ProcurementInfo,
  SamrudhaKrushakYojana,
  SubsidyCalculation,
} from '../types/government.types';

export class GovernmentSchemeService {
  async checkKALIAEligibility(farmerId: string): Promise<KALIAEligibilityResult> {
    try {
      // In a real implementation, this would call an external government API
      // For now, using mock data
      const mockResult: KALIAEligibilityResult = {
        isEligible: true,
        benefitAmount: 25000,
        category: 'Small & Marginal Farmer',
        requirements: ['Land ownership certificate', 'Bank account details', 'Aadhaar card'],
        applicationStatus: 'eligible'
      };



      return mockResult;
    } catch (error) {
      console.error('Error checking KALIA eligibility:', error);
      // Return mock data as fallback
      return {
        isEligible: true,
        benefitAmount: 25000,
        category: 'Small & Marginal Farmer',
        requirements: ['Land ownership certificate', 'Bank account details'],
        applicationStatus: 'eligible'
      };
    }
  }

  async applyForKALIA(applicationData: KALIAApplicationData): Promise<string> {
    try {
      // In a real implementation, this would submit to government portal
      const applicationId = `KALIA${Date.now()}`;



      return applicationId;
    } catch (error) {
      console.error('Error applying for KALIA:', error);
      // Return mock application ID
      return `KALIA${Date.now()}`;
    }
  }

  async getPaddyProcurementInfo(farmerId: string): Promise<ProcurementInfo> {
    try {
      // Mock procurement info - in real app, this would come from government API
      const mockInfo: ProcurementInfo = {
        currentMSP: 3100,
        registrationOpen: true,
        nearestCenter: 'Cuttack Procurement Center',
        availableSlots: [
          { date: '2025-10-15', timeSlot: '9:00 AM - 11:00 AM', available: true },
          { date: '2025-10-16', timeSlot: '2:00 PM - 4:00 PM', available: true }
        ],
        requiredDocuments: ['Land records', 'Aadhaar card', 'Bank passbook']
      };

      return mockInfo;
    } catch (error) {
      console.error('Error getting procurement info:', error);
      return {
        currentMSP: 3100,
        registrationOpen: true,
        nearestCenter: 'Cuttack Procurement Center',
        availableSlots: [
          { date: '2025-10-15', timeSlot: '9:00 AM - 11:00 AM', available: true },
          { date: '2025-10-16', timeSlot: '2:00 PM - 4:00 PM', available: true }
        ],
        requiredDocuments: ['Land records', 'Aadhaar card', 'Bank passbook']
      };
    }
  }

  async calculateSubsidy(equipmentType: string, cost: number): Promise<SubsidyCalculation> {
    const subsidyRates: Record<string, number> = {
      'tractor': 0.25,
      'harvester': 0.40,
      'irrigation_pump': 0.50,
      'seed_drill': 0.50,
      'thresher': 0.40
    };

    const subsidyPercentage = subsidyRates[equipmentType] || 0.25;
    const maxSubsidy = equipmentType === 'tractor' ? 200000 : 100000;
    const calculatedSubsidy = Math.min(cost * subsidyPercentage, maxSubsidy);

    return {
      equipmentCost: cost,
      subsidyPercentage: subsidyPercentage * 100,
      subsidyAmount: calculatedSubsidy,
      farmerContribution: cost - calculatedSubsidy,
      eligibleSchemes: this.getEligibleSchemes(equipmentType),
      applicationProcess: this.getApplicationSteps(equipmentType)
    };
  }

  async getActiveSubsidies(farmerId: string): Promise<ActiveSubsidy[]> {
    try {
      // Mock active subsidies
      return [
        {
          id: '1',
          equipmentType: 'tractor',
          maxBenefit: 50000,
          appliedAmount: 0,
          status: 'available'
        },
        {
          id: '2',
          equipmentType: 'irrigation_pump',
          maxBenefit: 25000,
          appliedAmount: 0,
          status: 'available'
        }
      ];
    } catch (error) {
      console.error('Error getting active subsidies:', error);
      return [];
    }
  }

  private getEligibleSchemes(equipmentType: string): string[] {
    const schemeMapping: Record<string, string[]> = {
      'tractor': ['SMAM Scheme', 'State Machinery Scheme'],
      'irrigation_pump': ['PMKSY', 'State Irrigation Scheme'],
      'harvester': ['Custom Hiring Center Scheme', 'SMAM Scheme']
    };
    return schemeMapping[equipmentType] || ['General Subsidy Scheme'];
  }

  private getApplicationSteps(equipmentType: string): string[] {
    return [
      'Visit nearest agricultural office',
      'Submit equipment quotation and documents',
      'Complete verification process',
      'Receive subsidy approval',
      'Purchase equipment from authorized dealer',
      'Claim subsidy reimbursement'
    ];
  }

  async getKALIAStatus(farmerId: string): Promise<KALIAScheme | null> {
    try {
      // Mock KALIA status - in real app, this would come from government database
      return {
        farmerId,
        benefitType: 'livelihood',
        totalAmount: 25000,
        disbursedAmount: 10000,
        pendingAmount: 15000,
        installments: [
          {
            id: '1',
            amount: 5000,
            dueDate: new Date('2024-12-01'),
            status: 'disbursed',
            disbursementDate: new Date('2024-11-15')
          },
          {
            id: '2',
            amount: 5000,
            dueDate: new Date('2025-01-01'),
            status: 'pending'
          }
        ],
        eligibilityStatus: 'eligible',
        applicationDate: new Date('2024-10-01'),
        lastDisbursement: new Date('2024-11-15')
      };
    } catch (error) {
      console.error('Error getting KALIA status:', error);
      return null;
    }
  }

  async getSamrudhaKrushakStatus(farmerId: string): Promise<SamrudhaKrushakYojana | null> {
    try {
      // Mock Samrudha Krushak status
      return {
        farmerId,
        registrationNumber: 'SK2024001',
        cropType: 'paddy',
        registeredQuantity: 1000,
        procurementCenter: 'Cuttack Procurement Center',
        mspRate: 3100,
        deliverySlots: [
          { date: '2025-10-15', timeSlot: '9:00 AM - 11:00 AM', available: true }
        ],
        payments: [
          {
            id: '1',
            amount: 310000,
            paymentDate: new Date('2025-10-20'),
            status: 'pending'
          }
        ],
        qualityGrade: 'A',
        status: 'registered'
      };
    } catch (error) {
      console.error('Error getting Samrudha Krushak status:', error);
      return null;
    }
  }
}

export const governmentSchemeService = new GovernmentSchemeService();
