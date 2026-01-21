# Mobile Authentication API Documentation

## Overview
This document describes the OTP-based authentication flow for the MyClinic mobile app.

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Flow

### 🔄 Complete User Journey

#### **New User Flow**
1. Enter mobile number → Check if exists (`GET /users/mobile/:mobile`)
2. If `userExists: false` → Show registration form
3. Submit registration → Register user (`POST /users`)
4. Receive JWT token → Navigate to Doctor Selection

#### **Existing User Flow**
1. Enter mobile number → Check if exists (`GET /users/mobile/:mobile`)
2. If `userExists: true` → OTP sent automatically
3. Enter 4-digit OTP → Verify OTP (`POST /mobile/auth/verify-otp`)
4. Receive JWT token → Navigate to Doctor Selection

---

## API Endpoints

### 1. Check Mobile Number & Send OTP

**Endpoint:** `GET /api/users/mobile/:mobile`

**Description:** Checks if a mobile number exists in the database. If the user exists, automatically generates and sends a 4-digit OTP via SMS.

**Request:**
```
GET /api/users/mobile/0771234567
```

**Response - User Exists:**
```json
{
  "success": true,
  "userExists": true,
  "otpSent": true,
  "message": "OTP sent successfully to your mobile number"
}
```

**Response - User Does Not Exist:**
```json
{
  "success": true,
  "userExists": false,
  "message": "Mobile number not registered. Please register."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Please provide a valid 10-digit mobile number"
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /api/mobile/auth/verify-otp`

**Description:** Verifies the OTP sent to the user's mobile number and returns a JWT token upon successful verification.

**Request Body:**
```json
{
  "mobileNumber": "0771234567",
  "otp": "1234"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "mobileNumber": "0771234567",
    "email": "john@example.com",
    "lastLogin": "2026-01-21T18:22:00.000Z"
  }
}
```

**Error Responses:**

*Invalid OTP:*
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

*OTP Expired:*
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

*Max Attempts Exceeded:*
```json
{
  "success": false,
  "message": "Maximum verification attempts exceeded. Please request a new OTP."
}
```

---

### 3. Register New User

**Endpoint:** `POST /api/users`

**Description:** Registers a new user and returns a JWT token.

**Request Body:**
```json
{
  "name": "John Doe",
  "mobileNumber": "0771234567",
  "email": "john@example.com"  // Optional
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "mobileNumber": "0771234567",
    "email": "john@example.com",
    "lastLogin": "2026-01-21T18:22:00.000Z"
  }
}
```

**Error Responses:**

*Missing Required Fields:*
```json
{
  "success": false,
  "message": "Name and mobile number are required"
}
```

*User Already Exists:*
```json
{
  "success": false,
  "message": "Mobile number already registered. Please login."
}
```

*Invalid Email:*
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

---

### 4. Resend OTP

**Endpoint:** `POST /api/mobile/auth/resend-otp`

**Description:** Resends a new OTP to the user's mobile number.

**Request Body:**
```json
{
  "mobileNumber": "0771234567"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found. Please register."
}
```

---

### 5. Get User Profile

**Endpoint:** `GET /api/users/profile`

**Description:** Retrieves the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "mobileNumber": "0771234567",
    "email": "john@example.com",
    "isActive": true,
    "lastLogin": "2026-01-21T18:22:00.000Z",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

*No Token Provided:*
```json
{
  "success": false,
  "message": "No token provided. Please login."
}
```

*Invalid/Expired Token:*
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

---

## Authentication Header

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## OTP Details

- **Format:** 4-digit numeric code
- **Validity:** 5 minutes
- **Max Attempts:** 3 attempts per OTP
- **Auto-deletion:** OTPs are automatically deleted after 10 minutes
- **Security:** OTPs are hashed before storage using bcrypt

---

## Mobile Number Format

- **Required Format:** 10 digits (e.g., `0771234567`)
- **No Special Characters:** No spaces, dashes, or parentheses
- **Leading Zero:** Can start with 0 (will be handled automatically)

---

## SMS Configuration

### Development Mode (Console)
Set in `.env`:
```
SMS_PROVIDER=console
```
OTPs will be printed to the server console.

### Production Mode (Dialog eSMS)
Set in `.env`:
```
SMS_PROVIDER=dialog
DIALOG_CLIENT_ID=your_client_id
DIALOG_CLIENT_SECRET=your_client_secret
DIALOG_SENDER_ID=MyClinic
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (Registration successful) |
| 400 | Bad Request (Invalid input) |
| 401 | Unauthorized (Invalid/expired token) |
| 404 | Not Found (User not found) |
| 500 | Internal Server Error |

---

## Testing with cURL

### Check Mobile Number
```bash
curl http://localhost:5000/api/users/mobile/0771234567
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/mobile/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"0771234567","otp":"1234"}'
```

### Register User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","mobileNumber":"0771234567","email":"john@example.com"}'
```

### Get User Profile
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Considerations

1. **JWT Tokens:** Valid for 30 days. Store securely on the client side.
2. **OTP Expiry:** 5 minutes to prevent replay attacks.
3. **Rate Limiting:** Consider implementing rate limiting in production.
4. **HTTPS:** Always use HTTPS in production.
5. **OTP Hashing:** OTPs are hashed before storage.
6. **Attempt Limits:** Maximum 3 verification attempts per OTP.

---

## Client-Side Implementation Notes

### Session Management
```typescript
// After successful login/registration
const { token, user } = response.data;

// Store token securely (AsyncStorage, SecureStore, etc.)
await SecureStore.setItemAsync('authToken', token);
await SecureStore.setItemAsync('user', JSON.stringify(user));

// Include token in subsequent requests
const token = await SecureStore.getItemAsync('authToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Logout
```typescript
// Clear session
await SecureStore.deleteItemAsync('authToken');
await SecureStore.deleteItemAsync('user');

// Redirect to login screen
navigation.navigate('MobileNumberInput');
```

### Auto-login Check
```typescript
// On app launch
const token = await SecureStore.getItemAsync('authToken');

if (token) {
  // Verify token is still valid
  try {
    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Token valid - navigate to main app
    navigation.navigate('DoctorSelection');
  } catch (error) {
    // Token invalid - clear and show login
    await SecureStore.deleteItemAsync('authToken');
    navigation.navigate('MobileNumberInput');
  }
} else {
  // No token - show login
  navigation.navigate('MobileNumberInput');
}
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  mobileNumber: String (unique, indexed),
  email: String (optional),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Collection
```javascript
{
  _id: ObjectId,
  mobileNumber: String,
  otp: String (hashed),
  otpExpiry: Date,
  attempts: Number,
  isVerified: Boolean,
  createdAt: Date (auto-expires after 10 minutes),
  updatedAt: Date
}
```
