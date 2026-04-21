export interface UserInfo {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite?: string;
  selectedService: string;
  selectedSector: string;
  email?: string;
  phone?: string;
  goal?: string;
  adSpendRange?: string;
  industry?: string;
  businessModel?: 'ecommerce' | 'leadgen';
  // Finance fields from Accounts & Taxation onboarding
  businessType?: string;
  financeManagement?: string;
  revenueRange?: string;
  accountingSoftware?: string;
}

export interface AuthResult {
  email: string;
  fullName?: string;
}

export interface DiagnosticData {
  businessModel: 'ecommerce' | 'leadgen' | '';
  industry?: string;
  goal?: string;
  adSpendRange: number;
  connectedAccounts: {
    metaAds: boolean;
    googleAds: boolean;
    linkedinAds: boolean;
    shopify: boolean;
    ga4: boolean;
  };
  // Finance fields
  businessType?: string;
  financeManagement?: string;
  revenueRange?: string;
  accountingSoftware?: string;
  financeChallenge?: string;
}
