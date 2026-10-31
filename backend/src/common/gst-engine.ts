/**
 * Statutory Indian Goods & Services Tax (GST) Engine for E-Commerce Marketplace Operators
 * 
 * Statutory Sections implemented:
 * 1. Section 9(1) of the CGST Act, 2017: 18% GST on Marketplace Commission (SAC 998319)
 * 2. Section 52 of the CGST Act, 2017: 1% Tax Collected at Source (TCS) on taxable supplies of goods (GSTR-8)
 * 3. Section 9(5) of the CGST Act, 2017: 5% GST on Restaurant & Cloud Kitchen food supplies (ECO liability)
 * 4. Section 9(5) of the CGST Act, 2017: 18% GST on Unregistered Home Services & Repairs
 */

export interface GstSettlementInput {
  grossAmount: number;
  sector?: string | null;           // e.g. 'RESTAURANT', 'FOOD', 'B2B', 'SERVICES', 'RETAIL'
  businessType?: string | null;     // e.g. 'WHOLESALER', 'MANUFACTURER', 'RETAILER', 'SERVICE'
  hasGst?: boolean;                 // whether seller has a valid GSTIN
  commissionType?: string;          // 'PERCENTAGE' or 'FIXED'
  commissionRate?: number;          // e.g. 10 (%) or 100 (₹)
  fixedFee?: number;
  buyerState?: string | null;
  sellerState?: string | null;
}

export interface GstSettlementBreakdown {
  grossAmount: number;
  
  // Section 9(1) Marketplace Commission & GST
  baseCommission: number;
  commissionGstRate: number;        // 18%
  commissionGst: number;            // 18% on baseCommission
  commissionCgst: number;           // 9% if intra-state
  commissionSgst: number;           // 9% if intra-state
  commissionIgst: number;           // 18% if inter-state
  isInterState: boolean;
  sacCode: string;                  // SAC 998319

  // Section 52 E-Commerce TCS (Tax Collected at Source on Goods)
  isTcsApplicable: boolean;
  tcsRate: number;                  // 1% (0.5% CGST + 0.5% SGST or 1% IGST)
  tcsAmount: number;
  tcsCgst: number;
  tcsSgst: number;
  tcsIgst: number;

  // Section 9(5) ECO Reverse Charge (Restaurant / Unregistered Services)
  isEcoTaxApplicable: boolean;
  ecoSection: string | null;
  ecoTaxRate: number;               // 5% (Restaurant) or 18% (Unregistered Service)
  ecoTaxAmount: number;

  // Total Platform Fees & Payout
  totalPlatformFee: number;         // baseCommission + commissionGst
  totalPlatformDeduction: number;   // totalPlatformFee + tcsAmount
  netSellerPayout: number;          // grossAmount - totalPlatformDeduction
}

export function calculateStatutoryGst(input: GstSettlementInput): GstSettlementBreakdown {
  const grossAmount = Math.max(0, Number(input.grossAmount) || 0);
  const sectorUpper = (input.sector || '').toUpperCase();
  const bTypeUpper = (input.businessType || '').toUpperCase();
  const hasGst = Boolean(input.hasGst);

  // 1. Determine Intra-state vs Inter-state
  const isInterState = Boolean(
    input.buyerState &&
    input.sellerState &&
    input.buyerState.trim().toLowerCase() !== input.sellerState.trim().toLowerCase()
  );

  // 2. Section 9(1) - Platform Commission
  let baseCommission = 0;
  if (input.commissionType === 'FIXED') {
    baseCommission = Number(input.commissionRate) || 0;
  } else {
    const rate = input.commissionRate !== undefined && input.commissionRate > 0 ? Number(input.commissionRate) : 5.0;
    baseCommission = (grossAmount * rate) / 100 + (Number(input.fixedFee) || 0);
  }
  baseCommission = Math.round(baseCommission * 100) / 100;

  // 18% GST on Commission (SAC 998319)
  const commissionGstRate = 18;
  const commissionGst = Math.round(baseCommission * 0.18 * 100) / 100;
  let commissionCgst = 0;
  let commissionSgst = 0;
  let commissionIgst = 0;

  if (isInterState) {
    commissionIgst = commissionGst;
  } else {
    commissionCgst = Math.round((commissionGst / 2) * 100) / 100;
    commissionSgst = Math.round((commissionGst - commissionCgst) * 100) / 100;
  }

  // 3. Section 52 - E-Commerce TCS (1% on net value of taxable supplies of goods by registered suppliers)
  const isFoodService = sectorUpper.includes('FOOD') || sectorUpper.includes('RESTAURANT') || bTypeUpper.includes('RESTAURANT');
  const isGeneralService = sectorUpper.includes('SERVICE') || bTypeUpper.includes('SERVICE');
  
  // TCS applies to goods suppliers under Section 52(1)
  const isTcsApplicable = hasGst && !isFoodService && grossAmount > 0;
  const tcsRate = isTcsApplicable ? 1.0 : 0;
  const tcsAmount = isTcsApplicable ? Math.round(grossAmount * 0.01 * 100) / 100 : 0;
  let tcsCgst = 0;
  let tcsSgst = 0;
  let tcsIgst = 0;

  if (isTcsApplicable) {
    if (isInterState) {
      tcsIgst = tcsAmount;
    } else {
      tcsCgst = Math.round((tcsAmount / 2) * 100) / 100;
      tcsSgst = Math.round((tcsAmount - tcsCgst) * 100) / 100;
    }
  }

  // 4. Section 9(5) - ECO Liability on Notified Services
  let isEcoTaxApplicable = false;
  let ecoSection: string | null = null;
  let ecoTaxRate = 0;
  let ecoTaxAmount = 0;

  if (isFoodService) {
    // 5% GST payable by ECO under Notif. 17/2021-CT(R)
    isEcoTaxApplicable = true;
    ecoSection = 'Section 9(5) - Restaurant Services';
    ecoTaxRate = 5;
    ecoTaxAmount = Math.round(grossAmount * 0.05 * 100) / 100;
  } else if (isGeneralService && !hasGst) {
    // 18% GST payable by ECO on services by unregistered individuals under Notif. 14/2017-CT(R)
    isEcoTaxApplicable = true;
    ecoSection = 'Section 9(5) - Unregistered Home Services';
    ecoTaxRate = 18;
    ecoTaxAmount = Math.round(grossAmount * 0.18 * 100) / 100;
  }

  // 5. Total Platform Deduction & Net Payout
  const totalPlatformFee = Math.round((baseCommission + commissionGst) * 100) / 100;
  const totalPlatformDeduction = Math.round((totalPlatformFee + tcsAmount) * 100) / 100;
  const netSellerPayout = Math.max(0, Math.round((grossAmount - totalPlatformDeduction) * 100) / 100);

  return {
    grossAmount,
    baseCommission,
    commissionGstRate,
    commissionGst,
    commissionCgst,
    commissionSgst,
    commissionIgst,
    isInterState,
    sacCode: '998319',
    isTcsApplicable,
    tcsRate,
    tcsAmount,
    tcsCgst,
    tcsSgst,
    tcsIgst,
    isEcoTaxApplicable,
    ecoSection,
    ecoTaxRate,
    ecoTaxAmount,
    totalPlatformFee,
    totalPlatformDeduction,
    netSellerPayout,
  };
}

