import { NicheData, EspData, PeakData, Tier, NicheId, EspId, PeakSeasonId } from './types';

export const NICHES: Record<NicheId, NicheData> = {
  supplements: {
    atc: 8,
    abandon: 72,
    aovBase: 75,
    famousBrand: "AG1",
    hint: "Avg AOV $60–110. Subscriptions are common, which means LTV is high even when AOV looks lower. Urgency and social proof drive the best recovery rates.",
    proposalMsg: "In the supplements space, trust is everything. I'll focus your recovery strategy on social proof and clear subscription benefits to keep customers coming back.",
  },
  fashion: {
    atc: 6,
    abandon: 76,
    aovBase: 90,
    famousBrand: "Nike",
    hint: "Avg AOV $70–130. This niche has the highest browse abandonment. Size and fit hesitation is the main drop-off reason, so address it in your recovery copy.",
    proposalMsg: "I've noticed that for apparel brands, sizing uncertainty is the main conversion killer. My plan addresses fit concerns and return policies directly in the sequence to salvage those sales.",
  },
  beauty: {
    atc: 7,
    abandon: 74,
    aovBase: 65,
    famousBrand: "Sephora",
    hint: "Avg AOV $50–90. Multi-product bundles common. Loyalty perks and free samples are strongest recovery hooks.",
    proposalMsg: "Beauty consumers respond well to education and sampling. I'll structure your recovery strategy around application tips and loyalty perks to bridge the gap from interest to purchase.",
  },
  homegood: {
    atc: 5,
    abandon: 70,
    aovBase: 110,
    famousBrand: "IKEA",
    hint: "Avg AOV $80–180. These have a longer decision cycle, so lead with reviews and easy returns rather than urgency.",
    proposalMsg: "Home and furniture purchases carry longer consideration cycles. I'll set up a multi-touch sequence that uses lifestyle imagery and social proof to support their decision process.",
  },
  electronics: {
    atc: 4,
    abandon: 68,
    aovBase: 180,
    famousBrand: "Apple",
    hint: "Avg AOV $120–350. High-research category. Social proof, comparisons, and warranty details outperform discount offers.",
    proposalMsg: "Tech buyers do heavy research. Instead of rushing a discount, I'll focus your recovery strategy on competitive differentiation and warranty assurances to win their confidence.",
  },
  pet: {
    atc: 9,
    abandon: 71,
    aovBase: 60,
    famousBrand: "Chewy",
    hint: "Avg AOV $45–90. Subscription-friendly. Emotional appeal and pet-specific personalisation work very well.",
    proposalMsg: "Pet owners buy on emotion. I'll build out your cart paths with personalized, pet-centric messaging that actually cuts through a crowded inbox.",
  },
  custom: {
    atc: 7,
    abandon: 72,
    aovBase: 80,
    famousBrand: "industry leaders",
    hint: "No benchmark defaults. Fill in your own values for an accurate projection.",
    proposalMsg: "",
  },
};

export const ESPS: Record<EspId, EspData> = {
  klaviyo: {
    cls: "green",
    msg: "Perfect fit. Klaviyo is the gold standard for Shopify cart recovery with deep native integration, predictive analytics, and best deliverability. Extremely easy to build on.",
    proposalMsg: "Since you're on Klaviyo, we can hit the ground running. I'll leverage its deep integration to build high-converting flows without any migration headache.",
  },
  mailchimp: {
    cls: "amber",
    msg: "Workable but limited. Mailchimp's Shopify cart data sync is unreliable. Worth migrating them to Klaviyo as part of your onboarding.",
    proposalMsg: "I'll optimize your Mailchimp setup, but we'll also look at whether a move to a more e-commerce focused engine would help scale your recovery ROI.",
  },
  omnisend: {
    cls: "green",
    msg: "Good platform. Solid Shopify integration with built-in SMS. Slightly less powerful than Klaviyo for segmentation but totally viable.",
    proposalMsg: "Using Omnisend allows us to seamlessly layer SMS directly into your email flows, so we can meet your customers on whatever channel they prefer.",
  },
  drip: {
    cls: "amber",
    msg: "Drip is declining with limited Shopify support. Consider suggesting a Klaviyo migration alongside your recovery service.",
    proposalMsg: "I can build the first iteration in Drip, but as we scale, I'd suggest we evaluate a move to a platform with tighter Shopify integration.",
  },
  none: {
    cls: "red",
    msg: "No ESP means maximum opportunity. They're currently recovering zero revenue, so any result you deliver is massive ROI compared to their baseline.",
    proposalMsg: "Since you're starting from scratch, I'll set up the foundational systems you need to stop the revenue leak and start building a robust recovery engine.",
  },
  other: {
    cls: "amber",
    msg: "Unknown tool, so be sure to confirm on the discovery call. The platform determines what's buildable and how fast you can launch.",
    proposalMsg: "I'll do a quick audit of your current platform to see exactly what we can build out and how to best optimize your recovery paths.",
  },
};

export const PEAK_SEASONS: Record<PeakSeasonId, PeakData> = {
  bfcm: {
    label: "BFCM approaching",
    color: "gold",
    msg: "With Black Friday / Cyber Monday coming up, this is a critical time. Every day without a recovery system is revenue you won't get back during your biggest month.",
  },
  holiday: {
    label: "Holiday season",
    color: "gold",
    msg: "The holiday season amplifies every cart. It's best to get started now, as flows take about 2 weeks to build and optimize.",
  },
  summer: {
    label: "Summer peak",
    color: "green",
    msg: "The summer peak is ahead. We should get these flows live before your traffic spikes.",
  },
  valentines: {
    label: "Valentine's coming",
    color: "gold",
    msg: "Valentine's Day is a high-AOV moment. Couples gifting pushes cart values up, making recovery flows especially high-yield right now.",
  },
  other: {
    label: "Peak season ahead",
    color: "gold",
    msg: "Peak season is approaching. It's the perfect time to get set up before your traffic spikes.",
  },
  none: { label: "No peak", color: "", msg: "" },
};

export const TIERS: Tier[] = [
  {
    id: 1,
    name: "Foundation",
    price: 1500,
    features: "Core email recovery setup (3-step flow), basic analytics, and technical ESP optimization",
  },
  {
    id: 2,
    name: "Growth",
    price: 2500,
    features: "A/B testing, SMS integration, advanced multi-touch flows, and custom post-purchase loyalty sync",
    badge: "Most Popular"
  },
  {
    id: 3,
    name: "Professional",
    price: 4000,
    features: "The full recovery stack: omnichannel flows (Email+SMS+Push), winbacks, browse-abandonment, and dedicated monthly strategy calls",
  }
];

export const CURRENCIES = [
  { label: "USD ($)", value: "$" },
  { label: "EUR (€)", value: "€" },
  { label: "GBP (£)", value: "£" },
  { label: "AUD (A$)", value: "A$" },
  { label: "INR (₹)", value: "₹" },
];
