'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ── Onboarding data shape ──
export interface OnboardingFormData {
  // Step 1: Connected accounts
  connectedAccounts: Record<string, boolean>;

  // Step 2: Setup Basics — shared
  companyName: string;
  website: string;
  industry: string;

  // Finance-specific
  gstNumber: string;
  panNumber: string;
  financialYear: string;
  revenueRange: string;
  accountingSoftware: string;

  // Marketing-shared
  monthlyBudget: string;
  primaryGoal: string;

  // E-Commerce specific
  targetAudience: string;
  targetLocation: string;

  // Lead Gen specific
  primaryService: string;
  serviceAreas: string;
  avgDealValue: string;
  leadVolumeTarget: string;

  // Step 3: Competitors (marketing only)
  competitors: { name: string; website: string; offering: string }[];

  // Step 4: Products / Services
  products: { name: string; category: string; priceRange: string }[];

  // Step 3 (finance): Data Access — portal credentials
  portalCredentials: Record<string, { username: string; password: string; saved: boolean }>;

  // Step 4 (finance): Documents uploaded
  uploadedDocuments: Record<string, boolean>;
}

const defaultData: OnboardingFormData = {
  connectedAccounts: {},
  companyName: '',
  website: '',
  industry: '',
  gstNumber: '',
  panNumber: '',
  financialYear: '2025-26',
  revenueRange: '',
  accountingSoftware: '',
  monthlyBudget: '',
  primaryGoal: '',
  targetAudience: '',
  targetLocation: '',
  primaryService: '',
  serviceAreas: '',
  avgDealValue: '',
  leadVolumeTarget: '',
  competitors: [
    { name: '', website: '', offering: '' },
    { name: '', website: '', offering: '' },
    { name: '', website: '', offering: '' },
  ],
  products: [{ name: '', category: '', priceRange: '' }],
  portalCredentials: {},
  uploadedDocuments: {},
};

interface OnboardingDataContextValue {
  data: OnboardingFormData;
  /** Merge partial updates into the store */
  updateData: (partial: Partial<OnboardingFormData>) => void;
  /** Replace the entire store (e.g. on initial hydration) */
  setData: (next: OnboardingFormData) => void;
  /** Whether any post-payment data has been saved at all */
  hasData: boolean;
}

const OnboardingDataContext = createContext<OnboardingDataContextValue | null>(null);

export function OnboardingDataProvider({ children, initialData }: { children: ReactNode; initialData?: Partial<OnboardingFormData> }) {
  const [data, setDataRaw] = useState<OnboardingFormData>(() => ({
    ...defaultData,
    ...initialData,
  }));
  const [hasData, setHasData] = useState(false);

  const updateData = useCallback((partial: Partial<OnboardingFormData>) => {
    setDataRaw(prev => ({ ...prev, ...partial }));
    setHasData(true);
  }, []);

  const setData = useCallback((next: OnboardingFormData) => {
    setDataRaw(next);
    setHasData(true);
  }, []);

  return (
    <OnboardingDataContext.Provider value={{ data, updateData, setData, hasData }}>
      {children}
    </OnboardingDataContext.Provider>
  );
}

export function useOnboardingData() {
  const ctx = useContext(OnboardingDataContext);
  if (!ctx) {
    // Return a safe fallback so components work even outside provider
    return {
      data: defaultData,
      updateData: () => {},
      setData: () => {},
      hasData: false,
    } as OnboardingDataContextValue;
  }
  return ctx;
}
