# MyClinic Backend - OTP Authentication System

## 🎯 Overview

This backend implements a complete OTP-based authentication system for the MyClinic mobile application. Users can register and login using their mobile number with a secure 4-digit OTP verification.

## ✨ Features

- ✅ **Mobile Number Validation** - Check if user exists
- ✅ **OTP Generation & Sending** - Secure 4-digit OTP with 5-minute expiry
- ✅ **OTP Verification** - Maximum 3 attempts, auto-cleanup
- ✅ **User Registration** - Create new accounts
- ✅ **JWT Authentication** - 30-day token validity
- ✅ **Protected Routes** - Middleware for authenticated endpoints
- ✅ **SMS Integration** - Support for Dialog eSMS and console mode
- ✅ **Secure OTP Storage** - Hashed with bcrypt

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/myclinic

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# SMS (use 'console' for development, 'dialog' for production)
SMS_PROVIDER=console

# Dialog eSMS (only needed if SMS_PROVIDER=dialog)
# DIALOG_CLIENT_ID=your_client_id
# DIALOG_CLIENT_SECRET=your_client_secret
# DIALOG_SENDER_ID=MyClinic
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:5000`

## 🧪 Testing

### Run the Test Suite

```bash
node test-auth.js
```

### Manual Testing with OTP

When the test reaches the OTP verification step, check your server console for the OTP code, then run:

```bash
node test-auth.js 1234  # Replace 1234 with actual OTP from console
```

### Using cURL

See `API_DOCUMENTATION.md` for detailed cURL examples.

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── doctorController.js
│   ├── dispensaryController.js
│   └── timeslotController.js
├── middleware/
│   └── authMiddleware.js      # JWT verification
├── models/
│   ├── User.js               # User schema
│   ├── OTP.js                # OTP schema
│   ├── Doctor.js
│   ├── Booking.js
│   └── ...
├── routes/
│   ├── user.js               # User routes
│   ├── mobileAuth.js         # OTP routes
│   ├── doctor.js
│   └── ...
├── services/
│   └── smsService.js         # SMS sending service
├── app.js                    # Express app setup
├── server.js                 # Server entry point
├── test-auth.js             # Test script
└── API_DOCUMENTATION.md     # Complete API docs
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/mobile/:mobile` | Check mobile & send OTP | No |
| POST | `/api/mobile/auth/verify-otp` | Verify OTP & login | No |
| POST | `/api/mobile/auth/resend-otp` | Resend OTP | No |
| POST | `/api/users` | Register new user | No |
| GET | `/api/users/profile` | Get user profile | Yes |

### Existing Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET/POST | `/api/doctors` | Doctor operations | TBD |
| GET/POST | `/api/dispensaries` | Dispensary operations | TBD |
| GET/POST | `/api/bookings` | Booking operations | TBD |
| GET/POST | `/api/timeslots` | Timeslot operations | TBD |

See `API_DOCUMENTATION.md` for complete details.

## 🔐 Security Features

1. **OTP Security**
   - 4-digit numeric OTP
   - 5-minute expiration
   - Maximum 3 verification attempts
   - Hashed storage using bcrypt
   - Auto-deletion after 10 minutes

2. **JWT Tokens**
   - 30-day validity
   - Secure signing with secret key
   - Includes user ID and mobile number

3. **Input Validation**
   - Mobile number format validation
   - Email format validation
   - Required field checks

4. **Rate Limiting** (Recommended for Production)
   - Add express-rate-limit
   - Limit OTP requests per mobile number

## 📱 SMS Configuration

### Development Mode (Console Output)

```env
SMS_PROVIDER=console
```

OTPs will be printed to the server console. Perfect for testing!

### Production Mode (Dialog eSMS)

```env
SMS_PROVIDER=dialog
DIALOG_CLIENT_ID=your_client_id
DIALOG_CLIENT_SECRET=your_client_secret
DIALOG_SENDER_ID=MyClinic
```

## 🔄 Authentication Flow

### New User Registration

```
1. User enters mobile number
   ↓
2. App calls: GET /api/users/mobile/:mobile
   ↓
3. Server responds: { userExists: false }
   ↓
4. App shows registration form
   ↓
5. User fills form and submits
   ↓
6. App calls: POST /api/users
   ↓
7. Server creates user and returns JWT token
   ↓
8. App stores token and navigates to Doctor Selection
```

### Existing User Login

```
1. User enters mobile number
   ↓
2. App calls: GET /api/users/mobile/:mobile
   ↓
3. Server responds: { userExists: true, otpSent: true }
   ↓
4. App shows OTP input (4 boxes)
   ↓
5. User enters OTP
   ↓
6. App calls: POST /api/mobile/auth/verify-otp
   ↓
7. Server verifies OTP and returns JWT token
   ↓
8. App stores token and navigates to Doctor Selection
```

## 🛠️ Development Tips

### Checking OTPs in Development

When `SMS_PROVIDER=console`, OTPs are printed like this:

```
============================================================
📱 SMS NOTIFICATION (Development Mode)
============================================================
To: 0771234567
Message: Your MyClinic verification code is: 1234
Valid for: 5 minutes
============================================================
```

### Testing with Postman

1. Import the endpoints from `API_DOCUMENTATION.md`
2. Set up environment variables
3. Test the complete flow

### Debugging

Enable detailed logging by adding to `.env`:

```env
NODE_ENV=development
DEBUG=*
```

## 🚨 Common Issues

### "MongoDB connection error"
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

### "Failed to send SMS"
- Check SMS provider configuration
- Verify Dialog credentials (if using Dialog)
- Use `SMS_PROVIDER=console` for development

### "Invalid token"
- Token may have expired (30-day validity)
- User needs to login again

### "OTP expired"
- OTPs expire after 5 minutes
- Request a new OTP

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Test Script](./test-auth.js) - Automated testing
- [Environment Example](./.env.example) - Configuration template

## 🤝 Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Follow Node.js best practices

## 📄 License

Private - MyClinic Application

## 📞 Support

For issues or questions, check the API documentation or contact the development team.

---

**Built with ❤️ for MyClinic**
