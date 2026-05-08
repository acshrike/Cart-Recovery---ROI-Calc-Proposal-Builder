import { AppState, CalculationResults, PeakSeasonId } from '../types';
import { NICHES, TIERS, PEAK_SEASONS } from '../constants';

export const calculateResults = (state: AppState): CalculationResults => {
  const visitors = parseFloat(state.visitors.replace(/,/g, '')) || 0;
  const atcRaw = parseFloat(state.atcPercent.replace(/,/g, '')) || 0;
  const abandonRaw = parseFloat(state.abandonPercent.replace(/,/g, '')) || 0;
  const aovKnown = parseFloat(state.aovKnown.replace(/,/g, '')) || 0;
  const items = parseFloat(state.items.replace(/,/g, '')) || 1;
  const freeship = parseFloat(state.freeship.replace(/,/g, '')) || 0;
  const recentPromo = state.recentPromo;
  const refundRate = parseFloat(state.refundRate.replace(/,/g, '')) || 0;
  const repeatRate = parseFloat(state.repeatRate.replace(/,/g, '')) || 0;
  const softwareCost = parseFloat(state.softwareCost.replace(/,/g, '')) || 0;
  const currentRateVal = parseFloat(state.currentRateVal.replace(/,/g, '')) || 0;
  const paidPct = parseFloat(state.paidPct.replace(/,/g, '')) || 0;
  const mobilePct = parseFloat(state.mobilePct.replace(/,/g, '')) || 0;
  const nicheData = NICHES[state.niche];

  // AOV Estimation Logic
  let aov = aovKnown;
  let aovSource: 'known' | 'estimated' | 'none' = aovKnown > 0 ? 'known' : 'estimated';
  let aovConfidence: 'high' | 'medium' | 'low' = 'low';
  const aovFactors: { name: string; active: boolean }[] = [
    { name: 'Catalog price range', active: false },
    { name: 'Avg items per order', active: false },
    { name: 'Free shipping threshold', active: false },
    { name: 'Subscription model', active: false },
  ];
  const aovSignals: string[] = [];

  if (aovSource === 'estimated') {
    // If no explicit signals provided, default to 0 instead of industry average
    let base = 0;
    const hasPriceSignal = state.priceRangeLow || state.priceRangeHigh;
    
    if (hasPriceSignal || state.niche !== 'custom') {
      base = nicheData ? nicheData.aovBase : 80;
    }
    
    // Price range influence
    const pLow = parseFloat(state.priceRangeLow.replace(/,/g, ''));
    const pHigh = parseFloat(state.priceRangeHigh.replace(/,/g, ''));
    if (pLow > 0 || pHigh > 0) {
      aovFactors[0].active = true;
      if (pLow > 0 && pHigh > 0) {
        base = (pLow + pHigh) / 2;
        aovSignals.push(`Catalog midpoint (${base.toFixed(0)})`);
      } else if (pLow > 0) {
        base = pLow * 1.5;
        aovSignals.push(`Floor-based projection`);
      }
    }

    // Only apply modifiers if base > 0
    if (base > 0) {
      // Items influence
      if (items > 1) {
        aovFactors[1].active = true;
        base = base * (1 + (items - 1) * 0.4);
        aovSignals.push(`Multi-item velocity (${items}x)`);
      }

      // Free ship influence
      if (freeship > 0) {
        aovFactors[2].active = true;
        if (base < freeship) {
          base = freeship * 1.05;
          aovSignals.push(`Cart-stretching via free ship ($${freeship})`);
        }
      }

      // Subscription influence
      if (state.subscription === 'yes') {
        aovFactors[3].active = true;
        base *= 1.25;
        aovSignals.push(`Recurring model factor (+25%)`);
      }

      // Upsell influence
      if (state.bundles === 'high') {
        base *= 1.15;
        aovSignals.push(`High bundle uptake (+15%)`);
      } else if (state.bundles === 'medium') {
        base *= 1.05;
        aovSignals.push(`Moderate upsell signal (+5%)`);
      }
    }

    aov = base;
    const activeCount = aovFactors.filter(f => f.active).length;
    aovConfidence = aov === 0 ? 'low' : (activeCount >= 3 ? 'high' : activeCount === 2 ? 'medium' : 'low');
  }

  // Abandonment & Recovery Math
  const effectiveAbandon = abandonRaw + (mobilePct > 60 ? (mobilePct - 60) * 0.15 : 0);
  const abandonedCarts = visitors * (atcRaw / 100) * (effectiveAbandon / 100);
  const grossLost = abandonedCarts * aov;
  const netLost = grossLost * (1 - refundRate / 100);

  let recoveryAdjusted = parseFloat(state.recovery.replace(/,/g, '')) || 0;
  if (paidPct > 0) recoveryAdjusted *= (1 + (paidPct / 100) * 0.15);
  if (state.smsEnabled) recoveryAdjusted += 3;

  const promoAdj = recentPromo === 'within2w' ? 0.75 : recentPromo === 'within1m' ? 0.88 : 1;
  const discountOffered = 0; // Simplified for now, can add back if needed

  const recoveredRaw = netLost * (recoveryAdjusted / 100) * promoAdj;
  const recovered = recoveredRaw * (1 - discountOffered / 100);

  const currentRecoveredRaw = state.showCurRate && currentRateVal > 0 
    ? netLost * (currentRateVal / 100) * promoAdj 
    : 0;
  const currentRecovered = currentRecoveredRaw * (1 - discountOffered / 100);
  
  const delta = recovered - currentRecovered;
  
  const selectedTier = TIERS.find(t => t.id === state.selectedTierId) || TIERS[0];
  const tierPrice = parseFloat((state as any)[`t${selectedTier.id}PriceInput`]?.replace(/,/g, '')) || selectedTier.price;
  
  // Software cost is what they ALREADY pay
  // Proposed Investment is what we are proposing
  const proposedInvestment = tierPrice;
  
  const roi = proposedInvestment > 0 ? (recovered / proposedInvestment) : 0;
  const paybackDays = recovered > 0 ? Math.round((proposedInvestment / (recovered / 30))) : 0;
  
  const ltvMultiplier = repeatRate > 0 ? 1 + (repeatRate / 100) * 0.8 : 1;
  const ltvPerCart = aov * ltvMultiplier * (1 - refundRate / 100);

  const aovLift = nicheData ? ((aov / nicheData.aovBase) - 1) * 100 : 0;

  return {
    abandonedCarts,
    grossLost,
    netLost,
    recovered,
    currentRecovered,
    delta,
    roi,
    paybackDays,
    ltvPerCart,
    effectiveAbandon,
    aov,
    aovLift,
    aovSource,
    aovConfidence,
    aovFactors,
    aovSignals,
    peakSeason: state.peakSeason !== 'none' ? PEAK_SEASONS[state.peakSeason].label : null
  };
};
