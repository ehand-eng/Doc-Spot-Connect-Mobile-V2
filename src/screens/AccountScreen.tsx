import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../contexts/AuthContext';

type AccountNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Account'>;

interface Props {
    navigation: AccountNavigationProp;
}

export default function AccountScreen({ navigation }: Props) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Navigation will be handled automatically by App.tsx
                            // when isAuthenticated changes to false
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const formatMobileNumber = (mobile: string) => {
        if (mobile.length === 10) {
            return `${mobile.slice(0, 3)}-${mobile.slice(3, 6)}-${mobile.slice(6)}`;
        }
        return mobile;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || '👤'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userMobile}>
                        +94 {user?.mobileNumber ? formatMobileNumber(user.mobileNumber) : 'N/A'}
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>👤</Text>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Full Name</Text>
                                    <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>📱</Text>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Mobile Number</Text>
                                    <Text style={styles.infoValue}>
                                        +94 {user?.mobileNumber ? formatMobileNumber(user.mobileNumber) : 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            {user?.email && (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.infoRow}>
                                        <View style={styles.iconContainer}>
                                            <Text style={styles.icon}>✉️</Text>
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Email</Text>
                                            <Text style={styles.infoValue}>{user.email}</Text>
                                        </View>
                                    </View>
                                </>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>🕐</Text>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Last Login</Text>
                                    <Text style={styles.infoValue}>{formatDate(user?.lastLogin)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('DoctorList')}
                        >
                            <Text style={styles.actionIcon}>🏥</Text>
                            <Text style={styles.actionText}>Browse Doctors</Text>
                            <Text style={styles.actionArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('DispensaryList')}
                        >
                            <Text style={styles.actionIcon}>💊</Text>
                            <Text style={styles.actionText}>Find Dispensaries</Text>
                            <Text style={styles.actionArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>MyClinic v1.0.0</Text>
                        <Text style={styles.footerSubtext}>Your Health, Our Priority</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 32,
        backgroundColor: '#4A90E2',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    userMobile: {
        fontSize: 16,
        color: '#E8F4FD',
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F4FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 20,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#95a5a6',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
    },
    divider: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
    },
    actionArrow: {
        fontSize: 24,
        color: '#95a5a6',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#95a5a6',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#bdc3c7',
    },
});
