import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

type OTPInputNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTPInput'>;
type OTPInputRouteProp = RouteProp<RootStackParamList, 'OTPInput'>;

interface Props {
    navigation: OTPInputNavigationProp;
    route: OTPInputRouteProp;
}

export default function OTPInputScreen({ navigation, route }: Props) {
    const { mobileNumber } = route.params;
    const { login } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    // Timer for resend OTP
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs[0].current?.focus();
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        // Only allow numbers
        const cleaned = text.replace(/[^0-9]/g, '');

        if (cleaned.length > 1) {
            // Handle paste
            const digits = cleaned.split('').slice(0, 4);
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (i < 4) {
                    newOtp[i] = digit;
                }
            });
            setOtp(newOtp);

            // Focus on the next empty field or last field
            const nextIndex = Math.min(digits.length, 3);
            inputRefs[nextIndex].current?.focus();
        } else {
            // Single digit input
            const newOtp = [...otp];
            newOtp[index] = cleaned;
            setOtp(newOtp);

            // Auto-focus next field
            if (cleaned && index < 3) {
                inputRefs[index + 1].current?.focus();
            }

            // Auto-submit when all 4 digits are entered
            if (index === 3 && cleaned) {
                const fullOtp = [...newOtp];
                fullOtp[3] = cleaned;
                if (fullOtp.every(digit => digit !== '')) {
                    handleVerifyOTP(fullOtp.join(''));
                }
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerifyOTP = async (otpCode?: string) => {
        const otpValue = otpCode || otp.join('');

        if (otpValue.length !== 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.verifyOTP(mobileNumber, otpValue);

            if (response.token && response.user) {
                await login(response.token, response.user);
                // Navigate to main app (DoctorList or Dashboard)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DoctorList' }],
                });
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
            // Clear OTP on error
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;

        setResendLoading(true);

        try {
            await authService.resendOTP(mobileNumber);
            Alert.alert('Success', 'OTP has been resent to your mobile number');
            setTimer(60);
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Enter Verification Code</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 4-digit code to{'\n'}
                        <Text style={styles.phoneNumber}>+94 {mobileNumber}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            editable={!isLoading}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
                    onPress={() => handleVerifyOTP()}
                    disabled={isLoading || otp.some(digit => !digit)}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <Text style={styles.timerText}>
                            Resend code in {timer} seconds
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={handleResendOTP} disabled={resendLoading}>
                            {resendLoading ? (
                                <ActivityIndicator size="small" color="#4A90E2" />
                            ) : (
                                <Text style={styles.resendText}>Didn't receive? Resend OTP</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.changeNumberButton}
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                >
                    <Text style={styles.changeNumberText}>Change Mobile Number</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneNumber: {
        fontWeight: '600',
        color: '#4A90E2',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
    },
    otpInputFilled: {
        borderColor: '#4A90E2',
        backgroundColor: '#E8F4FD',
    },
    verifyButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#95a5a6',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    timerText: {
        fontSize: 14,
        color: '#95a5a6',
    },
    resendText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
    },
    changeNumberButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    changeNumberText: {
        fontSize: 16,
        color: '#7f8c8d',
        textDecorationLine: 'underline',
    },
});
