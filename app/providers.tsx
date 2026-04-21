'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { DataroomProvider } from '../components/context/DataroomContext';
import type { UserInfo, AuthResult } from '../types';

const DEFAULT_USER_INFO: UserInfo = {
  firstName: '',
  lastName: '',
  country: '',
  city: '',
  phoneNumber: '',
  companyName: '',
  selectedService: 'marketing',
  selectedSector: '',
};

// ─── Service + Model union types ────────────────────────────────────────────

export type AppService = 'marketing' | 'finance';

/**
 * BusinessModel identifies the second URL segment and scopes dashboard data.
 * Marketing offers `ecommerce` | `leadgen`.
 * Finance (Accounts & Taxation) offers two business-type variants:
 *   - `ecommerce-restaurants` (E-Commerce or Restaurants)
 *   - `trading-manufacturing` (Trading, Manufacturing or Services)
 */
export type BusinessModel =
  | 'ecommerce'
  | 'leadgen'
  | 'ecommerce-restaurants'
  | 'trading-manufacturing';

// ─── URL helpers ────────────────────────────────────────────────────────────

const SERVICE_SLUG: Record<AppService, string> = {
  marketing: 'performance-marketing',
  finance: 'accounts-taxation',
};

const MODEL_SLUG: Record<BusinessModel, string> = {
  ecommerce: 'e-commerce',
  leadgen: 'lead-generation',
  'ecommerce-restaurants': 'ecommerce-restaurants',
  'trading-manufacturing': 'trading-manufacturing',
};

// Reverse maps for reading URL params back to state values
export const SLUG_TO_SERVICE: Record<string, AppService> = {
  'performance-marketing': 'marketing',
  'accounts-taxation': 'finance',
};

export const SLUG_TO_MODEL: Record<string, BusinessModel> = {
  'e-commerce': 'ecommerce',
  'lead-generation': 'leadgen',
  'ecommerce-restaurants': 'ecommerce-restaurants',
  'trading-manufacturing': 'trading-manufacturing',
};

/**
 * Map the onboarding Accounts & Taxation businessType label to its URL variant.
 * Accepts either the human label (e.g. "E-Commerce or Restaurants") or an
 * already-resolved slug. Defaults to `ecommerce-restaurants` if unrecognised.
 */
export function resolveFinanceVariant(
  businessType?: string | null,
): 'ecommerce-restaurants' | 'trading-manufacturing' {
  if (!businessType) return 'ecommerce-restaurants';
  const s = businessType.toLowerCase();
  if (s.includes('trading') || s.includes('manufactur') || s.includes('service')) {
    return 'trading-manufacturing';
  }
  if (s.includes('ecommerce') || s.includes('e-commerce') || s.includes('restaurant')) {
    return 'ecommerce-restaurants';
  }
  // Already-resolved slugs
  if (s === 'trading-manufacturing') return 'trading-manufacturing';
  if (s === 'ecommerce-restaurants') return 'ecommerce-restaurants';
  return 'ecommerce-restaurants';
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AppState {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
  authResult: AuthResult | null;
  setAuthResult: (result: AuthResult | null) => void;
  businessModel: BusinessModel;
  setBusinessModel: (model: BusinessModel) => void;
  selectedService: AppService;
  setSelectedService: (service: AppService) => void;
  /** Build a dashboard path like /performance-marketing/e-commerce/dashboard/overview */
  dashboardPath: (
    section: string,
    overrides?: { service?: AppService; model?: BusinessModel },
  ) => string;
}

const AppStateContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>(DEFAULT_USER_INFO);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [businessModel, setBusinessModel] = useState<BusinessModel>('ecommerce');
  const [selectedService, setSelectedService] = useState<AppService>('marketing');

  const dashboardPath = useCallback(
    (
      section: string,
      overrides?: { service?: AppService; model?: BusinessModel },
    ) => {
      const svc = SERVICE_SLUG[overrides?.service ?? selectedService];
      const resolvedService = overrides?.service ?? selectedService;

      // If finance service is requested but the current/override model is a
      // marketing-only model (or vice-versa), fall back to a sensible default so
      // we never generate a nonsense URL like /accounts-taxation/e-commerce/...
      let model: BusinessModel = overrides?.model ?? businessModel;
      const isFinanceModel =
        model === 'ecommerce-restaurants' || model === 'trading-manufacturing';
      if (resolvedService === 'finance' && !isFinanceModel) {
        model = 'ecommerce-restaurants';
      }
      if (resolvedService === 'marketing' && isFinanceModel) {
        model = 'ecommerce';
      }

      const mdl = MODEL_SLUG[model];
      return `/${svc}/${mdl}/dashboard/${section}`;
    },
    [selectedService, businessModel],
  );

  return (
    <AppStateContext.Provider value={{
      userInfo, setUserInfo,
      authResult, setAuthResult,
      businessModel, setBusinessModel,
      selectedService, setSelectedService,
      dashboardPath,
    }}>
      <DataroomProvider>
        {children}
      </DataroomProvider>
    </AppStateContext.Provider>
  );
}

// ─── URL-first route helper ─────────────────────────────────────────────────
//
// `useRouteContext()` resolves the current (service, model) STRICTLY from the
// URL params, falling back to the React context only if the route is outside
// the dashboard tree. This is what page components should read from when they
// need to know which dashboard they're rendering — it survives a hard refresh
// on Vercel without the useEffect flicker the context-sync pattern produces.

export interface RouteContext {
  service: AppService;
  model: BusinessModel;
  /** Build a dashboard path anchored to the CURRENT URL's service+model,
   *  not stale React context. Safer than useAppState().dashboardPath for
   *  in-page navigation. */
  buildPath: (
    section: string,
    overrides?: { service?: AppService; model?: BusinessModel },
  ) => string;
}

export function useRouteContext(): RouteContext {
  const params = useParams<{ service?: string; model?: string }>();
  const { selectedService, businessModel } = useAppState();

  return useMemo<RouteContext>(() => {
    const urlService = SLUG_TO_SERVICE[params?.service ?? ''];
    const urlModel = SLUG_TO_MODEL[params?.model ?? ''];

    const resolvedService: AppService = urlService ?? selectedService;
    let resolvedModel: BusinessModel = urlModel ?? businessModel;

    // Belt-and-suspenders: server layout already 404s on invalid combos, but
    // keep model coherent with service in case this hook is used outside it.
    const isFinanceModel =
      resolvedModel === 'ecommerce-restaurants' || resolvedModel === 'trading-manufacturing';
    if (resolvedService === 'finance' && !isFinanceModel) resolvedModel = 'ecommerce-restaurants';
    if (resolvedService === 'marketing' && isFinanceModel) resolvedModel = 'ecommerce';

    const buildPath: RouteContext['buildPath'] = (section, overrides) => {
      const svc = overrides?.service ?? resolvedService;
      let mdl: BusinessModel = overrides?.model ?? resolvedModel;
      const mdlIsFinance = mdl === 'ecommerce-restaurants' || mdl === 'trading-manufacturing';
      if (svc === 'finance' && !mdlIsFinance) mdl = 'ecommerce-restaurants';
      if (svc === 'marketing' && mdlIsFinance) mdl = 'ecommerce';
      return `/${SERVICE_SLUG[svc]}/${MODEL_SLUG[mdl]}/dashboard/${section}`;
    };

    return { service: resolvedService, model: resolvedModel, buildPath };
  }, [params?.service, params?.model, selectedService, businessModel]);
}
