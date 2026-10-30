const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper for HTTP requests
function makeRequest(method, urlPath, data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const headers = {};
    let postData = null;

    if (data) {
      postData = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('[Test 1] Health Check Endpoint');
    const health = await makeRequest('GET', '/api/health');
    assert(health.statusCode === 200, 'Health check returns status 200');
    assert(health.body.status === 'online', 'Server status is "online"');

    // 2. Public Complaint Statistics
    console.log('\n[Test 2] Public Complaint Statistics (Live SQLite Aggregation)');
    const stats = await makeRequest('GET', '/api/complaints/stats');
    assert(stats.statusCode === 200, 'Stats endpoint returns status 200');
    assert(stats.body.success === true, 'Stats response success is true');
    assert(typeof stats.body.stats.total === 'number' && stats.body.stats.total >= 8, `Total complaints count is ${stats.body.stats.total} (>= 8)`);
    assert(typeof stats.body.stats.pending === 'number', `Pending complaints count is ${stats.body.stats.pending}`);
    assert(typeof stats.body.stats.in_progress === 'number', `In-progress complaints count is ${stats.body.stats.in_progress}`);
    assert(typeof stats.body.stats.resolved === 'number', `Resolved complaints count is ${stats.body.stats.resolved}`);

    // 3. Citizen Registration Validation (Negative Test)
    console.log('\n[Test 3] Registration Validation & Error Handling');
    const invalidReg = await makeRequest('POST', '/api/complaints', {
      citizen_name: '',
      mobile_number: '123', // invalid length
      category: 'InvalidCategory',
      title: 'hi', // too short
      description: 'short'
    });
    assert(invalidReg.statusCode === 400, 'Invalid registration rejected with status 400');
    assert(invalidReg.body.success === false, 'Error response success is false');
    assert(invalidReg.body.errors.citizen_name !== undefined, 'Citizen name error captured');
    assert(invalidReg.body.errors.mobile_number !== undefined, 'Mobile number format error captured');
    assert(invalidReg.body.errors.category !== undefined, 'Category error captured');
    assert(invalidReg.body.errors.title !== undefined, 'Title length error captured');

    // 4. Citizen Registration Successful Submission (Positive Test)
    console.log('\n[Test 4] Successful Complaint Submission & Tracking ID Generation');
    const validReg = await makeRequest('POST', '/api/complaints', {
      citizen_name: 'Dev Test Citizen',
      mobile_number: '9876501234',
      email: 'dev.citizen@test.local',
      category: 'Road Damage',
      title: 'Test Pothole on Sector 4 Main Cross',
      description: 'Extensive test pothole causing slow traffic. Needs urgent asphalt overlay.',
      ward_number: '15',
      locality: 'Sector 4 Extension',
      landmark: 'Near Water Fountain'
    });

    assert(validReg.statusCode === 201, 'Successful registration returns status 201');
    assert(validReg.body.success === true, 'Success flag is true');
    assert(typeof validReg.body.tracking_id === 'string', `Generated tracking ID: ${validReg.body.tracking_id}`);
    assert(/^MCR-\d{4}-\d{6}$/.test(validReg.body.tracking_id), 'Tracking ID matches format MCR-YYYY-XXXXXX');
    const newTrackingId = validReg.body.tracking_id;

    // 5. Track Complaint with Valid ID & Privacy Check
    console.log('\n[Test 5] Complaint Tracking & Citizen Privacy Protection');
    const trackRes = await makeRequest('GET', `/api/complaints/track/${newTrackingId}`);
    assert(trackRes.statusCode === 200, 'Tracking existing ID returns 200');
    assert(trackRes.body.complaint.tracking_id === newTrackingId, 'Returned tracking ID matches query');
    assert(trackRes.body.complaint.status === 'Pending', 'Initial status is "Pending"');
    assert(trackRes.body.complaint.mobile_number === undefined, 'Mobile number is NOT exposed publicly');
    assert(trackRes.body.complaint.email === undefined, 'Email address is NOT exposed publicly');
    assert(trackRes.body.complaint.citizen_name.includes('*'), `Citizen name is masked for privacy: "${trackRes.body.complaint.citizen_name}"`);
    assert(Array.isArray(trackRes.body.history) && trackRes.body.history.length >= 1, 'Initial status history recorded');

    // 6. Track Complaint with Invalid ID (Negative Test)
    console.log('\n[Test 6] Complaint Tracking with Non-Existent ID');
    const invalidTrack = await makeRequest('GET', '/api/complaints/track/MCR-9999-000000');
    assert(invalidTrack.statusCode === 404, 'Non-existent ID returns status 404');
    assert(invalidTrack.body.success === false, 'Success flag is false');
    assert(invalidTrack.body.message.includes('No complaint found'), 'Clear error message returned');

    // 7. Administrator Login (Negative & Positive)
    console.log('\n[Test 7] Administrator Login & Session Verification');
    const badLogin = await makeRequest('POST', '/api/admin/login', {
      username: 'admin',
      password: 'wrongpassword'
    });
    assert(badLogin.statusCode === 401, 'Wrong password returns status 401');

    const goodLogin = await makeRequest('POST', '/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    assert(goodLogin.statusCode === 200, 'Correct credentials return status 200');
    assert(goodLogin.body.success === true, 'Admin login success is true');

    // Capture Session Cookie
    const rawCookies = goodLogin.headers['set-cookie'];
    assert(rawCookies && rawCookies.length > 0, 'Session cookie received');
    const sessionCookie = rawCookies ? rawCookies[0].split(';')[0] : null;

    // 8. Admin Session Check (/api/admin/me)
    console.log('\n[Test 8] Admin Session Persistence Check (/api/admin/me)');
    const meRes = await makeRequest('GET', '/api/admin/me', null, sessionCookie);
    assert(meRes.statusCode === 200, 'Me check returns status 200');
    assert(meRes.body.authenticated === true, 'Session is authenticated');
    assert(meRes.body.user.username === 'admin', 'User is "admin"');

    // 9. Admin Dashboard Metrics
    console.log('\n[Test 9] Administrator Dashboard Data');
    const adminDash = await makeRequest('GET', '/api/admin/dashboard', null, sessionCookie);
    assert(adminDash.statusCode === 200, 'Admin dashboard returns 200');
    assert(adminDash.body.stats.total >= 9, `Admin dashboard reflects updated total: ${adminDash.body.stats.total}`);

    // 10. Admin Complaints List & Search
    console.log('\n[Test 10] Admin Complaint List & Search');
    const listRes = await makeRequest('GET', `/api/admin/complaints?search=${newTrackingId}`, null, sessionCookie);
    assert(listRes.statusCode === 200, 'Admin complaints search returns 200');
    assert(listRes.body.complaints.length === 1, 'Search finds exactly the created complaint');
    const complaintToUpdate = listRes.body.complaints[0];
    assert(complaintToUpdate.mobile_number === '9876501234', 'Admin CAN see citizen phone for follow-up verification');

    // 11. Admin Status Update & Audit Trail
    console.log('\n[Test 11] Administrator Status Update & Audit Logging');
    const updateRes = await makeRequest(
      'PATCH',
      `/api/admin/complaints/${complaintToUpdate.id}/status`,
      {
        status: 'In Progress',
        admin_note: 'Road maintenance contractor deployed hot-mix asphalt crew to Sector 4.'
      },
      sessionCookie
    );

    assert(updateRes.statusCode === 200, 'Status update returns status 200');
    assert(updateRes.body.complaint.status === 'In Progress', 'Status updated to "In Progress"');
    const historyEntries = updateRes.body.history;
    const latestHistory = historyEntries[historyEntries.length - 1];
    assert(latestHistory.new_status === 'In Progress', 'Audit trail records new status "In Progress"');
    assert(latestHistory.admin_note.includes('hot-mix asphalt'), 'Audit trail records admin explanation');

    // 12. Verify Citizen Tracking Reflects Updated Stage
    console.log('\n[Test 12] Citizen Public Tracking Reflects Live Admin Updates');
    const updatedTrack = await makeRequest('GET', `/api/complaints/track/${newTrackingId}`);
    assert(updatedTrack.body.complaint.status === 'In Progress', 'Citizen sees updated status "In Progress"');
    assert(updatedTrack.body.history.length === 2, 'Citizen sees 2 history stages');

    // 13. Production Build Static Serving
    console.log('\n[Test 13] Production Build Static File Serving (Single Server Mode)');
    const indexHtml = await makeRequest('GET', '/');
    assert(indexHtml.statusCode === 200, 'Root path "/" returns status 200');
    assert(typeof indexHtml.body === 'string' && indexHtml.body.includes('Municipal Complaint Registration Portal'), 'Index HTML serves the React Single-Page Application');

    // 14. Admin Logout
    console.log('\n[Test 14] Administrator Logout');
    const logoutRes = await makeRequest('POST', '/api/admin/logout', {}, sessionCookie);
    assert(logoutRes.statusCode === 200, 'Logout returns status 200');

    // Verify session revoked
    const postLogoutMe = await makeRequest('GET', '/api/admin/me', null, sessionCookie);
    assert(postLogoutMe.body.authenticated === false, 'Session successfully invalidated');

  } catch (error) {
    console.error('Fatal test execution error:', error);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
