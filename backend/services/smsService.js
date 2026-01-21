/**
 * SMS Service - Handles OTP SMS sending
 * 
 * This service can be configured to use different SMS providers
 * Currently supports:
 * - Dialog eSMS (Sri Lanka)
 * - Console logging (for development)
 */

const axios = require('axios');

class SMSService {
    constructor() {
        this.provider = process.env.SMS_PROVIDER || 'console'; // 'dialog', 'console'
        this.dialogConfig = {
            apiUrl: process.env.DIALOG_SMS_API_URL || 'https://https-api.dialog.lk/sms/send',
            authUrl: process.env.DIALOG_AUTH_URL || 'https://https-api.dialog.lk/token',
            clientId: process.env.DIALOG_CLIENT_ID,
            clientSecret: process.env.DIALOG_CLIENT_SECRET,
            senderId: process.env.DIALOG_SENDER_ID || 'MyClinic'
        };
        this.authToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Generate a 4-digit OTP
     */
    generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Format mobile number to international format
     * @param {string} mobile - Mobile number (e.g., "0771234567" or "771234567")
     * @returns {string} - Formatted number (e.g., "94771234567")
     */
    formatMobileNumber(mobile) {
        // Remove any spaces or dashes
        mobile = mobile.replace(/[\s-]/g, '');

        // If starts with 0, remove it
        if (mobile.startsWith('0')) {
            mobile = mobile.substring(1);
        }

        // If doesn't start with country code, add it
        if (!mobile.startsWith('94')) {
            mobile = '94' + mobile;
        }

        return mobile;
    }

    /**
     * Get Dialog API authentication token
     */
    async getDialogAuthToken() {
        // Return cached token if still valid
        if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.authToken;
        }

        try {
            const response = await axios.post(
                this.dialogConfig.authUrl,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.dialogConfig.clientId,
                    client_secret: this.dialogConfig.clientSecret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.authToken = response.data.access_token;
            // Set expiry to 5 minutes before actual expiry for safety
            this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

            return this.authToken;
        } catch (error) {
            console.error('Dialog auth error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with SMS provider');
        }
    }

    /**
     * Send OTP via Dialog eSMS
     */
    async sendDialogSMS(mobile, otp) {
        try {
            const token = await this.getDialogAuthToken();
            const formattedMobile = this.formatMobileNumber(mobile);

            const message = `Your MyClinic verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

            const response = await axios.post(
                this.dialogConfig.apiUrl,
                {
                    outboundSMSMessageRequest: {
                        address: [formattedMobile],
                        senderAddress: this.dialogConfig.senderId,
                        outboundSMSTextMessage: {
                            message: message
                        },
                        clientCorrelator: `OTP_${Date.now()}_${formattedMobile}`
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('SMS sent successfully via Dialog:', response.data);
            return {
                success: true,
                messageId: response.data?.outboundSMSMessageRequest?.deliveryInfoList?.deliveryInfo?.[0]?.messageId,
                provider: 'dialog'
            };
        } catch (error) {
            console.error('Dialog SMS error:', error.response?.data || error.message);

            // If auth error, retry once with new token
            if (error.response?.status === 401) {
                this.authToken = null;
                this.tokenExpiry = null;
                return this.sendDialogSMS(mobile, otp); // Retry once
            }

            throw new Error('Failed to send SMS via Dialog');
        }
    }

    /**
     * Send OTP via console (development mode)
     */
    async sendConsoleSMS(mobile, otp) {
        console.log('='.repeat(60));
        console.log('📱 SMS NOTIFICATION (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${mobile}`);
        console.log(`Message: Your MyClinic verification code is: ${otp}`);
        console.log(`Valid for: 5 minutes`);
        console.log('='.repeat(60));

        return {
            success: true,
            messageId: `console_${Date.now()}`,
            provider: 'console'
        };
    }

    /**
     * Main method to send OTP
     * @param {string} mobile - Mobile number
     * @param {string} otp - OTP code
     */
    async sendOTP(mobile, otp) {
        try {
            switch (this.provider) {
                case 'dialog':
                    return await this.sendDialogSMS(mobile, otp);

                case 'console':
                default:
                    return await this.sendConsoleSMS(mobile, otp);
            }
        } catch (error) {
            console.error('SMS Service Error:', error);
            // Fallback to console if provider fails
            if (this.provider !== 'console') {
                console.warn('Falling back to console SMS...');
                return await this.sendConsoleSMS(mobile, otp);
            }
            throw error;
        }
    }
}

module.exports = new SMSService();
