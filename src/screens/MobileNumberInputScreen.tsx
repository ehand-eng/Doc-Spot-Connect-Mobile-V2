import React, { useState } from 'react';
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
import { RootStackParamList } from '../../App';
import authService from '../services/authService';

type MobileNumberInputNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'MobileNumberInput'
>;

interface Props {
    navigation: MobileNumberInputNavigationProp;
}

export default function MobileNumberInputScreen({ navigation }: Props) {
    const [mobileNumber, setMobileNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatMobileNumber = (text: string) => {
        // Only allow numbers
        const cleaned = text.replace(/[^0-9]/g, '');
        // Limit to 10 digits
        return cleaned.substring(0, 10);
    };

    const handleContinue = async () => {
        // Validate mobile number
        if (mobileNumber.length !== 10) {
            Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.checkMobileNumber(mobileNumber);

            if (response.userExists) {
                // User exists - navigate to OTP screen
                navigation.navigate('OTPInput', { mobileNumber });
            } else {
                // New user - navigate to registration screen
                navigation.navigate('Registration', { mobileNumber });
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to verify mobile number. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>🏥</Text>
                    </View>
                    <Text style={styles.title}>Welcome to MyClinic</Text>
                    <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.countryCode}>+94</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="771234567"
                            placeholderTextColor="#95a5a6"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={mobileNumber}
                            onChangeText={(text) => setMobileNumber(formatMobileNumber(text))}
                            editable={!isLoading}
                        />
                    </View>
                    <Text style={styles.hint}>Enter your 10-digit mobile number</Text>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={isLoading || mobileNumber.length !== 10}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
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
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 40,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    countryCode: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: '#2c3e50',
        paddingVertical: 16,
    },
    hint: {
        fontSize: 14,
        color: '#95a5a6',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
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
    footer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#95a5a6',
        textAlign: 'center',
        lineHeight: 18,
    },
});
