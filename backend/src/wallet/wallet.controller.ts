import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service.js';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('business/:businessId')
  async getWallet(@Param('businessId') businessId: string) {
    return this.walletService.getWallet(businessId);
  }

  @Get(':walletId/transactions')
  async getTransactions(@Param('walletId') walletId: string) {
    return this.walletService.getTransactions(walletId);
  }

  @Get('business/:businessId/banks')
  async getBankAccounts(@Param('businessId') businessId: string) {
    return this.walletService.getBankAccounts(businessId);
  }

  @Post('business/:businessId/banks')
  async addBankAccount(
    @Param('businessId') businessId: string,
    @Body() data: { accountName: string, accountNumber: string, ifscCode: string, bankName: string }
  ) {
    return this.walletService.addBankAccount(businessId, data);
  }

  @Post('business/:businessId/withdraw')
  async requestWithdrawal(
    @Param('businessId') businessId: string,
    @Body() body: { amount: number, bankAccountId: string }
  ) {
    return this.walletService.requestWithdrawal(businessId, body.amount, body.bankAccountId);
  }
  @Post('business/:businessId/pay-platform')
  async payPlatform(
    @Param('businessId') businessId: string,
    @Body() body?: { fromBalance?: boolean }
  ) {
    return this.walletService.payPlatform(businessId, body?.fromBalance ?? false);
  }
}

