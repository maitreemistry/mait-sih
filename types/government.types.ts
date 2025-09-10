export interface KALIAScheme {
  farmerId: string;
  benefitType: 'livelihood' | 'production' | 'vulnerable';
  totalAmount: number;
  disbursedAmount: number;
  pendingAmount: number;
  installments: KALIAInstallment[];
  eligibilityStatus: 'eligible' | 'not_eligible' | 'under_review';
  applicationDate: Date;
  lastDisbursement: Date;
}

export interface KALIAInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'disbursed' | 'overdue';
  disbursementDate?: Date;
}

export interface SamrudhaKrushakYojana {
  farmerId: string;
  registrationNumber: string;
  cropType: 'paddy' | 'wheat';
  registeredQuantity: number;
  procurementCenter: string;
  mspRate: number;
  deliverySlots: DeliverySlot[];
  payments: ProcurementPayment[];
  qualityGrade: string;
  status: 'registered' | 'delivered' | 'paid';
}

export interface DeliverySlot {
  date: string;
  timeSlot: string;
  available: boolean;
}

export interface ProcurementPayment {
  id: string;
  amount: number;
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface KALIAEligibilityResult {
  isEligible: boolean;
  benefitAmount: number;
  category: string;
  requirements: string[];
  applicationStatus: string;
}

export interface KALIAApplicationData {
  farmerId: string;
  category: string;
  documents: string[];
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface ProcurementInfo {
  currentMSP: number;
  registrationOpen: boolean;
  nearestCenter: string;
  availableSlots: DeliverySlot[];
  requiredDocuments: string[];
}

export interface SubsidyCalculation {
  equipmentCost: number;
  subsidyPercentage: number;
  subsidyAmount: number;
  farmerContribution: number;
  eligibleSchemes: string[];
  applicationProcess: string[];
}

export interface SchemeData {
  name: string;
  status: string;
  benefitAmount: number;
  nextAction: string;
  icon: string;
}

export interface ActiveSubsidy {
  id: string;
  equipmentType: string;
  maxBenefit: number;
  appliedAmount: number;
  status: string;
}
