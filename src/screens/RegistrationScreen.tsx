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
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

type RegistrationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registration'>;
type RegistrationRouteProp = RouteProp<RootStackParamList, 'Registration'>;

interface Props {
    navigation: RegistrationNavigationProp;
    route: RegistrationRouteProp;
}

export default function RegistrationScreen({ navigation, route }: Props) {
    const { mobileNumber } = route.params;
    const { login } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        // Validate name
        if (!name.trim()) {
            Alert.alert('Required Field', 'Please enter your name');
            return;
        }

        if (name.trim().length < 2) {
            Alert.alert('Invalid Name', 'Name must be at least 2 characters long');
            return;
        }

        // Validate email if provided
        if (email && !validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.registerUser(
                name.trim(),
                mobileNumber,
                email.trim() || undefined
            );

            if (response.token && response.user) {
                await login(response.token, response.user);

                // Show success message
                Alert.alert(
                    'Registration Successful',
                    'Welcome to MyClinic!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate to main app
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'DoctorList' }],
                                });
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Failed to register. Please try again.');
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Your Account</Text>
                        <Text style={styles.subtitle}>Just a few details to get started</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Full Name <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#95a5a6"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={styles.disabledInputContainer}>
                                <Text style={styles.countryCode}>+94</Text>
                                <Text style={styles.disabledInput}>{mobileNumber}</Text>
                            </View>
                            <Text style={styles.hint}>This number will be used for login</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor="#95a5a6"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <Text style={styles.hint}>We'll send appointment confirmations here</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            <Text style={styles.backButtonText}>← Change Mobile Number</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By creating an account, you agree to our{'\n'}
                            <Text style={styles.link}>Terms of Service</Text> and{' '}
                            <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </View>
                </ScrollView>
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
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 24,
        marginBottom: 32,
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
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    required: {
        color: '#e74c3c',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2c3e50',
    },
    disabledInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    countryCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
        marginRight: 8,
    },
    disabledInput: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    hint: {
        fontSize: 13,
        color: '#95a5a6',
        marginTop: 6,
    },
    registerButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
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
    backButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 13,
        color: '#95a5a6',
        textAlign: 'center',
        lineHeight: 20,
    },
    link: {
        color: '#4A90E2',
        fontWeight: '500',
    },
});
