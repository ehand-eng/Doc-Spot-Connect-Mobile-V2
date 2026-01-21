const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app');

// Check if MONGO_URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not defined in .env file');
  console.log('Please create a .env file in the backend directory with:');
  console.log('MONGO_URI=mongodb://localhost:27017/mynewapp');
  console.log('JWT_SECRET=your_jwt_secret_here');
  console.log('PORT=5000');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(async () => {
    console.log('MongoDB connected');
    // Fetch and print all data from all collections
    const Dispensary = require('./models/Dispensary');
    const Doctor = require('./models/Doctor');
    const Booking = require('./models/Booking');
    const TimeSlot = require('./models/TimeSlot');
    let timeslotConfigs = [];
    try {
      const dispensaries = await Dispensary.find();
      const doctors = await Doctor.find();
      const bookings = await Booking.find();
      // Use mongoose to access the collection directly
      timeslotConfigs = await mongoose.connection.db.collection('timeslotconfigs').find({}).toArray();
      console.log('All Dispensaries:', dispensaries);
      console.log('All Doctors:', doctors);
      console.log('All Bookings:', bookings);
      console.log('All TimeSlotConfigs:', timeslotConfigs);

      // Fetch and print time slots for specific doctorId and dispensaryId
      const doctorId = '6877e3a46d929285dda5e910';
      const dispensaryId = '6877e4486d929285dda5e925';
      // From TimeSlot model
      const timeSlots = await TimeSlot.find({ doctorId, dispensaryId });
      // From timeslotconfigs collection
      const timeslotConfigsFiltered = await mongoose.connection.db.collection('timeslotconfigs').find({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        dispensaryId: new mongoose.Types.ObjectId(dispensaryId)
      }).toArray();
      console.log(`TimeSlots for doctorId ${doctorId} and dispensaryId ${dispensaryId}:`, timeSlots);
      console.log(`TimeSlotConfigs for doctorId ${doctorId} and dispensaryId ${dispensaryId}:`, timeslotConfigsFiltered);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    // Start server after printing data
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err)); 