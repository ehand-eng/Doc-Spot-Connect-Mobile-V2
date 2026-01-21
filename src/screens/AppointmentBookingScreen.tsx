import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,

  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDataContext } from '../DataContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { Alert } from 'react-native';
import TimeSlotComponent from '../components/timeslotComponent';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

function generateId() {
  return Date.now().toString();
}


// Helper function to generate available dates for the next 2 weeks
function generateAvailableDates() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      date: date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dateString: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    });
  }

  return dates;
}

type AppointmentBookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppointmentBooking'>;
type AppointmentBookingScreenRouteProp = RouteProp<RootStackParamList, 'AppointmentBooking'>;

interface Props {
  navigation: AppointmentBookingScreenNavigationProp;
  route: AppointmentBookingScreenRouteProp;
}

export default function AppointmentBookingScreen({ navigation }: Props) {
  const { doctors, dispensaries, loading: loadingData } = useDataContext();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDispensary, setSelectedDispensary] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentNumber, setAppointmentNumber] = useState<string>('1');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [filteredDispensaries, setFilteredDispensaries] = useState(dispensaries);
  const [availableDates] = useState(generateAvailableDates());
  const [fetchedTimeSlots, setFetchedTimeSlots] = useState<any[]>([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null);

  useEffect(() => {

    console.log('useEffect: selectedDoctor changed:', selectedDoctor);

  }, [selectedDoctor]);

  useEffect(() => {
    console.log(
      'Welcome!',
      'This alert shows when the app starts.'
    );
  }, []); // Empty dependency array = run once on mount // empty dependency array = run only on mount

  // Fetch time slots when doctor and dispensary are selected and step === 2
  useEffect(() => {
    console.log('Befroe ferch');
    const fetchTimeSlots = async () => {
      console.log('After ferch');
      if (step === 2 && selectedDoctor && selectedDispensary) {
        setTimeSlotsLoading(true);
        setTimeSlotsError(null);
        setFetchedTimeSlots([]);
        try {
          // Use both doctorId and dispensaryId in the API call
          const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
          const url = `${baseUrl}/api/timeslots/next-available/${selectedDoctor}/${selectedDispensary}`;
          console.log('Fetching:', url);
          const response = await fetch(url);
          console.log('Response status:', response.status);
          let data = null;
          try {
            data = await response.json();
            console.log('Response JSON:', data);
          } catch (jsonErr) {
            console.log('Error parsing JSON:', jsonErr);
            setTimeSlotsError('Error parsing JSON: ' + jsonErr);
            return;
          }
          if (!response.ok) {
            setTimeSlotsError('API error: ' + JSON.stringify(data));
            return;
          }
          // Flatten availableDays into time slots
          let slots = [];
          if (data && Array.isArray(data.availableDays)) {
            slots = data.availableDays.map((day: any) => ({
              date: day.date,
              dayName: day.dayName,
              startTime: day.startTime,
              endTime: day.endTime
            }));
          }
          setFetchedTimeSlots(slots);
        } catch (err: any) {
          console.log('Fetch error:', err);
          setTimeSlotsError('Fetch error: ' + (err.message || 'Error fetching time slots'));
        } finally {
          setTimeSlotsLoading(false);
        }
        return;
      }
    };
    fetchTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDoctor, selectedDispensary]);

  // Helper to get end time (e.g., "09:00" -> "09:30")
  function getEndTime(startTime: string) {
    const [hour, minute] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute + 30);
    return date.toTimeString().slice(0, 5);
  }

  const handleBookNow = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(2);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedDoctor || !selectedDispensary) {
        Alert.alert('Error', 'Please select a doctor and dispensary.');
        return;
      }
    }
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        Alert.alert('Error', 'Please select a date and time slot.');
        return;
      }
    }
    if (step === 3) {
      if (!patientName || !patientPhone || !patientEmail) {
        Alert.alert('Error', 'Please fill in all user details.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const bookingData = {
      patientId: "temp-0762199100", // Replace with actual patient ID
      selectedDoctor,
      dispensaryId: selectedDispensary,
      bookingDate: selectedDate,
      timeSlot: `${selectedTime}-${getEndTime(selectedTime)}`,
      appointmentNumber: Number(appointmentNumber),
      estimatedTime: selectedTime,
      status: "scheduled",
      symptoms: symptoms,
      isPaid: false,
      isPatientVisited: false,
      patientName: patientName,
      patientPhone: patientPhone,
      patientEmail: patientEmail,
    };
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
      const response = await axios.post(`${baseUrl}/api/bookings`, bookingData);
      setBookingDetails(response.data);
      setConfirmed(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save booking.');
    } finally {
      setLoading(false);
    }
  };

  async function findNearbyDispensaries() {
    console.log('=== FINDING NEARBY DISPENSARIES ===');
    console.log('All dispensaries from database:', dispensaries);
    console.log('Dispensaries with coordinates:');
    dispensaries.forEach((disp, index) => {
      console.log(`${index + 1}. ${disp.name}: lat=${disp.latitude}, lng=${disp.longitude}`);
    });


    setLocationLoading(true);
    try {
      // Request permission (Android)
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Location permission is required to find nearby dispensaries.');
          setLocationLoading(false);
          return;
        }
      }

      // For iOS, permissions are handled in Info.plist
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          // console.log('User location:', { latitude, longitude });
          console.log('=== USER LOCATION DETECTED ===');
          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);
          console.log('Coordinates:', { latitude, longitude });
          console.log('===============================');

          const filtered = dispensaries.filter(d => {
            const distance = getDistanceFromLatLonInKm(latitude, longitude, d.latitude, d.longitude);
            console.log(`Distance to ${d.name}: ${distance.toFixed(2)}km`);
            return distance <= 1;
          });

          console.log('Filtered dispensaries within 1km:', filtered);
          console.log('Number of nearby dispensaries found:', filtered.length);

          setFilteredDispensaries(filtered);
          setNearbyMode(true);

          if (filtered.length === 0) {
            Alert.alert(
              'No nearby dispensaries',
              'No dispensaries found within 1km of your location. Try selecting from all dispensaries instead.'
            );
          } else {
            Alert.alert(
              'Nearby dispensaries found',
              `Found ${filtered.length} dispensary(ies) within 1km of your location.`
            );
          }
          setLocationLoading(false);
        },
        error => {
          console.error('Geolocation error:', error);
          Alert.alert(
            'Location Error',
            'Could not get your location. Please check your GPS settings and try again.'
          );
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      console.error('Location permission error:', e);
      Alert.alert('Error', 'Could not access location services. Please check your permissions.');
      setLocationLoading(false);
    }
  }

  function showAllDispensaries() {
    setFilteredDispensaries(dispensaries);
    setNearbyMode(false);
  }

  const handleDoctorChange = (id: string) => {
    setSelectedDoctor(id);
    console.log('Selected doctorId:', id);
  };

  const handleDispensaryChange = (id: string) => {
    setSelectedDispensary(id);
    console.log('Selected dispensaryId:', id);
  };

  if (confirmed && bookingDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmationBox}>
          <Text style={styles.headerTitle}>Booking Confirmed!</Text>
          <Text style={styles.confirmationText}>Doctor: {bookingDetails.doctor}</Text>
          <Text style={styles.confirmationText}>Dispensary: {bookingDetails.dispensary}</Text>
          <Text style={styles.confirmationText}>Date: {selectedDate?.toLocaleDateString()}</Text>
          <Text style={styles.confirmationText}>Time: {selectedTime} - {getEndTime(selectedTime)}</Text>
          <Text style={styles.confirmationText}>Appointment Number: {bookingDetails.appointmentNumber}</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
        </View>
        <View style={styles.form}>
          {step === 1 && (
            <>
              <Text style={styles.label}>Select Doctor</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedDoctor}
                  onValueChange={handleDoctorChange}
                  enabled={!loadingData}
                >
                  <Picker.Item label="Select a doctor..." value="" />
                  {doctors.map(doc => (
                    <Picker.Item key={doc.id} label={doc.name} value={doc.id} />
                  ))}
                </Picker>
              </View>

              {selectedDoctor ? (
                <>
                  <Text style={styles.label}>Select Dispensary</Text>
                  {nearbyMode && (
                    <View style={styles.nearbyIndicator}>
                      <Text style={styles.nearbyText}>📍 Showing nearby dispensaries (within 1km)</Text>
                    </View>
                  )}
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedDispensary}
                      onValueChange={handleDispensaryChange}
                      enabled={!loadingData}
                    >
                      <Picker.Item label="Select a dispensary..." value="" />
                      {filteredDispensaries.map(disp => (
                        <Picker.Item key={disp.id} label={disp.name} value={disp.id} />
                      ))}
                    </Picker>
                  </View>
                  <TouchableOpacity
                    onPress={findNearbyDispensaries}
                    style={[
                      styles.submitButton,
                      locationLoading && { backgroundColor: '#6c757d', opacity: 0.7 }
                    ]}
                    disabled={locationLoading}
                  >
                    <Text style={styles.submitButtonText}>
                      {locationLoading ? 'Finding nearby dispensaries...' : 'Find dispensaries near me'}
                    </Text>
                  </TouchableOpacity>
                  {nearbyMode && (
                    <TouchableOpacity onPress={showAllDispensaries} style={[styles.submitButton, styles.secondaryButton]}>
                      <Text style={styles.submitButtonText}>Show all dispensaries</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleNextStep}>
                <Text style={styles.submitButtonText}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Available Time Slots</Text>
              <Text style={styles.subLabel}>Select a time slot to book your appointment</Text>
              {timeSlotsLoading && <Text>Loading time slots...</Text>}
              {timeSlotsError && <Text style={{ color: 'red' }}>{timeSlotsError}</Text>}
              {!timeSlotsLoading && !timeSlotsError && fetchedTimeSlots.length === 0 && (
                <Text>No available time slots found.</Text>
              )}
              {!timeSlotsLoading && !timeSlotsError && fetchedTimeSlots.length > 0 && (
                <View>
                  {fetchedTimeSlots.map((slot, idx) => (
                    <TimeSlotComponent
                      key={idx}
                      date={slot.date ? new Date(slot.date).toLocaleDateString() : ''}
                      time={slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.time || ''}
                      onSelect={() => {
                        setSelectedTime(slot.startTime || slot.time || '');
                        setSelectedDate(slot.date ? new Date(slot.date) : new Date());
                        handleNextStep();
                      }}
                    />
                  ))}
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginRight: 8 }]} onPress={handlePrevStep}>
                  <Text style={styles.submitButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter your name"
              />

              <Text style={styles.label}>Patient Phone</Text>
              <TextInput
                style={styles.input}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Patient Email</Text>
              <TextInput
                style={styles.input}
                value={patientEmail}
                onChangeText={setPatientEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Symptoms</Text>
              <TextInput
                style={styles.input}
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder="Describe your symptoms"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginRight: 8 }]} onPress={handlePrevStep}>
                  <Text style={styles.submitButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginLeft: 8 }]} onPress={handleNextStep}>
                  <Text style={styles.submitButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.headerTitle}>Confirm Your Booking</Text>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.confirmationText}>Doctor: {doctors.find(d => d.id === selectedDoctor)?.name}</Text>
                <Text style={styles.confirmationText}>Dispensary: {dispensaries.find(d => d.id === selectedDispensary)?.name}</Text>
                <Text style={styles.confirmationText}>Date: {selectedDate?.toLocaleDateString()}</Text>
                <Text style={styles.confirmationText}>Time: {selectedTime} - {getEndTime(selectedTime)}</Text>
                <Text style={styles.confirmationText}>Appointment #: {appointmentNumber}</Text>
                <Text style={styles.confirmationText}>Patient Name: {patientName}</Text>
                <Text style={styles.confirmationText}>Phone: {patientPhone}</Text>
                <Text style={styles.confirmationText}>Email: {patientEmail}</Text>
                <Text style={styles.confirmationText}>Symptoms: {symptoms}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginRight: 8 }]} onPress={handlePrevStep}>
                  <Text style={styles.submitButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginLeft: 8 }]} onPress={handleConfirm} disabled={loading}>
                  <Text style={styles.submitButtonText}>{loading ? 'Booking...' : 'Confirm Booking'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  col: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  bookNowText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  nearbyIndicator: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  nearbyText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    marginTop: 8,
  },
});
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

