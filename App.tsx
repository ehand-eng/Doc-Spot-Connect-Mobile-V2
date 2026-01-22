import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { DataProvider } from './src/DataContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import authentication screens
import MobileNumberInputScreen from './src/screens/MobileNumberInputScreen';
import OTPInputScreen from './src/screens/OTPInputScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import AccountScreen from './src/screens/AccountScreen';

// Import existing screens
import LandingScreen from './src/screens/LandingScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import DoctorListScreen from './src/screens/DoctorListScreen';
import DispensaryListScreen from './src/screens/DispensaryListScreen';
import AppointmentBookingScreen from './src/screens/AppointmentBookingScreen';
import AppointmentConfirmationScreen from './src/screens/AppointmentConfirmationScreen';
import AddDoctorScreen from './src/screens/AddDoctorScreen';
import AddDispensaryScreen from './src/screens/AddDispensaryScreen';

export type RootStackParamList = {
  MobileNumberInput: undefined;
  OTPInput: { mobileNumber: string };
  Registration: { mobileNumber: string };
  Account: undefined;
  Landing: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  DoctorList: undefined;
  DispensaryList: undefined;
  AppointmentBooking: { doctorId?: string; dispensaryId?: string };
  AppointmentConfirmation: { appointmentId: string; date: string; time: string };
  AddDoctor: undefined;
  AddDispensary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
      initialRouteName={isAuthenticated ? 'DoctorList' : 'MobileNumberInput'}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        // Authentication Stack
        <>
          <Stack.Screen
            name="MobileNumberInput"
            component={MobileNumberInputScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTPInput"
            component={OTPInputScreen}
            options={{
              title: 'Verify OTP',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="Registration"
            component={RegistrationScreen}
            options={{
              title: 'Create Account',
              headerBackVisible: false,
            }}
          />
        </>
      ) : (
        // Main App Stack (After Login)
        <>
          <Stack.Screen
            name="DoctorList"
            component={DoctorListScreen}
            options={{
              title: 'Available Doctors',
              headerRight: () => null,
            }}
          />
          <Stack.Screen
            name="DispensaryList"
            component={DispensaryListScreen}
            options={{ title: 'Nearby Dispensaries' }}
          />
          <Stack.Screen
            name="AppointmentBooking"
            component={AppointmentBookingScreen}
            options={{ title: 'Book Appointment' }}
          />
          <Stack.Screen
            name="AppointmentConfirmation"
            component={AppointmentConfirmationScreen}
            options={{ title: 'Confirmation' }}
          />
          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{ title: 'My Account' }}
          />
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminLogin"
            component={AdminLoginScreen}
            options={{ title: 'Admin Login' }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ title: 'Admin Dashboard' }}
          />
          <Stack.Screen
            name="AddDoctor"
            component={AddDoctorScreen}
            options={{ title: 'Add Doctor' }}
          />
          <Stack.Screen
            name="AddDispensary"
            component={AddDispensaryScreen}
            options={{ title: 'Add Dispensary' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
          <AppNavigator />
        </NavigationContainer>
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
