import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your server IP address here
const API_BASE_URL = 'http://localhost:5001/api'; // Change to your server IP

export interface User {
    id: string;
    name: string;
    mobileNumber: string;
    email?: string;
    lastLogin?: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
    userExists?: boolean;
    otpSent?: boolean;
}

class AuthService {
    private token: string | null = null;

    /**
     * Check if mobile number exists and send OTP if it does
     */
    async checkMobileNumber(mobile: string): Promise<AuthResponse> {
        try {
            console.log('---------Checking mobile number...');
            const response = await axios.get(`${API_BASE_URL}/users/mobile/${mobile}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to check mobile number');
        }
    }

    /**
     * Verify OTP and login user
     */
    async verifyOTP(mobileNumber: string, otp: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/mobile/auth/verify-otp`, {
                mobileNumber,
                otp,
            });

            if (response.data.token) {
                await this.storeAuthData(response.data.token, response.data.user);
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to verify OTP');
        }
    }

    /**
     * Register new user
     */
    async registerUser(name: string, mobileNumber: string, email?: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, {
                name,
                mobileNumber,
                email,
            });

            if (response.data.token) {
                await this.storeAuthData(response.data.token, response.data.user);
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to register user');
        }
    }

    /**
     * Resend OTP
     */
    async resendOTP(mobileNumber: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/mobile/auth/resend-otp`, {
                mobileNumber,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to resend OTP');
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(): Promise<User> {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.user;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get user profile');
        }
    }

    /**
     * Store authentication data
     */
    private async storeAuthData(token: string, user: User): Promise<void> {
        try {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            this.token = token;
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Get stored token
     */
    async getToken(): Promise<string | null> {
        if (this.token) {
            return this.token;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            this.token = token;
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    /**
     * Get stored user
     */
    async getStoredUser(): Promise<User | null> {
        try {
            const userStr = await AsyncStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        if (!token) {
            return false;
        }

        try {
            // Verify token by calling profile endpoint
            await this.getUserProfile();
            return true;
        } catch (error) {
            // Token is invalid or expired
            await this.logout();
            return false;
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            this.token = null;
        } catch (error) {
            console.error('Error during logout:', error);
            throw new Error('Failed to logout');
        }
    }
}

export default new AuthService();
