export interface GstSettlementInput {
    grossAmount: number;
    sector?: string | null;
    businessType?: string | null;
    hasGst?: boolean;
    commissionType?: string;
    commissionRate?: number;
    fixedFee?: number;
    buyerState?: string | null;
    sellerState?: string | null;
}
export interface GstSettlementBreakdown {
    grossAmount: number;
    baseCommission: number;
    commissionGstRate: number;
    commissionGst: number;
    commissionCgst: number;
    commissionSgst: number;
    commissionIgst: number;
    isInterState: boolean;
    sacCode: string;
    isTcsApplicable: boolean;
    tcsRate: number;
    tcsAmount: number;
    tcsCgst: number;
    tcsSgst: number;
    tcsIgst: number;
    isEcoTaxApplicable: boolean;
    ecoSection: string | null;
    ecoTaxRate: number;
    ecoTaxAmount: number;
    totalPlatformFee: number;
    totalPlatformDeduction: number;
    netSellerPayout: number;
}
export declare function calculateStatutoryGst(input: GstSettlementInput): GstSettlementBreakdown;
