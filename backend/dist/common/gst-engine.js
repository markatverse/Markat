export function calculateStatutoryGst(input) {
    const grossAmount = Math.max(0, Number(input.grossAmount) || 0);
    const sectorUpper = (input.sector || '').toUpperCase();
    const bTypeUpper = (input.businessType || '').toUpperCase();
    const hasGst = Boolean(input.hasGst);
    const isInterState = Boolean(input.buyerState &&
        input.sellerState &&
        input.buyerState.trim().toLowerCase() !== input.sellerState.trim().toLowerCase());
    let baseCommission = 0;
    if (input.commissionType === 'FIXED') {
        baseCommission = Number(input.commissionRate) || 0;
    }
    else {
        const rate = input.commissionRate !== undefined && input.commissionRate > 0 ? Number(input.commissionRate) : 5.0;
        baseCommission = (grossAmount * rate) / 100 + (Number(input.fixedFee) || 0);
    }
    baseCommission = Math.round(baseCommission * 100) / 100;
    const commissionGstRate = 18;
    const commissionGst = Math.round(baseCommission * 0.18 * 100) / 100;
    let commissionCgst = 0;
    let commissionSgst = 0;
    let commissionIgst = 0;
    if (isInterState) {
        commissionIgst = commissionGst;
    }
    else {
        commissionCgst = Math.round((commissionGst / 2) * 100) / 100;
        commissionSgst = Math.round((commissionGst - commissionCgst) * 100) / 100;
    }
    const isFoodService = sectorUpper.includes('FOOD') || sectorUpper.includes('RESTAURANT') || bTypeUpper.includes('RESTAURANT');
    const isGeneralService = sectorUpper.includes('SERVICE') || bTypeUpper.includes('SERVICE');
    const isTcsApplicable = hasGst && !isFoodService && grossAmount > 0;
    const tcsRate = isTcsApplicable ? 1.0 : 0;
    const tcsAmount = isTcsApplicable ? Math.round(grossAmount * 0.01 * 100) / 100 : 0;
    let tcsCgst = 0;
    let tcsSgst = 0;
    let tcsIgst = 0;
    if (isTcsApplicable) {
        if (isInterState) {
            tcsIgst = tcsAmount;
        }
        else {
            tcsCgst = Math.round((tcsAmount / 2) * 100) / 100;
            tcsSgst = Math.round((tcsAmount - tcsCgst) * 100) / 100;
        }
    }
    let isEcoTaxApplicable = false;
    let ecoSection = null;
    let ecoTaxRate = 0;
    let ecoTaxAmount = 0;
    if (isFoodService) {
        isEcoTaxApplicable = true;
        ecoSection = 'Section 9(5) - Restaurant Services';
        ecoTaxRate = 5;
        ecoTaxAmount = Math.round(grossAmount * 0.05 * 100) / 100;
    }
    else if (isGeneralService && !hasGst) {
        isEcoTaxApplicable = true;
        ecoSection = 'Section 9(5) - Unregistered Home Services';
        ecoTaxRate = 18;
        ecoTaxAmount = Math.round(grossAmount * 0.18 * 100) / 100;
    }
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
//# sourceMappingURL=gst-engine.js.map