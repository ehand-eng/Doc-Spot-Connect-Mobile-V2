/**
 * Test Script for Authentication API
 * 
 * This script tests the complete authentication flow:
 * 1. Check mobile number
 * 2. Register new user
 * 3. Check mobile again (should send OTP)
 * 4. Verify OTP
 * 5. Get user profile
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_MOBILE = '0771234567';
const TEST_USER = {
    name: 'Test User',
    mobileNumber: TEST_MOBILE,
    email: 'test@example.com'
};

let authToken = null;
let generatedOTP = null;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCheckMobile() {
    console.log('\n📱 Test 1: Check Mobile Number (New User)');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(`${BASE_URL}/users/mobile/${TEST_MOBILE}`);
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));

        if (response.data.userExists) {
            console.log('⚠️  User already exists. Please delete the user first or use a different number.');
            return false;
        }
        return true;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

async function testRegisterUser() {
    console.log('\n📝 Test 2: Register New User');
    console.log('='.repeat(60));

    try {
        const response = await axios.post(`${BASE_URL}/users`, TEST_USER);
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));

        if (response.data.token) {
            authToken = response.data.token;
            console.log('🔑 Token saved for later tests');
            return true;
        }
        return false;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

async function testCheckMobileExisting() {
    console.log('\n📱 Test 3: Check Mobile Number (Existing User - Should Send OTP)');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(`${BASE_URL}/users/mobile/${TEST_MOBILE}`);
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));

        if (response.data.otpSent) {
            console.log('📨 OTP sent! Check server console for the OTP code.');
            console.log('⏳ Waiting 2 seconds before continuing...');
            await delay(2000);
            return true;
        }
        return false;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

async function testVerifyOTP() {
    console.log('\n🔐 Test 4: Verify OTP');
    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: Check your server console for the OTP code!');
    console.log('This test will use a dummy OTP. In real testing, use the actual OTP from console.');

    // In development mode with SMS_PROVIDER=console, 
    // you need to manually enter the OTP from server console
    const testOTP = process.argv[2] || '1234'; // Accept OTP as command line argument

    console.log(`Using OTP: ${testOTP}`);

    try {
        const response = await axios.post(`${BASE_URL}/mobile/auth/verify-otp`, {
            mobileNumber: TEST_MOBILE,
            otp: testOTP
        });
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));

        if (response.data.token) {
            authToken = response.data.token;
            console.log('🔑 New token received and saved');
            return true;
        }
        return false;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        console.log('\n💡 TIP: Run this test again with: node test-auth.js <OTP_FROM_CONSOLE>');
        return false;
    }
}

async function testGetProfile() {
    console.log('\n👤 Test 5: Get User Profile (Protected Route)');
    console.log('='.repeat(60));

    if (!authToken) {
        console.log('❌ No auth token available. Previous tests may have failed.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

async function testResendOTP() {
    console.log('\n🔄 Test 6: Resend OTP');
    console.log('='.repeat(60));

    try {
        const response = await axios.post(`${BASE_URL}/mobile/auth/resend-otp`, {
            mobileNumber: TEST_MOBILE
        });
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('\n🚀 Starting Authentication API Tests');
    console.log('='.repeat(60));
    console.log('Base URL:', BASE_URL);
    console.log('Test Mobile:', TEST_MOBILE);
    console.log('='.repeat(60));

    const results = {
        passed: 0,
        failed: 0
    };

    // Test 1: Check mobile (should not exist)
    if (await testCheckMobile()) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n⚠️  Skipping remaining tests due to user already existing');
        printResults(results);
        return;
    }

    await delay(1000);

    // Test 2: Register user
    if (await testRegisterUser()) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n⚠️  Skipping remaining tests due to registration failure');
        printResults(results);
        return;
    }

    await delay(1000);

    // Test 3: Check mobile again (should send OTP)
    if (await testCheckMobileExisting()) {
        results.passed++;
    } else {
        results.failed++;
    }

    await delay(1000);

    // Test 4: Verify OTP (may fail without actual OTP)
    if (await testVerifyOTP()) {
        results.passed++;
    } else {
        results.failed++;
    }

    await delay(1000);

    // Test 5: Get profile
    if (await testGetProfile()) {
        results.passed++;
    } else {
        results.failed++;
    }

    await delay(1000);

    // Test 6: Resend OTP
    if (await testResendOTP()) {
        results.passed++;
    } else {
        results.failed++;
    }

    printResults(results);
}

function printResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Total: ${results.passed + results.failed}`);
    console.log('='.repeat(60));

    if (results.failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
});
