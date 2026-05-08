export type NicheId = 'supplements' | 'fashion' | 'beauty' | 'homegood' | 'electronics' | 'pet' | 'custom';
export type EspId = 'klaviyo' | 'mailchimp' | 'omnisend' | 'drip' | 'none' | 'other';
export type PeakSeasonId = 'bfcm' | 'holiday' | 'summer' | 'valentines' | 'other' | 'none';
export type ProposalTemplateId = 'standard' | 'followup' | 'followup2' | 'followup3';

export interface NicheData {
  atc: number;
  abandon: number;
  aovBase: number;
  famousBrand: string;
  hint: string;
  proposalMsg: string;
}

export interface EspData {
  cls: 'green' | 'amber' | 'red';
  msg: string;
  proposalMsg: string;
}

export interface PeakData {
  label: string;
  color: string;
  msg: string;
}

export interface Tier {
  id: number;
  name: string;
  price: number;
  features: string;
  badge?: string;
}

export interface AppState {
  storeUrl: string;
  storeDataContext: string;
  brand: string;
  contact: string;
  clientEmail: string;
  clientSocial: string;
  visitors: string;
  aovKnown: string;
  items: string;
  freeship: string;
  priceRangeLow: string;
  priceRangeHigh: string;
  recovery: string;
  atcPercent: string;
  abandonPercent: string;
  niche: NicheId;
  subscription: string;
  bundles: string;
  esp: EspId;
  customEspName: string;
  smsEnabled: boolean;
  existingFlow: string;
  currency: string;
  yourName: string;
  proposalTemplate: ProposalTemplateId;
  expiry: string;
  selectedTierId: number;
  t1PriceInput: string;
  t2PriceInput: string;
  t3PriceInput: string;
  testimonial: string;
  proposalText: string;
  proposalManuallyEdited: boolean;
  paidAdsActive: boolean;
  mobilePct: string;
  paidPct: string;
  refundRate: string;
  repeatRate: string;
  recentPromo: string;
  softwareCost: string;
  currentRateVal: string;
  showCurRate: boolean;
  peakSeason: PeakSeasonId;
}

export interface CalculationResults {
  abandonedCarts: number;
  grossLost: number;
  netLost: number;
  recovered: number;
  currentRecovered: number;
  delta: number;
  roi: number;
  paybackDays: number;
  ltvPerCart: number;
  effectiveAbandon: number;
  aov: number;
  aovLift: number;
  aovSource: 'known' | 'estimated' | 'none';
  aovConfidence: 'high' | 'medium' | 'low';
  aovFactors: { name: string; active: boolean }[];
  aovSignals: string[];
  peakSeason: string | null;
}
