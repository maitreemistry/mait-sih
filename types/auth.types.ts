// types/auth.types.ts
export interface User {
  id: string;
  role: 'farmer' | 'government' | 'distributor' | 'retailer' | 'consumer';
  profile: FarmerProfile | GovernmentProfile | BusinessProfile | ConsumerProfile;
  permissions: string[];
  isVerified: boolean;
  lastLogin: Date;
}

export interface FarmerProfile {
  aadhaarNumber: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address: Address;
  landRecords: LandRecord[];
  bankDetails: BankAccount;
  schemes: SchemeEnrollment[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface GovernmentProfile {
  employeeId: string;
  department: string;
  designation: string;
  officeAddress: Address;
  permissions: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface BusinessProfile {
  businessName: string;
  registrationNumber: string;
  gstNumber?: string;
  address: Address;
  businessType: 'distributor' | 'retailer';
  licenseDetails: LicenseDetails;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface ConsumerProfile {
  name: string;
  phoneNumber: string;
  email?: string;
  address: Address;
  preferences: ConsumerPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface LandRecord {
  surveyNumber: string;
  area: number; // in acres
  location: Address;
  ownershipType: 'owned' | 'leased';
  documents: string[]; // URLs to documents
}

export interface BankAccount {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

export interface SchemeEnrollment {
  schemeId: string;
  schemeName: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  benefits: string[];
}

export interface LicenseDetails {
  licenseNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
}

export interface ConsumerPreferences {
  preferredProducts: string[];
  notificationSettings: NotificationSettings;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// Additional types for authentication
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface FarmerRegistrationData {
  aadhaarNumber: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address: Address;
  landDetails: LandDetails[];
  bankDetails: BankAccount;
}

export interface LandDetails {
  surveyNumber: string;
  area: number;
  location: Address;
  ownershipType: 'owned' | 'leased';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
