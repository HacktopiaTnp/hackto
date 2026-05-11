/**
 * FRONTEND DATA PERSISTENCE TEST
 * Run this in the browser console to test data flow
 * Open DevTools (F12) and paste the code below
 */

// ============================================
// TEST 1: HEALTH CHECK
// ============================================
console.log('%c=== TEST 1: HEALTH CHECK ===', 'color: blue; font-weight: bold; font-size: 14px');
fetch('http://localhost:3000/health')
    .then(res => res.json())
    .then(data => {
        console.log('✓ Backend is responding', data);
    })
    .catch(err => {
        console.error('✗ Backend health check failed:', err.message);
    });
// ============================================
// TEST 2: API INFO
// ============================================
console.log('%c=== TEST 2: API INFO ===', 'color: blue; font-weight: bold; font-size: 14px');

fetch('http://localhost:3000/info')
    .then(res => res.json())
    .then(data => {
        console.log('✓ API Info:', data);
    })
    .catch(err => {
        console.error('✗ API info check failed:', err.message);
    });
// ============================================
// TEST 3: CORS CHECK
// ============================================
console.log('%c=== TEST 3: CORS CHECK ===', 'color: blue; font-weight: bold; font-size: 14px');
fetch('http://localhost:3000/info', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(res => {
        console.log('✓ CORS is enabled');
        console.log('  Status:', res.status);
        return res.json();
    })
    .catch(err => {
        console.error('✗ CORS issue:', err.message);
    });

// ============================================
// TEST 4: TEST USER REGISTRATION (EXAMPLE)
// ============================================
console.log('%c=== TEST 4: REGISTRATION ENDPOINT ===', 'color: blue; font-weight: bold; font-size: 14px');
async function testRegistration() {
    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User'
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Registration successful');
            console.log('  User ID:', data.data?.user?.id);
            console.log('  Email:', data.data?.user?.email);
            console.log('  Token received:', !!data.data?.access_token);
            console.log('  Full Response:', data);
            
            // Save token to localStorage
            if (data.data?.access_token) {
                localStorage.setItem('access_token', data.data.access_token);
                localStorage.setItem('refresh_token', data.data.refresh_token);
                console.log('✓ Tokens saved to localStorage');
            }
        } else {
            console.error('✗ Registration failed:', data);
        }
    } catch (err) {
        console.error('✗ Registration error:', err.message);
    }
}

// Uncomment to run registration test:
// testRegistration();

// ============================================
// TEST 5: TEST PROTECTED ENDPOINT
// ============================================
console.log('%c=== TEST 5: PROTECTED ENDPOINT ===', 'color: blue; font-weight: bold; font-size: 14px');

async function testProtectedEndpoint() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        console.warn('⚠ No token found in localStorage');
        console.log('Run testRegistration() first to get a token');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/v1/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Protected endpoint accessed');
            console.log('  Response:', data);
        } else {
            console.error('✗ Protected endpoint failed:', data);
        }
    } catch (err) {
        console.error('✗ Protected endpoint error:', err.message);
    }
}

// Uncomment to run protected endpoint test:
// testProtectedEndpoint();

// ============================================
// TEST 6: CHECK LOCAL STORAGE
// ============================================
console.log('%c=== TEST 6: LOCAL STORAGE ===', 'color: blue; font-weight: bold; font-size: 14px');

const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

if (accessToken) {
    console.log('✓ Access Token found');
    try {
        const decoded = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('  Decoded:', decoded);
        console.log('  Expires at:', new Date(decoded.exp * 1000));
    } catch (e) {
        console.log('  (Could not decode token)');
    }
} else {
    console.log('⚠ No access token found');
}

if (refreshToken) {
    console.log('✓ Refresh Token found');
} else {
    console.log('⚠ No refresh token found');
}

// ============================================
// TEST 7: NETWORK ERRORS DIAGNOSIS
// ============================================
console.log('%c=== TEST 7: NETWORK DIAGNOSIS ===', 'color: blue; font-weight: bold; font-size: 14px');

async function networkDiagnosis() {
    console.log('Current Origin:', window.location.origin);
    console.log('Backend URL: http://localhost:3000');

    const endpoints = [
        'http://localhost:3000/health',
        'http://localhost:3000/info',
        'http://localhost/health'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            console.log(`✓ ${endpoint} - ${response.status}`);
        } catch (err) {
            console.error(`✗ ${endpoint} - ${err.message}`);
        }
    }
}

// Run diagnosis
networkDiagnosis();

// ============================================
// UTILITY FUNCTIONS
// ============================================

console.log('%c=== UTILITY FUNCTIONS ===', 'color: green; font-weight: bold; font-size: 14px');

// Clear all tokens
window.clearTokens = function() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('✓ Tokens cleared');
};

// Get current tokens
window.getTokens = function() {
    return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
    };
};

// Test registration (bound to a function)
window.testReg = testRegistration;
window.testProtected = testProtectedEndpoint;

console.log('Available functions:');
console.log('  testReg()           - Register a new test user');
console.log('  testProtected()     - Test protected endpoint');
console.log('  getTokens()         - Show current tokens');
console.log('  clearTokens()       - Clear all tokens');
console.log('  networkDiagnosis()  - Run network diagnosis');

console.log('%c=== TESTING COMPLETE ===', 'color: green; font-weight: bold; font-size: 14px');
