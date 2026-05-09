import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Target, 
  Search, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Users, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Copy,
  Mail,
  Trash2,
  Edit3,
  Save,
  Check,
  Zap,
  Calculator,
  BarChart3,
  GitCompare,
  CreditCard,
  MessageSquareQuote,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from './components/Sidebar';
import InputField from './components/InputField';
import MetricCard from './components/MetricCard';
import { 
  AppState, 
  CalculationResults, 
  NicheId, 
  EspId, 
  PeakSeasonId, 
  ProposalTemplateId 
} from './types';
import { 
  NICHES, 
  ESPS, 
  PEAK_SEASONS, 
  TIERS, 
  CURRENCIES 
} from './constants';
import { calculateResults } from './lib/calculations';
import { formatCurrency, wrapPlaceholder, formatDate, cn, formatNumberWithCommas, parseNumberFromCommas } from './lib/utils';
import { analyzeStore, refineProposal, getAovRecommendation } from './services/geminiService';

const INITIAL_STATE: AppState = {
  storeUrl: '',
  storeDataContext: '',
  brand: '',
  contact: '',
  clientEmail: '',
  clientSocial: '',
  visitors: '',
  aovKnown: '',
  items: '',
  freeship: '',
  priceRangeLow: '',
  priceRangeHigh: '',
  recovery: '8',
  atcPercent: '',
  abandonPercent: '',
  niche: 'custom',
  subscription: 'no',
  bundles: 'low',
  esp: 'none',
  customEspName: '',
  smsEnabled: false,
  existingFlow: 'no',
  currency: '$',
  yourName: '',
  proposalTemplate: 'standard',
  expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  selectedTierId: 2,
  t1PriceInput: '',
  t2PriceInput: '',
  t3PriceInput: '',
  testimonial: '',
  proposalText: '',
  proposalManuallyEdited: false,
  paidAdsActive: false,
  mobilePct: '',
  paidPct: '',
  refundRate: '',
  repeatRate: '',
  recentPromo: 'none',
  softwareCost: '',
  currentRateVal: '',
  showCurRate: false,
  peakSeason: 'none'
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('cartRecoveryState');
    if (saved) {
      try {
        return { ...INITIAL_STATE, ...JSON.parse(saved) };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppState, string>>>({});
  const [activeSection, setActiveSection] = useState('sec-01');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Retract sidebar by default on mobile (under 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  const [analyzing, setAnalyzing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [aovAiRec, setAovAiRec] = useState<string | null>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const results = useMemo(() => calculateResults(state), [state]);

  useEffect(() => {
    localStorage.setItem('cartRecoveryState', JSON.stringify(state));
  }, [state]);

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['sec-01', 'sec-02', 'sec-03', 'sec-04', 'sec-05', 'sec-08'];
      const scrollThreshold = 140; // Trigger threshold from top
      
      let currentActive = 'sec-01';
      
      // We check from bottom up to find the "current" section whose top has passed the threshold
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= scrollThreshold) {
            currentActive = sectionId;
            break;
          }
        }
      }
      
      setActiveSection(currentActive);
    };

    // Attach to all containers that might be scrolling
    // On mobile: the parent div (line 361)
    // On desktop: the left column (line 365)
    const scrollContainers = document.querySelectorAll('.custom-scrollbar');
    
    scrollContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });

    // Initial check in case we're already scrolled
    handleScroll();

    return () => {
      scrollContainers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  const handleInputChange = (key: keyof AppState, value: any) => {
    let finalValue = value;
    let errorMsg = '';

    const numericKeys: (keyof AppState)[] = ['visitors', 'aovKnown', 'items', 'freeship', 'priceRangeLow', 'priceRangeHigh', 'softwareCost', 't1PriceInput', 't2PriceInput', 't3PriceInput'];
    const percentageKeys: (keyof AppState)[] = ['atcPercent', 'abandonPercent', 'mobilePct', 'paidPct', 'refundRate', 'repeatRate', 'recovery', 'currentRateVal'];

    // Numerical restriction: only digits and decimal
    if (numericKeys.includes(key) || percentageKeys.includes(key)) {
      if (typeof value === 'string') {
        // Strip everything except digits and one decimal point
        const parts = value.replace(/[^\d.]/g, '').split('.');
        let cleaned = parts[0];
        if (parts.length > 1) cleaned += '.' + parts.slice(1).join('');
        finalValue = cleaned;
      }
    }

    if (percentageKeys.includes(key) && finalValue !== '') {
      const numValue = parseFloat(finalValue);
      if (isNaN(numValue)) {
        errorMsg = 'Invalid number';
      } else if (numValue < 0) {
        finalValue = "0";
      } else if (numValue > 100) {
        finalValue = "100";
      }
    }

    if (numericKeys.includes(key)) {
      const cleanValue = parseNumberFromCommas(finalValue);
      if (finalValue !== '') {
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
          errorMsg = 'Invalid number';
        } else if (numValue < 0) {
          errorMsg = 'Must be > 0';
          finalValue = "0";
        }
      }
      finalValue = formatNumberWithCommas(cleanValue);
    }

    setErrors(prev => ({ ...prev, [key]: errorMsg }));

    setState(prev => ({ 
      ...prev, 
      [key]: finalValue,
      ...(key === 'niche' && finalValue !== 'custom' ? {
        atcPercent: NICHES[finalValue as NicheId].atc.toString(),
        abandonPercent: NICHES[finalValue as NicheId].abandon.toString()
      } : {}),
      ...(key === 'esp' && finalValue === 'none' ? { existingFlow: 'no' } : {}),
      ...(key !== 'proposalText' && !prev.proposalManuallyEdited ? { proposalManuallyEdited: false } : {})
    }));
  };

  const generateProposalTextWithData = (dataState: AppState, dataResults: CalculationResults) => {
    const tier = TIERS.find(t => t.id === dataState.selectedTierId) || TIERS[1];
    const price = (dataState as any)[`t${tier.id}PriceInput`] || tier.price;
    const nData = NICHES[dataState.niche];
    const eData = ESPS[dataState.esp];
    const brand = dataState.brand;
    const contact = dataState.contact;
    const yourName = dataState.yourName;
    const hasVisitors = !!dataState.visitors && parseFloat(dataState.visitors) > 0;

    const wrapIfEmpty = (value: string | undefined, placeholder: string) => {
      if (value && value.trim()) return value;
      return `<span class="proposal-placeholder">${placeholder}</span>`;
    };

    const wrapCalc = (value: string | number, placeholder: string) => {
      if (hasVisitors) return value;
      return `<span class="proposal-placeholder">${placeholder}</span>`;
    };

    let html;
    if (dataState.proposalTemplate === 'followup') {
      html = `<p>Hey ${wrapIfEmpty(contact, 'Client Name')},</p>`;
      html += `<p>I also wanted to add that most ${nData?.famousBrand || 'beauty'} stores lose 70% of their abandoned carts in the first hour. That is where all the money is really.</p>`;
      html += `<p>A simple 3-email sequence captures most of it, and it is already running for stores in your niche.</p>`;
      html += `<p>Still worth a 15-minute call?</p>`;
      html += `<p>Best,<br>${wrapIfEmpty(yourName, 'Your Name')}</p>`;
    } else if (dataState.proposalTemplate === 'followup2') {
      html = `<p>Hey ${wrapIfEmpty(contact, 'Client Name')},</p>`;
      html += `<p>One quick suggestion: hold off on offering a 10% discount until the third abandoned cart email, not the first. Many stores offer discounts too early, which just kills their margins.</p>`;
      html += `<p>This one tweak alone recovered an extra $12K/month for a beauty client last quarter.</p>`;
      html += `<p>Want the full breakdown?</p>`;
      html += `<p>Best,<br>${wrapIfEmpty(yourName, 'Your Name')}</p>`;
    } else if (dataState.proposalTemplate === 'followup3') {
      html = `<p>Hey ${wrapIfEmpty(contact, 'Client Name')},</p>`;
      html += `<p>I will leave you alone after this.</p>`;
      html += `<p>Just closed a beauty brand at $74K/month in recovered revenue. Took 3 weeks to set up.</p>`;
      html += `<p>If the timing is off right now, I completely understand. If you ever want to revisit this, you know how to reach me.</p>`;
      html += `<p>Best,<br>${wrapIfEmpty(yourName, 'Your Name')}</p>`;
    } else {
      let hookText = '';
      switch(dataState.existingFlow) {
        case 'basic':
          hookText = `You're running traffic, but your basic recovery system is leaking <strong>${wrapCalc(formatCurrency(dataResults.netLost, dataState.currency), 'Calculated Loss')}/month</strong> because it is missing the intent required to close the sale.`;
          break;
        case 'partial':
          hookText = `You're running partial recovery, but missing out on <strong>${wrapCalc(formatCurrency(dataResults.netLost, dataState.currency), 'Calculated Loss')}/month</strong> by ignoring multi-step automation.`;
          break;
        case 'no':
        default:
          hookText = `You're running traffic, but leaving <strong>${wrapCalc(formatCurrency(dataResults.netLost, dataState.currency), 'Calculated Loss')}/month</strong> in abandoned carts with zero recovery system.`;
          break;
      }
      
      html = `<p>Hey ${wrapIfEmpty(contact, 'Client Name')},</p>`;
      html += `<p>${hookText}</p>`;
      
      html += `<p>Stores like yours typically recover <strong>${wrapIfEmpty(dataState.recovery, 'Recovery Rate')}%</strong> of that automatically, so that is <strong>${wrapCalc(formatCurrency(dataResults.recovered, dataState.currency), 'Target Recovery')}/month</strong> sitting on the table.</p>`;
      
      html += `<p>Got 15 minutes this week? I'll show you exactly how.</p>`;
      
      if (dataState.testimonial && dataState.testimonial.trim()) {
        html += `<div style="border-left: 1px solid rgba(245,242,237,0.2); padding-left: 1rem; margin-bottom: 1.5rem; color: rgba(245,242,237,0.7);">
          <p style="margin-bottom: 0;">${dataState.testimonial}</p>
        </div>`;
      }
      
      // html += `<p><em>This proposal is valid until ${formatDate(dataState.expiry)}.</em></p>`;
      html += `<p>Best,<br>${wrapIfEmpty(yourName, 'Your Name')}</p>`;
    }

    return html;
  };

  const handleReset = () => {
    const newState: AppState = {
      ...INITIAL_STATE,
      selectedTierId: state.selectedTierId,
      t1PriceInput: state.t1PriceInput,
      t2PriceInput: state.t2PriceInput,
      t3PriceInput: state.t3PriceInput,
      testimonial: state.testimonial,
      yourName: state.yourName,
    };
    
    const newResults = calculateResults(newState);
    
    setState({
      ...newState,
      proposalText: generateProposalTextWithData(newState, newResults)
    });
    
    showFeedback("Inputs reset");
  };

  const runAnalysis = async () => {
    if (!state.storeUrl) return;
    setAnalyzing(true);
    try {
      const data = await analyzeStore(state.storeUrl, state.storeDataContext);
      if (data.error) {
        alert(data.error);
        return;
      }

      setState(prev => ({
        ...prev,
        brand: data.brand || prev.brand,
        contact: data.contactName || prev.contact,
        clientEmail: data.clientEmail || prev.clientEmail,
        clientSocial: data.clientSocial || prev.clientSocial,
        niche: data.niche as NicheId || prev.niche,
        visitors: formatNumberWithCommas(data.visitors?.toString() || prev.visitors),
        aovKnown: formatNumberWithCommas(data.aovKnown?.toString() || prev.aovKnown),
        priceRangeLow: formatNumberWithCommas(data.priceRangeMin?.toString() || prev.priceRangeLow),
        priceRangeHigh: formatNumberWithCommas(data.priceRangeMax?.toString() || prev.priceRangeHigh),
        paidAdsActive: data.paidAdsActive ?? prev.paidAdsActive,
        esp: data.esp as EspId || prev.esp,
        existingFlow: data.existingFlow || prev.existingFlow,
        items: formatNumberWithCommas(data.items?.toString() || prev.items),
        freeship: formatNumberWithCommas(data.freeship?.toString() || prev.freeship),
      }));
    } catch (e) {
      alert("Failed to analyze store. Please check your data.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefine = async () => {
    setRefining(true);
    try {
      const refined = await refineProposal(state.brand, state.contact, state.niche, state.proposalText);
      setState(prev => ({ ...prev, proposalText: refined, proposalManuallyEdited: true }));
    } catch (e) {
      alert("Refinement failed.");
    } finally {
      setRefining(false);
    }
  };

  // AOV AI Recommendation trigger
  useEffect(() => {
    if (results.aovSource === 'estimated' && results.aovConfidence === 'low' && (state.brand || state.storeUrl)) {
      const timer = setTimeout(async () => {
        try {
          const rec = await getAovRecommendation(state.brand, state.niche, state.storeUrl);
          setAovAiRec(rec);
        } catch (e) {
          console.error("AOV Rec failed", e);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAovAiRec(null);
    }
  }, [state.brand, state.storeUrl, state.niche, results.aovConfidence, results.aovSource]);

  const showFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getPlainTextProposal = (html: string) => {
    return html
      .replace(/<h3>(.*?)<\/h3>/gi, '$1\n\n')
      .replace(/<div style="[^"]*">([\s\S]*?)<\/div>/gi, '"$1"\n\n') // Handle testimonial div
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '$1')
      .replace(/<span class="proposal-placeholder">(.*?)<\/span>/gi, '$1') 
      .replace(/<[^>]*>/g, '') // remove remaining tags
      .replace(/\n{3,}/g, '\n\n') // replace excessive newlines
      .trim();
  };

  const copyToClipboard = (text: string) => {
    const plainText = getPlainTextProposal(text);
    navigator.clipboard.writeText(plainText);
    showFeedback("Copied to clipboard");
  };


  useEffect(() => {
    if (!state.proposalManuallyEdited) {
      handleInputChange('proposalText', generateProposalTextWithData(state, results));
    }
  }, [state.brand, state.contact, state.selectedTierId, state.niche, state.esp, state.existingFlow, state.yourName, state.testimonial, results.recovered, state.proposalTemplate]);

  return (
    <div className="flex bg-bg h-screen overflow-hidden">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        activeSection={activeSection} 
        onReset={handleReset}
        scrollToSection={scrollToSection}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 overflow-hidden flex flex-col"
      )}>
        {/* Global Top Bar */}
        <header className="h-14 border-b border-white/5 px-4 md:px-6 flex items-center justify-between bg-bg/80 backdrop-blur-md z-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <Calculator size={16} className="text-accent" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60 block leading-tight">Cart Recovery</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-zinc-900 text-[10px] sm:text-xs text-white border border-border rounded-lg p-1.5 outline-none cursor-pointer"
              value={state.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row overflow-y-auto lg:overflow-y-visible custom-scrollbar">
          
          {/* Left Column: Inputs */}
          <div 
            ref={formScrollRef}
            className="flex-1 lg:overflow-y-auto px-4 md:px-6 pt-6 pb-8 custom-scrollbar scroll-smooth"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white mb-1 uppercase italic leading-none">Build your proposal</h1>
                <p className="text-[10px] sm:text-xs text-accent/40 max-w-md font-medium leading-relaxed">
                  Fill the details below to generate a tailored revenue projection and proposal.
                </p>
              </div>
            
            {/* Sec-01: Store Analysis */}
            <section id="sec-01" className="section-card p-4 sm:p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg text-accent">
                  <Target size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Store Analysis</h2>
                  <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">Let AI scout the brand for you</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 bg-black/40 border border-border rounded-xl p-1 fle items-center focus-within:border-accent/40 transition-all flex h-9 sm:h-11 overflow-hidden px-3 sm:px-4">
                    <Search className="text-accent/20 h-full flex sm:w-4 sm:h-4" size={14} />
                    <input 
                      className="bg-transparent border-none outline-none h-full w-full px-2 sm:px-3 text-xs sm:text-sm" 
                      placeholder="https://brand-store.com"
                      value={state.storeUrl}
                      onChange={(e) => handleInputChange('storeUrl', e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={runAnalysis}
                    disabled={analyzing || !state.storeUrl}
                    className="btn-primary h-9 sm:h-11 px-3 sm:px-5 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-[10px] sm:text-xs"
                  >
                    {analyzing ? <RefreshCcw size={14} className="animate-spin sm:w-4 sm:h-4" /> : <Sparkles size={14} className="sm:w-4 sm:h-4" />}
                    <span>{analyzing ? 'Analyzing...' : 'Auto-Fill'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Brand Name" value={state.brand} onChange={e => handleInputChange('brand', e.target.value)} />
                  <InputField label="Contact Name" value={state.contact} onChange={e => handleInputChange('contact', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <InputField label="Client Email" value={state.clientEmail} onChange={e => handleInputChange('clientEmail', e.target.value)} />
                  <InputField label="Client Social" placeholder="@brandname" value={state.clientSocial} onChange={e => handleInputChange('clientSocial', e.target.value)} />
                  <InputField 
                    label="Vertical/Niche" 
                    value={state.niche} 
                    onChange={e => handleInputChange('niche', e.target.value)}
                    options={Object.keys(NICHES).map(key => ({ label: key.charAt(0).toUpperCase() + key.slice(1), value: key }))}
                  />
                  <InputField 
                    label="Peak Season" 
                    value={state.peakSeason} 
                    onChange={e => handleInputChange('peakSeason', e.target.value)}
                    options={Object.keys(PEAK_SEASONS).map(key => ({ 
                      label: PEAK_SEASONS[key as PeakSeasonId].label || 'None', 
                      value: key 
                    }))}
                  />
                </div>
              </div>
            </section>

            {/* Sec-02: Core Metrics */}
            <section id="sec-02" className="section-card p-4 sm:p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg text-accent">
                  <BarChart3 size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Core Traffic & Cart Data</h2>
                  <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">Define the current funnel leaks</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-6">
                  <InputField label="Monthly Visitors" placeholder="e.g. 100,000" value={state.visitors} onChange={e => handleInputChange('visitors', e.target.value)} error={errors.visitors} inputMode="decimal" />
                  <InputField label="Add-to-cart rate %" placeholder="e.g. 5" value={state.atcPercent} onChange={e => handleInputChange('atcPercent', e.target.value)} error={errors.atcPercent} inputMode="decimal" />
                   <InputField label="Abandonment rate %" placeholder="e.g. 70" value={state.abandonPercent} onChange={e => handleInputChange('abandonPercent', e.target.value)} error={errors.abandonPercent} inputMode="decimal" />
                   <InputField 
                    label="Mobile Traffic %" 
                    placeholder="e.g. 65"
                    value={state.mobilePct} 
                    onChange={e => handleInputChange('mobilePct', e.target.value)} 
                    hint="Multiplier > 60%"
                    error={errors.mobilePct}
                    inputMode="decimal"
                  />
                </div>
              </div>
            </section>

            {/* Sec-03: AOV */}
            <section id="sec-03" className="section-card p-4 sm:p-6 scroll-mt-20">
               <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg text-accent">
                  <Calculator size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">AOV Components</h2>
                  <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">Fine-tune revenue per transaction</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <InputField label="Official AOV (if known)" placeholder="e.g. 75" value={state.aovKnown} onChange={e => handleInputChange('aovKnown', e.target.value)} hint="Overrides AI estimation" error={errors.aovKnown} inputMode="decimal" />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <InputField label="Min Price" placeholder="e.g. 20" value={state.priceRangeLow} onChange={e => handleInputChange('priceRangeLow', e.target.value)} error={errors.priceRangeLow} inputMode="decimal" />
                    <InputField label="Max Price" placeholder="e.g. 200" value={state.priceRangeHigh} onChange={e => handleInputChange('priceRangeHigh', e.target.value)} error={errors.priceRangeHigh} inputMode="decimal" />
                  </div>
                  <p className="text-[9px] text-accent/40 -mt-2.5 block leading-tight">Catalog range</p>
                  <InputField 
                    label="Subscription Model?" 
                    value={state.subscription} 
                    onChange={e => handleInputChange('subscription', e.target.value)}
                    options={[
                      { label: 'No', value: 'no' },
                      { label: 'Yes', value: 'yes' }
                    ]}
                  />
                </div>
                <div className="space-y-4">
                  <InputField 
                    label="Avg Items/Order" 
                    placeholder="e.g. 1.5"
                    value={state.items} 
                    onChange={e => handleInputChange('items', e.target.value)} 
                    hint="Calculates volume boost"
                    error={errors.items}
                    inputMode="decimal"
                  />
                  <InputField 
                    label="Free Ship Threshold" 
                    placeholder="e.g. 100"
                    value={state.freeship} 
                    onChange={e => handleInputChange('freeship', e.target.value)} 
                    hint="Often pulls AOV up"
                    error={errors.freeship}
                    inputMode="decimal"
                  />
                  <InputField 
                    label="Bundles / Upsells" 
                    value={state.bundles} 
                    onChange={e => handleInputChange('bundles', e.target.value)}
                    options={[
                      { label: 'Low', value: 'low' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'High', value: 'high' }
                    ]}
                  />
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className="mt-6 p-4 bg-black/20 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent/60">
                    {results.aovSource === 'known' ? 'AOV SOURCE' : 'AOV Estimation accuracy'}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase", (results.aovSource === 'known' || results.aovConfidence === 'high') ? "bg-green/20 text-green" : results.aovConfidence === 'medium' ? "bg-amber/20 text-amber" : "bg-red/20 text-red")}>
                    {results.aovSource === 'known' ? 'VERIFIED' : `${results.aovConfidence} Confidence`}
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: (results.aovSource === 'known' || results.aovConfidence === 'high') ? '100%' : results.aovConfidence === 'medium' ? '66%' : '33%' }}
                    className={cn("h-full", (results.aovSource === 'known' || results.aovConfidence === 'high') ? "bg-green" : results.aovConfidence === 'medium' ? "bg-amber" : "bg-red")}
                  />
                </div>
                <div className="flex gap-4 mt-3">
                  {results.aovFactors.map(f => (
                    <div key={f.name} className="flex items-center gap-1.5 grayscale transition-all hover:grayscale-0">
                      <div className={cn("w-1 h-1 rounded-full", f.active ? "bg-green" : "bg-white/10")} />
                      <span className={cn("text-[9px] font-medium", f.active ? "text-accent/80" : "text-accent/20")}>{f.name}</span>
                    </div>
                  ))}
                </div>
                {results.aovSignals.length > 0 && (
                   <div className="mt-3 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-accent/40 font-bold uppercase block mb-1">Adjustments Applied</span>
                      <div className="flex flex-wrap gap-1.5">
                        {results.aovSignals.map(s => (
                          <span key={s} className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-accent/60">{s}</span>
                        ))}
                      </div>
                   </div>
                )}
                {aovAiRec && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-2 border-t border-accent/20"
                   >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={10} className="text-accent" />
                        <span className="text-[9px] text-accent font-bold uppercase tracking-wider">AI Recommendation</span>
                      </div>
                      <p className="text-[10px] text-accent/80 italic leading-relaxed">
                        {aovAiRec}
                      </p>
                   </motion.div>
                )}
              </div>
            </section>

            {/* Sec-04: Revenue & LTV */}
            <section id="sec-04" className="section-card p-4 sm:p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg text-accent">
                  <DollarSign size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Revenue & LTV Signals</h2>
                  <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">Advanced ROI calculations</p>
                </div>
              </div>

              <p className="text-[9px] sm:text-[10px] text-accent/40 mb-3 sm:mb-5 block leading-tight -mt-2">Define operational costs and retention signals to refine high-granularity ROI projection</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <InputField label="Refund Rate %" placeholder="e.g. 5" value={state.refundRate} onChange={e => handleInputChange('refundRate', e.target.value)} error={errors.refundRate} inputMode="decimal" />
                <InputField label="Repeat Customer Rate %" placeholder="e.g. 20" value={state.repeatRate} onChange={e => handleInputChange('repeatRate', e.target.value)} error={errors.repeatRate} inputMode="decimal" />
                <InputField label="Recent Store Promo" value={state.recentPromo} onChange={e => handleInputChange('recentPromo', e.target.value)} options={[
                  { label: 'None recently', value: 'none' },
                  { label: 'Within last 2 weeks', value: 'within2w' },
                  { label: 'Within last month', value: 'within1m' }
                ]} />
                <InputField label="Software/ESP Costs/mo" placeholder="e.g. 300" value={state.softwareCost} onChange={e => handleInputChange('softwareCost', e.target.value)} error={errors.softwareCost} inputMode="decimal" />
                <InputField label="Paid Traffic %" placeholder="e.g. 30" value={state.paidPct} onChange={e => handleInputChange('paidPct', e.target.value)} error={errors.paidPct} hint="Percentage of traffic from ads" inputMode="decimal" />
              </div>
            </section>

             {/* Sec-05: Tech Stack */}
             <section id="sec-05" className="section-card p-4 sm:p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg text-accent">
                  <GitCompare size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Technical Stack</h2>
                  <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">
                    {state.esp === 'none' 
                      ? "Strategic opportunity: Deploying a first-party recovery system from zero" 
                      : "Platform & tool compatibility"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="ESP Platform" 
                    value={state.esp} 
                    onChange={e => handleInputChange('esp', e.target.value)}
                    options={Object.keys(ESPS).map(key => ({ label: key.charAt(0).toUpperCase() + key.slice(1), value: key }))}
                  />
                  <InputField 
                    label="Existing Flow" 
                    value={state.existingFlow} 
                    onChange={e => handleInputChange('existingFlow', e.target.value)}
                    disabled={state.esp === 'none'}
                    options={[
                      { label: 'None', value: 'no' },
                      { label: 'Basic Flow', value: 'basic' },
                      { label: 'Partial Opt.', value: 'partial' }
                    ]}
                  />
                  <InputField 
                    label="Active Paid Ads?" 
                    value={state.paidAdsActive ? 'yes' : 'no'} 
                    onChange={e => handleInputChange('paidAdsActive', e.target.value === 'yes')}
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' }
                    ]}
                    hint="Influences traffic quality weight"
                  />
                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-border">
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent/60">SMS Strategy</p>
                      <p className="text-[8px] sm:text-[10px] text-accent/30 lowercase italic">Adds ~3% recovery boost</p>
                    </div>
                    <button 
                      onClick={() => handleInputChange('smsEnabled', !state.smsEnabled)}
                      className={cn("w-10 h-5 rounded-full p-0.5 transition-colors relative", state.smsEnabled ? "bg-green" : "bg-white/10")}
                    >
                      <motion.div 
                        animate={{ x: state.smsEnabled ? 20 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-end justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] sm:text-xs font-bold text-accent mb-2 sm:mb-3 block uppercase tracking-widest text-accent/60">Target Recovery Rate</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          step="0.5"
                          className="w-full accent-accent h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          value={state.recovery} 
                          onChange={e => handleInputChange('recovery', e.target.value)} 
                        />
                      </div>
                      <div className="flex flex-col items-end w-auto sm:w-[120px] flex-shrink-0 min-w-[70px]">
                        <span className="text-2xl sm:text-4xl font-black text-accent tracking-tighter leading-none tabular-nums text-right w-full whitespace-nowrap">{state.recovery}%</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-accent/30 uppercase mt-1 text-right w-full">Target Goal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center p-3 bg-accent/5 rounded-xl border border-accent/10">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-accent/20 rounded-lg text-accent">
                          <RefreshCcw size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-accent">Compare to baseline?</p>
                          <p className="text-[10px] text-accent/40 leading-tight">Show delta against current flow</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex justify-end">
                            <button 
                              onClick={() => handleInputChange('showCurRate', !state.showCurRate)}
                              className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all", state.showCurRate ? "bg-accent text-bg" : "bg-white/5 text-accent/60")}
                            >
                              {state.showCurRate ? 'Enabled' : 'Disabled'}
                            </button>
                         </div>
                         <AnimatePresence>
                          {state.showCurRate && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className={cn(
                                "flex items-center gap-2 bg-black/20 rounded-lg p-2 border relative transition-colors",
                                errors.currentRateVal ? "border-red/40 bg-red/5" : "border-white/5"
                              )}>
                                <span className="text-[9px] font-bold text-accent/40 uppercase px-2">Current %</span>
                                <input 
                                  type="text"
                                  className={cn(
                                    "bg-transparent border-none outline-none text-xs font-bold w-full",
                                    errors.currentRateVal ? "text-red" : "text-accent"
                                  )}
                                  placeholder="e.g. 3"
                                  value={state.currentRateVal}
                                  onChange={e => handleInputChange('currentRateVal', e.target.value)}
                                  inputMode="decimal"
                                />
                                {errors.currentRateVal && (
                                  <span className="absolute -top-6 right-0 text-[8px] font-bold text-red uppercase">
                                    {errors.currentRateVal}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                         </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             </section>

             {/* Sec 08: Proposal Editor */}
            <section id="sec-08" className="section-card p-4 sm:p-6 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
                    <FileText size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">Proposal Canvas</h2>
                    <p className="text-[9px] sm:text-[10px] text-accent/40 mt-0.5">Finalize and export your offer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const defaultText = generateProposalTextWithData(state, results);
                      setState(prev => ({
                        ...prev,
                        proposalText: defaultText,
                        proposalManuallyEdited: false
                      }));
                      showFeedback("Proposal reset to default");
                    }}
                    className="p-1.5 hover:bg-accent/10 text-accent/40 hover:text-accent rounded-lg transition-colors"
                    title="Reset to Template"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button 
                    onClick={handleRefine}
                    disabled={refining}
                    className="btn-secondary flex items-center h-8 sm:h-9 px-3 sm:px-4 gap-2 text-[9px] sm:text-xs"
                  >
                    {refining ? <RefreshCcw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Refine
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 sm:mb-6">
                  <InputField label="Your Name (Proposal Sender)" value={state.yourName} onChange={e => handleInputChange('yourName', e.target.value)} />
                  <InputField 
                    label="Proposal Template" 
                    value={state.proposalTemplate} 
                    onChange={e => handleInputChange('proposalTemplate', e.target.value)}
                    options={[
                      { label: 'Standard', value: 'standard' },
                      { label: '1st Follow-up', value: 'followup' },
                      { label: '2nd Follow-up', value: 'followup2' },
                      { label: '3rd Follow-up', value: 'followup3' }
                    ]}
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-4">
                  <InputField 
                    label="Case Study / Testimonial Quote" 
                    isTextArea 
                    placeholder='"The recovery flows increased our revenue by 22% in the first 30 days" from the CEO of BrandX'
                    value={state.testimonial} 
                    onChange={e => handleInputChange('testimonial', e.target.value)}
                    hint="Format: Quote text from Author Name"
                  />
              </div>

              <div 
                className="bg-black/40 border border-border rounded-xl p-4 sm:p-6 min-h-[300px] outline-none focus:border-accent/20 transition-colors markdown-body text-xs sm:text-sm prose-sm"
                contentEditable
                onInput={(e: any) => {
                  setState(prev => ({ ...prev, proposalText: e.target.innerHTML, proposalManuallyEdited: true }));
                }}
                dangerouslySetInnerHTML={{ __html: state.proposalText }}
              />
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button 
                  onClick={() => copyToClipboard(state.proposalText)}
                  className="btn-secondary flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 text-[11px] sm:text-sm"
                >
                  <Copy size={13} className="sm:w-3.5 sm:h-3.5" /> Copy Proposal
                </button>
                <button 
                  onClick={() => {
                    const plainText = getPlainTextProposal(state.proposalText);
                    const subject = (state.proposalTemplate === 'followup' || state.proposalTemplate === 'followup2' || state.proposalTemplate === 'followup3')
                      ?`Re: quick idea for ${state.brand || 'Brand Name'}`
                      : `${state.contact || 'Client Name'} quick idea for ${state.brand || 'Brand Name'}`;
                    window.open(`mailto:${state.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`);
                  }}
                  className="btn-secondary flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 text-[11px] sm:text-sm"
                >
                  <Mail size={13} className="sm:w-3.5 sm:h-3.5" /> Send Email
                </button>
              </div>
            </section>

          </div>
        </div>

          {/* Right Column: Hero Dashboard */}
          <div className="w-full lg:w-[400px] lg:h-full lg:overflow-y-auto px-4 md:px-5 pt-6 pb-8 bg-black/10 border-t lg:border-t-0 lg:border-l border-border custom-scrollbar scroll-smooth">
            <div className="space-y-5">
              <div className="bg-surface border border-accent/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,242,237,0.05)] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-all duration-700" />
                
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/40 mb-1 block">Monthly Revenue Projection</span>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black tracking-tighter text-accent">
                    {formatCurrency(results.recovered, state.currency)}
                  </span>
                  <span className="text-[10px] font-bold text-accent/40">/ mo</span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={12} className="text-green" />
                  <span className="text-[10px] font-bold text-green uppercase tracking-wider">
                    {results.roi.toFixed(1)}x Projected ROI
                  </span>
                  <span className="text-accent/20 mx-1">·</span>
                  <span className="text-[10px] font-medium text-accent/40 uppercase tracking-wider">
                    {results.paybackDays} Day Payback
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-accent/40" />
                      <span className="text-[10px] font-bold text-accent/60 uppercase">Lost Carts</span>
                    </div>
                    <span className="text-xs font-bold">{results.abandonedCarts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <DollarSign size={12} className="text-accent/40" />
                      <span className="text-[10px] font-bold text-accent/60 uppercase">Lost Revenue</span>
                    </div>
                    <span className="text-xs font-bold">{formatCurrency(results.grossLost, state.currency)}</span>
                  </div>

                  <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-accent/60" />
                        <span className="text-[10px] font-bold uppercase text-accent/60">Current Recovery Rate (%)</span>
                      </div>
                      <span className="text-[9px] font-black p-1 rounded text-accent bg-accent/20">
                        {state.currentRateVal || '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-medium text-accent/40">Monthly Baseline</span>
                      <span className="text-sm font-black text-accent">{formatCurrency(results.currentRecovered, state.currency)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-green/10 border border-green/20">
                     <div className="flex items-center gap-2">
                      <Zap size={12} className="text-green" />
                      <span className="text-[10px] font-bold text-green uppercase">Target Recovery</span>
                    </div>
                    <span className="text-sm font-bold text-green">{formatCurrency(results.recovered, state.currency)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-accent/40 italic">Waterfall Projection</span>
                    <span className="text-[9px] font-bold text-accent/40">{((results.recovered / results.grossLost || 0) * 100).toFixed(1)}% Yield</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(results.recovered / results.grossLost || 0) * 100}%` }}
                      className="bg-green h-full shadow-[0_0_10px_#22c55e]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-[9px] font-black text-accent/30 uppercase tracking-[0.2em] mb-3">Underlying Value Signals</h3>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard 
                    label="Basket Upside" 
                    value={results.aovLift.toFixed(1) + "%"} 
                    icon={TrendingUp}
                    color={results.aovLift > 0 ? "green" : "default"}
                    subValue={results.aovLift > 0 ? "Estimated boost" : "Standard baseline"}
                  />
                  <MetricCard 
                    label="LTV Value / Cart" 
                    value={formatCurrency(results.ltvPerCart, state.currency)} 
                    icon={Search}
                    subValue={state.repeatRate ? `${state.repeatRate}% retention` : "Initial only"}
                  />
                  <MetricCard 
                    label="Effective Abandon" 
                    value={results.effectiveAbandon.toFixed(1) + "%"} 
                    icon={AlertCircle}
                    subValue={parseFloat(state.mobilePct) > 60 ? "mobile-weighted" : "natural rate"}
                  />
                  <MetricCard 
                    label="Current Recovery" 
                    value={formatCurrency(results.currentRecovered, state.currency)} 
                    icon={Clock}
                    color="default"
                    subValue={`${state.currentRateVal || '0'}% baseline`}
                  />
                  <div 
                    onClick={() => scrollToSection('sec-05')}
                    className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MetricCard 
                      label="Peak Season Ops" 
                      value={PEAK_SEASONS[state.peakSeason]?.label || "Default"} 
                      icon={Zap}
                      color={state.peakSeason !== 'none' ? "gold" : "green"}
                      subValue={state.peakSeason !== 'none' ? "High Priority" : "Strategy Priority"}
                    />
                  </div>
                  <div 
                    onClick={() => scrollToSection('sec-05')}
                    className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MetricCard 
                      label="ESP Environment" 
                      value={state.esp === 'none' ? 'None' : state.esp.charAt(0).toUpperCase() + state.esp.slice(1)} 
                      icon={CheckCircle2}
                      color={ESPS[state.esp]?.cls || 'amber' as any}
                      subValue={ESPS[state.esp]?.cls === 'green' ? "Native Integration" : "Manual Audit Required"}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {copyFeedback && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="fixed bottom-8 right-8 bg-accent text-bg px-6 py-3 rounded-full font-bold shadow-2xl z-[100] flex items-center gap-3"
                >
                  <Check size={18} />
                  {copyFeedback}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
