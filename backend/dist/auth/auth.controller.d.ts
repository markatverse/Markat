import { AuthService } from './auth.service.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(data: any, authHeader: string): Promise<{
        access_token: string;
        user: {
            id: any;
            markatId: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            business: any;
        };
    }>;
    login(data: any): Promise<{
        access_token: string;
        user: {
            id: any;
            markatId: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            business: any;
        };
    }>;
    phoneLogin(data: any): Promise<{
        access_token: string;
        user: {
            id: any;
            markatId: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            business: any;
        };
    }>;
    googleLogin(data: {
        token: string;
        role?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            markatId: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            business: any;
        };
    }>;
    getMe(authHeader: string): Promise<{
        id: string;
        markatId: string | null;
        email: string | null;
        phone: string | null;
        name: string;
        role: string;
        business: ({
            wallet: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                totalEarnings: number;
                pendingBalance: number;
                availableBalance: number;
                withdrawn: number;
                owedToPlatform: number;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            businessCode: string | null;
            userId: string;
            logo: string | null;
            description: string | null;
            businessModel: import(".prisma/client").$Enums.MainType;
            businessType: string;
            sector: string | null;
            address: string | null;
            pincode: string | null;
            latitude: number | null;
            longitude: number | null;
            gstNumber: string | null;
            panNumber: string | null;
            aadharNumber: string | null;
            idProofType: string | null;
            idProofUrl: string | null;
            businessHours: import("@prisma/client/runtime/library").JsonValue | null;
            verified: boolean;
            verificationStatus: string;
            verificationLevel: number;
            verificationNotes: string | null;
            kycCallStatus: string | null;
            kycNotes: string | null;
            capabilities: string[];
            maxListings: number;
            commissionType: string;
            commissionRate: number;
            subscriptionStatus: string;
            subscriptionStartDate: Date | null;
            subscriptionEndDate: Date | null;
            registrationFeePaid: boolean;
            registrationFeeAmount: number;
            registrationFeeStatus: string;
            registrationPaymentId: string | null;
            registrationFeeDate: Date | null;
        }) | null;
    }>;
    forgotPassword(identifier: string): Promise<{
        message: string;
        user_name: string;
    }>;
    resetPassword(data: {
        identifier: string;
        code: string;
        new_password: string;
    }): Promise<{
        message: string;
    }>;
    verifyResetCode(data: {
        identifier: string;
        code: string;
    }): Promise<{
        message: string;
    }>;
    sendSignupOtp(data: {
        identifier: string;
        type: string;
        phone?: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    verifySignupOtp(data: {
        identifier: string;
        code: string;
        type: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    sendSupportTicket(data: {
        name?: string;
        email: string;
        subject?: string;
        message: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
