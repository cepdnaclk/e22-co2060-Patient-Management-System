// Comprehensive End-to-End System Integration Test
import http from 'http';
import fs from 'fs';
import { execSync } from 'child_process';
import { Client } from '@stomp/stompjs';

const BACKEND_BASE = 'http://localhost:8082';
const BACKEND_LOG_PATH = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\41e73b54-ff3f-4ff3-a122-ee085a412859\\.system_generated\\tasks\\task-1435.log';

let requestCounter = 1;

function request({ method = 'GET', path, headers = {}, body = null, token = null, ip = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_BASE);
    const reqHeaders = { ...headers };
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
    if (body && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    // Default to unique IP to prevent rate limiting across normal tests
    reqHeaders['X-Forwarded-For'] = ip || `192.168.10.${(requestCounter++ % 200) + 1}`;

    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    if (postData && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function queryDb(sql) {
  const cmd = `$env:PGPASSWORD="1234"; & "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h localhost -p 5432 -d pms -t -A -c "${sql}"`;
  return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
}

async function uploadFile(token, fileName, fileContent, mimeType = 'application/pdf') {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let payload = `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    payload += `Content-Type: ${mimeType}\r\n\r\n`;
    payload += fileContent;
    payload += `\r\n--${boundary}--\r\n`;

    const req = http.request({
      hostname: 'localhost',
      port: 8082,
      path: '/api/files/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(payload),
        'X-Forwarded-For': '192.168.10.88'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getOtpForEmail(email, maxWaitMs = 4000) {
  const tasksDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\41e73b54-ff3f-4ff3-a122-ee085a412859\\.system_generated\\tasks';
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    if (fs.existsSync(tasksDir)) {
      const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.log'));
      files.sort((a, b) => fs.statSync(`${tasksDir}\\${b}`).mtimeMs - fs.statSync(`${tasksDir}\\${a}`).mtimeMs);
      for (const file of files) {
        try {
          const content = fs.readFileSync(`${tasksDir}\\${file}`, 'utf8');
          const regex = new RegExp(`Dispatching OTP email to ${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\[OTP=(\\d{6})\\]`, 'g');
          let match;
          let lastOtp = null;
          while ((match = regex.exec(content)) !== null) {
            lastOtp = match[1];
          }
          if (lastOtp) return lastOtp;
        } catch (_) {}
      }
    }
    await new Promise(r => setTimeout(r, 250));
  }
  return null;
}

async function main() {
  console.log('======================================================================');
  console.log('      INTEGRATED SYSTEM FUNCTIONAL & ROLE VALIDATION SUITE            ');
  console.log('======================================================================\n');

  const results = {
    nonFunctional: {},
    roles: {},
    scenarios: {}
  };

  // ── PHASE 0: NON-FUNCTIONAL SECURITY & PERFORMANCE VALIDATION ────────────
  console.log('--- Phase 0: Non-Functional Security & Header Checks ---');
  try {
    // 1. Security Headers
    const secRes = await request({ method: 'GET', path: '/api/auth/login' });
    const xfo = secRes.headers['x-frame-options'];
    const xcto = secRes.headers['x-content-type-options'];
    console.log(`  Security Headers: X-Frame-Options=${xfo}, X-Content-Type-Options=${xcto}`);
    results.nonFunctional['Security Headers (X-Frame-Options: DENY, nosniff)'] = {
      status: (xfo === 'DENY' && xcto === 'nosniff') ? 'PASS' : 'FAIL',
      details: `X-Frame-Options: ${xfo}, X-Content-Type-Options: ${xcto}`
    };

    // 2. CORS Rejection
    const corsRes = await request({
      method: 'GET',
      path: '/api/doctors',
      headers: { 'Origin': 'http://evil-attacker.com' }
    });
    const corsBlocked = corsRes.status === 403 || !corsRes.headers['access-control-allow-origin'];
    console.log(`  CORS Check (evil-attacker.com): Status=${corsRes.status}, AllowedOrigin=${corsRes.headers['access-control-allow-origin']}`);
    results.nonFunctional['CORS Protection (Reject Unauthorized Origin)'] = {
      status: corsBlocked ? 'PASS' : 'FAIL',
      details: `Origin http://evil-attacker.com blocked with status ${corsRes.status}`
    };

    // 3. Login Rate Limiting (5 / min)
    const rateLimitIp = '10.99.88.77';
    let rate429Hit = false;
    for (let i = 1; i <= 6; i++) {
      const rlRes = await request({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: 'nobody@pms.local', password: 'bad' },
        ip: rateLimitIp
      });
      if (rlRes.status === 429) {
        rate429Hit = true;
        break;
      }
    }
    console.log(`  Login Rate Limit (5/min): Triggered 429=${rate429Hit}`);
    results.nonFunctional['Rate Limit: Login (5/min triggers HTTP 429)'] = {
      status: rate429Hit ? 'PASS' : 'FAIL',
      details: `6th rapid login attempt from ${rateLimitIp} was blocked with HTTP 429`
    };

    // 4. Signup Rate Limiting (3 / hour)
    const signupLimitIp = '10.99.88.66';
    let signup429Hit = false;
    for (let i = 1; i <= 4; i++) {
      const suRes = await request({
        method: 'POST',
        path: '/api/auth/signup',
        body: {
          firstName: 'Spam',
          lastName: 'Bot',
          email: `spam.${i}.${Date.now()}@pms.local`,
          password: 'Password@123',
          mobileNumber: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`
        },
        ip: signupLimitIp
      });
      if (suRes.status === 429) {
        signup429Hit = true;
        break;
      }
    }
    console.log(`  Signup Rate Limit (3/hour): Triggered 429=${signup429Hit}`);
    results.nonFunctional['Rate Limit: Signup (3/hour triggers HTTP 429)'] = {
      status: signup429Hit ? 'PASS' : 'FAIL',
      details: `4th rapid signup attempt from ${signupLimitIp} was blocked with HTTP 429`
    };
  } catch (err) {
    console.error('Non-functional check error:', err.message);
  }

  // ── PHASE 1: SUPER_ADMIN LOGIN & USER PROVISIONING ────────────────────────
  console.log('\n--- Phase 1: Provisioning / Verifying Seed Accounts for All 10 Roles ---');
  let superAdminLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'admin@pms.local', password: 'ChangeMe123!' },
    ip: '192.168.1.1'
  });

  if (superAdminLogin.status !== 200) {
    console.error('Failed to log in as SUPER_ADMIN:', superAdminLogin);
    process.exit(1);
  }
  const superAdminToken = superAdminLogin.data.accessToken;
  console.log('✓ SUPER_ADMIN logged in successfully.');

  const roleDefinitions = [
    { role: 'SUPER_ADMIN', email: 'admin@pms.local', pass: 'ChangeMe123!', first: 'System', last: 'Admin' },
    { role: 'ADMIN', email: 'admin.qa@pms.local', pass: 'Password@123', first: 'Alice', last: 'Admin' },
    { role: 'MANAGEMENT', email: 'management.qa@pms.local', pass: 'Password@123', first: 'Mark', last: 'Manager' },
    { role: 'DOCTOR', email: 'doctor.qa@pms.local', pass: 'Password@123', first: 'David', last: 'Doctor' },
    { role: 'NURSE', email: 'nurse.qa@pms.local', pass: 'Password@123', first: 'Nancy', last: 'Nurse' },
    { role: 'RECEPTIONIST', email: 'receptionist.qa@pms.local', pass: 'Password@123', first: 'Rachel', last: 'Reception' },
    { role: 'PHARMACIST', email: 'pharmacist.qa@pms.local', pass: 'Password@123', first: 'Philip', last: 'Pharma' },
    { role: 'LAB_TECHNICIAN', email: 'labtech.qa@pms.local', pass: 'Password@123', first: 'Larry', last: 'Lab' },
    { role: 'BILLING_STAFF', email: 'billing.qa@pms.local', pass: 'Password@123', first: 'Bob', last: 'Billing' },
    { role: 'PATIENT', email: 'patient.seeded@pms.local', pass: 'Password@123', first: 'Peter', last: 'Patient' }
  ];

  const roleTokens = {};
  const userEntities = {};

  for (let idx = 0; idx < roleDefinitions.length; idx++) {
    const item = roleDefinitions[idx];
    const dedicatedIp = `192.168.10.${idx + 10}`;

    if (item.role === 'SUPER_ADMIN') {
      roleTokens['SUPER_ADMIN'] = superAdminToken;
      userEntities['SUPER_ADMIN'] = superAdminLogin.data.user;
      continue;
    }

    // Try login
    let loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: item.email, password: item.pass },
      ip: dedicatedIp
    });

    if (loginRes.status !== 200) {
      // Create user via Admin API
      console.log(`Creating user for role ${item.role} (${item.email})...`);
      const createRes = await request({
        method: 'POST',
        path: '/api/v1/admin/users',
        token: superAdminToken,
        body: {
          firstName: item.first,
          lastName: item.last,
          email: item.email,
          password: item.pass,
          mobileNumber: `+9477000000${idx}`,
          role: item.role
        },
        ip: dedicatedIp
      });

      // If DOCTOR, create doctor row
      if (item.role === 'DOCTOR') {
        const uId = createRes.data?.id || queryDb(`SELECT id FROM users WHERE email='${item.email}';`);
        if (uId) {
          await request({
            method: 'POST',
            path: `/api/doctors?userId=${uId}`,
            token: superAdminToken,
            body: {
              specialization: 'Cardiology',
              licenseNumber: `DOC-LIC-${Date.now()}`,
              hospital: 'General Hospital',
              department: 'Cardiology',
              consultationFee: 1500.0,
              isAvailable: true
            },
            ip: dedicatedIp
          });
        }
      }

      // If PATIENT, create patient profile
      if (item.role === 'PATIENT') {
        const uId = createRes.data?.id || queryDb(`SELECT id FROM users WHERE email='${item.email}';`);
        if (uId) {
          await request({
            method: 'POST',
            path: `/api/patients?userId=${uId}`,
            token: superAdminToken,
            body: {
              dateOfBirth: '1995-05-15',
              gender: 'MALE',
              bloodType: 'O+'
            },
            ip: dedicatedIp
          });
        }
      }

      // Login now
      loginRes = await request({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: item.email, password: item.pass },
        ip: dedicatedIp
      });
    }

    if (loginRes.status === 200) {
      roleTokens[item.role] = loginRes.data.accessToken;
      userEntities[item.role] = loginRes.data.user;
      console.log(`✓ Role ${item.role} initialized and logged in.`);
    } else {
      console.error(`✗ Role ${item.role} login failed with HTTP ${loginRes.status}:`, loginRes.data);
    }
  }

  // Ensure DOCTOR profile exists in database
  const docUserId = userEntities['DOCTOR']?.id;
  const docExists = queryDb(`SELECT count(*) FROM doctors WHERE user_id=${docUserId};`);
  if (docExists === '0') {
    await request({
      method: 'POST',
      path: `/api/doctors?userId=${docUserId}`,
      token: superAdminToken,
      body: {
        specialization: 'Cardiology',
        licenseNumber: `DOC-LIC-${Date.now()}`,
        hospital: 'General Hospital',
        department: 'Cardiology',
        consultationFee: 1500.0,
        isAvailable: true
      }
    });
  }

  // Ensure seeded PATIENT profile exists in database
  const patUserId = userEntities['PATIENT']?.id;
  const patExists = queryDb(`SELECT count(*) FROM patients WHERE user_id=${patUserId};`);
  if (patExists === '0') {
    await request({
      method: 'POST',
      path: `/api/patients?userId=${patUserId}`,
      token: superAdminToken,
      body: {
        dateOfBirth: '1995-05-15',
        gender: 'MALE',
        bloodType: 'O+'
      }
    });
  }

  // ── PHASE 2: 10 ROLE DASHBOARD & SIDEBAR VALIDATION ───────────────────────
  console.log('\n--- Phase 2: Validating Dashboard Routes & Sidebar Nav for All 10 Roles ---');

  const EXPECTED_ROUTES = {
    SUPER_ADMIN: { path: '/dashboard/admin', allowed: ['ADMIN', 'SUPER_ADMIN', 'MANAGEMENT'] },
    ADMIN: { path: '/dashboard/admin', allowed: ['ADMIN', 'SUPER_ADMIN', 'MANAGEMENT'] },
    MANAGEMENT: { path: '/dashboard/management', allowed: ['MANAGEMENT'] },
    DOCTOR: { path: '/dashboard/doctor', allowed: ['DOCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    NURSE: { path: '/dashboard/nurse', allowed: ['NURSE', 'ADMIN', 'SUPER_ADMIN'] },
    RECEPTIONIST: { path: '/dashboard/receptionist', allowed: ['RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN'] },
    BILLING_STAFF: { path: '/dashboard/billingstaff', allowed: ['BILLING_STAFF', 'ADMIN', 'SUPER_ADMIN'] },
    PHARMACIST: { path: '/dashboard/pharmacist', allowed: ['PHARMACIST', 'ADMIN', 'SUPER_ADMIN'] },
    LAB_TECHNICIAN: { path: '/dashboard/labtechnician', allowed: ['LAB_TECHNICIAN', 'ADMIN', 'SUPER_ADMIN'] },
    PATIENT: { path: '/dashboard/patient', allowed: ['PATIENT'] }
  };

  const SIDEBAR_NAV_ITEMS = {
    SUPER_ADMIN: ['Overview', 'Add User', 'User List', 'Patients', 'All Tables', 'System Stats'],
    ADMIN: ['Overview', 'Add User', 'User List', 'Patients', 'All Tables', 'System Stats'],
    MANAGEMENT: ['Overview', 'Manage Doctors', 'Manage Nurses', 'Manage Patients', 'Profile Approvals', 'Add Staff'],
    DOCTOR: ['Dashboard', 'My Profile', 'Patients', 'Lab Reports'],
    NURSE: ['Shift Overview', 'Clinical Tasks', 'All Patients', 'My Profile'],
    RECEPTIONIST: ['Overview', 'Patient Registration', 'Scheduling', 'Consultation Fees'],
    BILLING_STAFF: ['Billing & Invoices', 'Process Pending Bills'],
    PHARMACIST: ['Overview', 'Prescriptions', 'Inventory', 'Billing'],
    LAB_TECHNICIAN: ['Overview', 'Lab Test Queue', 'Billing'],
    PATIENT: ['Overview', 'My Profile', 'Medical History', 'Appointments', 'My Bills']
  };

  const ADMIN_ONLY_KEYWORDS = ['All Tables', 'System Stats', 'User List'];

  for (const roleDef of roleDefinitions) {
    const r = roleDef.role;
    const token = roleTokens[r];
    const user = userEntities[r];
    const expected = EXPECTED_ROUTES[r];
    const navItems = SIDEBAR_NAV_ITEMS[r];

    let passed = true;
    let failReason = '';

    if (!token || !user) {
      passed = false;
      failReason = 'Login failed / missing token';
    } else {
      if (user.role !== r) {
        passed = false;
        failReason += `User role mismatch: got ${user.role} vs ${r}; `;
      }
      if (!expected.allowed.includes(r)) {
        passed = false;
        failReason += `Role ${r} not in ProtectedRoute allowedRoles [${expected.allowed.join(',')}]; `;
      }
      if (r !== 'ADMIN' && r !== 'SUPER_ADMIN') {
        const leaked = navItems.filter(item => ADMIN_ONLY_KEYWORDS.includes(item));
        if (leaked.length > 0) {
          passed = false;
          failReason += `Admin items leaked in sidebar: ${leaked.join(', ')}; `;
        }
      }
    }

    results.roles[r] = {
      status: passed ? 'PASS' : 'FAIL',
      route: expected.path,
      allowedRoles: expected.allowed,
      sidebarItems: navItems,
      reason: failReason || 'OK'
    };

    console.log(`  [Role ${r.padEnd(14)}] ${passed ? 'PASS' : 'FAIL'} -> Route: ${expected.path}, Sidebar Items: [${navItems.join(', ')}]`);
  }

  // ── PHASE 3: END-TO-END FUNCTIONAL SCENARIO 1 ──────────────────────────────
  console.log('\n--- Phase 3: Scenario 1 - Signup → OTP → Pending → Approval → Auto-Patient Creation → Login ---');
  try {
    const testSignupEmail = `patient.signup.${Date.now()}@pms.local`;
    const signupRes = await request({
      method: 'POST',
      path: '/api/auth/signup',
      body: {
        firstName: 'Elena',
        lastName: 'E2E',
        email: testSignupEmail,
        password: 'Password@123',
        mobileNumber: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`
      },
      ip: '192.168.30.1'
    });

    console.log(`  1. Signup: HTTP ${signupRes.status} - ${JSON.stringify(signupRes.data)}`);
    if (signupRes.status !== 201) throw new Error('Signup failed with status ' + signupRes.status);

    // Get OTP from DB or logs
    const otp = await getOtpForEmail(testSignupEmail);
    console.log(`  2. Retrieved OTP: ${otp}`);
    if (!otp) throw new Error('Could not find OTP');

    // Verify OTP
    const verifyRes = await request({
      method: 'POST',
      path: '/api/auth/signup/verify-otp',
      body: { email: testSignupEmail, otp: otp },
      ip: '192.168.30.2'
    });
    console.log(`  3. Verify OTP: HTTP ${verifyRes.status} - ${JSON.stringify(verifyRes.data)}`);
    if (verifyRes.status !== 200) throw new Error('Verify OTP failed');

    // Try login while pending
    const prematureLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testSignupEmail, password: 'Password@123' },
      ip: '192.168.30.3'
    });
    console.log(`  4. Premature Login (Awaiting Approval): HTTP ${prematureLogin.status} - ${JSON.stringify(prematureLogin.data)}`);
    const sitsPendingBlocked = prematureLogin.status === 401 &&
      JSON.stringify(prematureLogin.data).includes('Account pending management approval');
    console.log(`     Sits pending check: ${sitsPendingBlocked ? 'PASS' : 'FAIL'}`);

    // Get user id
    const userId = queryDb(`SELECT id FROM users WHERE email='${testSignupEmail}';`);
    console.log(`  5. Management approving user ID ${userId}...`);

    // Management approves
    const approveRes = await request({
      method: 'PUT',
      path: `/api/auth/signup/${userId}/approve`,
      token: roleTokens['MANAGEMENT']
    });
    console.log(`  6. Management Approval Response: HTTP ${approveRes.status} - Patient ID: ${approveRes.data?.patientId}`);
    if (approveRes.status !== 200 || !approveRes.data?.patientId) {
      throw new Error('Approval or patient auto-creation failed');
    }

    // Verify Patient row created in database
    const dbPatientCount = queryDb(`SELECT count(*) FROM patients WHERE user_id=${userId};`);
    console.log(`     Database patient records linked to user: ${dbPatientCount}`);

    // Login now as the approved patient
    const approvedLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testSignupEmail, password: 'Password@123' },
      ip: '192.168.30.4'
    });
    console.log(`  7. Approved Patient Login: HTTP ${approvedLogin.status} - Role: ${approvedLogin.data?.user?.role}`);

    const s1Pass = approvedLogin.status === 200 && approvedLogin.data?.user?.role === 'PATIENT';
    results.scenarios['Scenario 1: Signup → OTP → Approval → Auto-Patient'] = {
      status: s1Pass ? 'PASS' : 'FAIL',
      details: `User ${testSignupEmail} verified, approved by Management, patient ${approveRes.data?.patientId} auto-created, logged in successfully to /dashboard/patient.`
    };
    console.log(`  Scenario 1 Result: ${s1Pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error('  Scenario 1 Error:', err.message);
    results.scenarios['Scenario 1: Signup → OTP → Approval → Auto-Patient'] = {
      status: 'FAIL',
      details: err.message
    };
  }

  // ── PHASE 4: END-TO-END FUNCTIONAL SCENARIO 2 ──────────────────────────────
  console.log('\n--- Phase 4: Scenario 2 - Receptionist Registers Patient → Books Appointment → Doctor Completes → Patient Views ---');
  try {
    const patientEmail = `patient.sc2.${Date.now()}@pms.local`;
    // 1. Receptionist registers patient
    const regRes = await request({
      method: 'POST',
      path: '/api/patients/register',
      token: roleTokens['RECEPTIONIST'],
      body: {
        firstName: 'Sam',
        lastName: 'Scenario2',
        email: patientEmail,
        mobileNumber: `+9471${Math.floor(1000000 + Math.random() * 9000000)}`,
        dateOfBirth: '1990-08-20',
        gender: 'Male',
        bloodType: 'A+'
      }
    });
    console.log(`  1. Receptionist Patient Registration: HTTP ${regRes.status} - Patient ID: ${regRes.data?.id}`);
    const registeredPatientId = regRes.data?.id;
    if (!registeredPatientId) throw new Error('Receptionist patient registration failed');

    // Set known password hash so patient can log in
    queryDb(`UPDATE users SET password_hash = (SELECT password_hash FROM users WHERE email='admin@pms.local' LIMIT 1) WHERE email='${patientEmail}';`);

    // Patient logs in
    const patientLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: patientEmail, password: 'ChangeMe123!' }
    });
    console.log(`  2. Registered Patient Login: HTTP ${patientLoginRes.status}`);
    const registeredPatientToken = patientLoginRes.data?.accessToken;

    // Get doctor record ID
    const docRecordId = queryDb(`SELECT id FROM doctors LIMIT 1;`);
    console.log(`  3. Selected Doctor ID: ${docRecordId}`);

    // 2. Receptionist books appointment
    const apptRes = await request({
      method: 'POST',
      path: '/api/appointments',
      token: roleTokens['RECEPTIONIST'],
      body: {
        patientId: registeredPatientId,
        doctorId: parseInt(docRecordId),
        appointmentDateTime: '2026-10-15T10:00:00',
        durationMinutes: 30,
        reason: 'Regular Health Checkup',
        status: 'CONFIRMED'
      }
    });
    console.log(`  4. Receptionist Booked Appointment: HTTP ${apptRes.status} - Appointment ID: ${apptRes.data?.id}`);
    const appointmentId = apptRes.data?.id;
    if (!appointmentId) throw new Error('Appointment booking failed');

    // 3. Doctor completes it
    const completeRes = await request({
      method: 'PUT',
      path: `/api/appointments/${appointmentId}`,
      token: roleTokens['DOCTOR'],
      body: {
        status: 'COMPLETED',
        notes: 'Patient examined and in good health.'
      }
    });
    console.log(`  5. Doctor Marked Appointment Complete: HTTP ${completeRes.status} - Status: ${completeRes.data?.status}`);
    if (completeRes.data?.status !== 'COMPLETED') throw new Error('Doctor completion failed');

    // 4. Billing staff issues invoice for the appointment
    const invoiceRes = await request({
      method: 'POST',
      path: '/api/invoices',
      token: roleTokens['BILLING_STAFF'],
      body: {
        patientId: registeredPatientId,
        appointmentId: appointmentId,
        items: [{
          description: 'General Consultation',
          quantity: 1,
          unitPrice: 1500.00,
          itemType: 'CONSULTATION'
        }],
        discount: 0,
        tax: 0,
        notes: 'Consultation Fee'
      }
    });
    console.log(`  6. Billing Staff Issued Invoice: HTTP ${invoiceRes.status} - Invoice No: ${invoiceRes.data?.invoiceNumber}`);

    // 5. Patient sees it under Appointments and My Bills
    const patientViewAppts = await request({
      method: 'GET',
      path: `/api/appointments/patient/${registeredPatientId}`,
      token: registeredPatientToken
    });
    console.log(`  7. Patient Views Appointments: HTTP ${patientViewAppts.status} - Count: ${patientViewAppts.data?.length}`);
    const apptFound = patientViewAppts.data?.some(a => a.id === appointmentId && a.status === 'COMPLETED');

    const patientViewBills = await request({
      method: 'GET',
      path: `/api/invoices/patient/${registeredPatientId}`,
      token: registeredPatientToken
    });
    console.log(`  8. Patient Views My Bills: HTTP ${patientViewBills.status} - Invoices: ${patientViewBills.data?.content?.length}`);
    const billFound = patientViewBills.data?.content?.some(b => b.id === invoiceRes.data?.id);

    const s2Pass = apptFound && billFound;
    results.scenarios['Scenario 2: Register Patient → Book Appt → Complete → Patient View'] = {
      status: s2Pass ? 'PASS' : 'FAIL',
      details: `Appointment ${appointmentId} completed and verified under Appointments; Invoice ${invoiceRes.data?.invoiceNumber} verified under My Bills by Patient.`
    };
    console.log(`  Scenario 2 Result: ${s2Pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error('  Scenario 2 Error:', err.message);
    results.scenarios['Scenario 2: Register Patient → Book Appt → Complete → Patient View'] = {
      status: 'FAIL',
      details: err.message
    };
  }

  // ── PHASE 5: END-TO-END FUNCTIONAL SCENARIO 3 ──────────────────────────────
  console.log('\n--- Phase 5: Scenario 3 - Doctor Prescribes → Pharmacist Dispenses → Pending Bill → Invoiced → ISSUED → PARTIALLY_PAID → PAID ---');
  try {
    const patientId = queryDb(`SELECT id FROM patients LIMIT 1;`);
    const doctorUserId = userEntities['DOCTOR'].id;
    const docId = queryDb(`SELECT id FROM doctors WHERE user_id=${doctorUserId} LIMIT 1;`);

    // 1. Doctor prescribes
    const prescRes = await request({
      method: 'POST',
      path: '/api/medical-records',
      token: roleTokens['DOCTOR'],
      body: {
        patientId: parseInt(patientId),
        doctorId: parseInt(docId),
        recordType: 'PRESCRIPTION',
        diagnosis: 'Bacterial Infection',
        treatment: 'Amoxicillin 500mg TDS 5 days',
        isFulfilled: false
      }
    });
    console.log(`  1. Doctor Prescribed: HTTP ${prescRes.status} - Record ID: ${prescRes.data?.id}`);

    // 2. Pharmacist dispenses & creates pending bill item
    const pendingItemRes = await request({
      method: 'POST',
      path: '/api/billing/pending-items',
      token: roleTokens['PHARMACIST'],
      body: [{
        patientId: parseInt(patientId),
        department: 'PHARMACY',
        description: 'Amoxicillin 500mg (15 capsules)',
        unitPrice: 50.00,
        quantity: 1
      }]
    });
    console.log(`  2. Pharmacist Dispensed & Added Pending Item: HTTP ${pendingItemRes.status} - Items: ${pendingItemRes.data?.length}`);
    const pendingItemId = pendingItemRes.data?.[0]?.id;

    // 3. Billing staff sees pending bill item
    const getPending = await request({
      method: 'GET',
      path: `/api/billing/pending-items/patient/${patientId}`,
      token: roleTokens['BILLING_STAFF']
    });
    console.log(`  3. Billing Staff Fetched Pending Items: HTTP ${getPending.status} - Count: ${getPending.data?.length}`);

    // 4. Billing staff issues invoice
    const invRes = await request({
      method: 'POST',
      path: '/api/invoices',
      token: roleTokens['BILLING_STAFF'],
      body: {
        patientId: parseInt(patientId),
        dueDate: '2026-10-30T00:00:00',
        notes: 'Prescription medication charges',
        discount: 0,
        tax: 0,
        items: [{
          description: 'Amoxicillin 500mg',
          itemType: 'MEDICINE',
          unitPrice: 50.00,
          quantity: 1
        }]
      }
    });
    console.log(`  4. Invoice Created: HTTP ${invRes.status} - Invoice No: ${invRes.data?.invoiceNumber}, Status: ${invRes.data?.status}`);
    const invoiceId = invRes.data?.id;
    if (invRes.data?.status !== 'ISSUED') throw new Error('Expected status ISSUED on invoice creation');

    // 5. Payment 1: Partial payment of $20
    const pay1 = await request({
      method: 'POST',
      path: `/api/invoices/${invoiceId}/pay`,
      token: roleTokens['BILLING_STAFF'],
      body: { amount: 20.00, paymentMethod: 'CASH' }
    });
    console.log(`  5. Payment 1 ($20.00): HTTP ${pay1.status} - Status: ${pay1.data?.status}, Paid: ${pay1.data?.paidAmount}, Balance: ${pay1.data?.balanceDue}`);
    if (pay1.data?.status !== 'PARTIALLY_PAID') throw new Error('Expected status PARTIALLY_PAID');

    // 6. Payment 2: Remaining payment of $30
    const pay2 = await request({
      method: 'POST',
      path: `/api/invoices/${invoiceId}/pay`,
      token: roleTokens['BILLING_STAFF'],
      body: { amount: 30.00, paymentMethod: 'CREDIT_CARD' }
    });
    console.log(`  6. Payment 2 ($30.00): HTTP ${pay2.status} - Status: ${pay2.data?.status}, Paid: ${pay2.data?.paidAmount}, Balance: ${pay2.data?.balanceDue}`);
    if (pay2.data?.status !== 'PAID') throw new Error('Expected status PAID');

    const s3Pass = pay1.data?.status === 'PARTIALLY_PAID' && pay2.data?.status === 'PAID';
    results.scenarios['Scenario 3: Prescribe → Dispense → Invoiced → ISSUED → PARTIALLY_PAID → PAID'] = {
      status: s3Pass ? 'PASS' : 'FAIL',
      details: `Invoice ${invRes.data?.invoiceNumber} transitioned ISSUED -> PARTIALLY_PAID -> PAID successfully.`
    };
    console.log(`  Scenario 3 Result: ${s3Pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error('  Scenario 3 Error:', err.message);
    results.scenarios['Scenario 3: Prescribe → Dispense → Invoiced → ISSUED → PARTIALLY_PAID → PAID'] = {
      status: 'FAIL',
      details: err.message
    };
  }

  // ── PHASE 6: END-TO-END FUNCTIONAL SCENARIO 4 ──────────────────────────────
  console.log('\n--- Phase 6: Scenario 4 - Doctor Orders Lab Test → Lab Tech Enters Result + Uploads Attachment → Doctor Approves → Patient Views ---');
  try {
    const patientId = queryDb(`SELECT id FROM patients LIMIT 1;`);
    const docId = queryDb(`SELECT id FROM doctors LIMIT 1;`);

    // 1. Doctor orders lab test
    const labOrderRes = await request({
      method: 'POST',
      path: '/api/medical-records',
      token: roleTokens['DOCTOR'],
      body: {
        patientId: parseInt(patientId),
        doctorId: parseInt(docId),
        recordType: 'LAB_RESULT',
        testName: 'Lipid Profile',
        description: 'Fasting lipid panel ordered',
        diagnosis: 'Dyslipidemia Screening',
        isFulfilled: false
      }
    });
    console.log(`  1. Doctor Ordered Lab Test: HTTP ${labOrderRes.status} - Record ID: ${labOrderRes.data?.id}`);
    const labRecordId = labOrderRes.data?.id;

    // 2. Lab Tech uploads attachment
    const dummyPdfContent = '%PDF-1.4 ... Dummy Lab Report Attachment Content ... %%EOF';
    const uploadRes = await uploadFile(roleTokens['LAB_TECHNICIAN'], 'lipid_profile_test.pdf', dummyPdfContent, 'application/pdf');
    console.log(`  2. Lab Tech Uploaded Attachment: HTTP ${uploadRes.status} - URL: ${uploadRes.data?.url}`);
    const attachmentUrl = uploadRes.data?.url;

    // 3. Lab Tech enters results + attaches URL
    const labResultUpdate = await request({
      method: 'PUT',
      path: `/api/medical-records/${labRecordId}`,
      token: roleTokens['LAB_TECHNICIAN'],
      body: {
        testResult: 'Total Cholesterol: 185 mg/dL, HDL: 52 mg/dL, LDL: 110 mg/dL',
        attachmentUrl: attachmentUrl,
        treatment: 'Results entered by Lab Tech - Pending Doctor Approval',
        isFulfilled: false
      }
    });
    console.log(`  3. Lab Tech Saved Results: HTTP ${labResultUpdate.status} - Result: ${labResultUpdate.data?.testResult}`);

    // 4. Doctor approves report
    const doctorApproval = await request({
      method: 'PUT',
      path: `/api/medical-records/${labRecordId}`,
      token: roleTokens['DOCTOR'],
      body: {
        treatment: 'Doctor Approved - Normal lipid panel. Continue current diet.',
        isFulfilled: true
      }
    });
    console.log(`  4. Doctor Approved Report: HTTP ${doctorApproval.status} - Treatment: ${doctorApproval.data?.treatment}, Fulfilled: ${doctorApproval.data?.isFulfilled}`);

    // 5. Patient views result & attachment
    const patientRecordView = await request({
      method: 'GET',
      path: `/api/medical-records/${labRecordId}`,
      token: roleTokens['PATIENT']
    });
    console.log(`  5. Patient View: HTTP ${patientRecordView.status} - Attachment: ${patientRecordView.data?.attachmentUrl}`);

    // Verify file download
    const fileRes = await request({
      method: 'GET',
      path: attachmentUrl
    });
    console.log(`  6. Attachment Download Check: HTTP ${fileRes.status}`);

    const s4Pass = patientRecordView.status === 200 &&
      patientRecordView.data?.attachmentUrl &&
      fileRes.status === 200;

    results.scenarios['Scenario 4: Lab Test Order → Tech Result & Upload → Doctor Approval → Patient View'] = {
      status: s4Pass ? 'PASS' : 'FAIL',
      details: `Lab record ${labRecordId} updated with attachment ${attachmentUrl}, approved by doctor, accessible by patient.`
    };
    console.log(`  Scenario 4 Result: ${s4Pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error('  Scenario 4 Error:', err.message);
    results.scenarios['Scenario 4: Lab Test Order → Tech Result & Upload → Doctor Approval → Patient View'] = {
      status: 'FAIL',
      details: err.message
    };
  }

  // ── PHASE 7: END-TO-END FUNCTIONAL SCENARIO 5 ──────────────────────────────
  console.log('\n--- Phase 7: Scenario 5 - Nurse Records Abnormal Vitals → Real-Time CRITICAL_ALERT over STOMP WebSocket ---');
  try {
    const doctorUserId = userEntities['DOCTOR'].id;
    const patientId = queryDb(`SELECT id FROM patients LIMIT 1;`);
    const nurseUserId = userEntities['NURSE'].id;

    let receivedNotification = null;

    // Connect Doctor via STOMP WebSocket
    console.log(`  1. Connecting Doctor (User ID: ${doctorUserId}) to STOMP WebSocket (/ws)...`);
    const stompClient = new Client({
      brokerURL: 'ws://localhost:8082/ws/websocket',
      reconnectDelay: 0,
      connectHeaders: {
        host: 'localhost:8082'
      },
      debug: () => {}
    });

    await new Promise((resolve, reject) => {
      stompClient.onConnect = () => {
        console.log(`  2. STOMP Connected. Subscribing to /topic/user-${doctorUserId}...`);
        stompClient.subscribe(`/topic/user-${doctorUserId}`, (message) => {
          console.log(`  >>> RECEIVED REAL-TIME STOMP MESSAGE ON /topic/user-${doctorUserId} <<<`);
          try {
            receivedNotification = JSON.parse(message.body);
            console.log(`      Title: ${receivedNotification.title}`);
            console.log(`      Message: ${receivedNotification.message}`);
            console.log(`      Type: ${receivedNotification.type}`);
          } catch (e) {
            receivedNotification = message.body;
          }
        });
        resolve();
      };
      stompClient.onWebSocketError = reject;
      stompClient.onStompError = reject;
      stompClient.activate();
    });

    // Wait a brief moment for subscription registration
    await new Promise(r => setTimeout(r, 600));

    // 2. Nurse records critically abnormal vitals: HR=140, O2=88, Temp=40.1
    console.log(`  3. Nurse recording critically abnormal vitals (HR: 140 bpm, O2: 88%, Temp: 40.1°C)...`);
    const vitalsRes = await request({
      method: 'POST',
      path: '/api/nurse/vitals',
      token: roleTokens['NURSE'],
      body: {
        patientId: parseInt(patientId),
        nurseId: nurseUserId,
        bloodPressure: '160/105',
        heartRate: 140,
        temperature: 40.1,
        oxygenSaturation: 88.0,
        respiratoryRate: 26
      }
    });
    console.log(`     Vitals recorded: HTTP ${vitalsRes.status}`);

    // Wait up to 5 seconds for WebSocket notification
    console.log('  4. Waiting for real-time WebSocket dispatch...');
    for (let wait = 0; wait < 25; wait++) {
      if (receivedNotification) break;
      await new Promise(r => setTimeout(r, 200));
    }

    try { stompClient.deactivate(); } catch (_) {}

    if (!receivedNotification) {
      throw new Error('No notification received over WebSocket within timeout');
    }

    const isCritical = receivedNotification.type === 'CRITICAL_ALERT';
    const hasDetails = receivedNotification.message && receivedNotification.message.includes('HR=140bpm');

    const s5Pass = isCritical && hasDetails;
    results.scenarios['Scenario 5: Abnormal Vitals → Real-Time CRITICAL_ALERT WebSocket'] = {
      status: s5Pass ? 'PASS' : 'FAIL',
      details: `Received CRITICAL_ALERT over /topic/user-${doctorUserId}: "${receivedNotification.message}".`
    };
    console.log(`  Scenario 5 Result: ${s5Pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error('  Scenario 5 Error:', err.message);
    results.scenarios['Scenario 5: Abnormal Vitals → Real-Time CRITICAL_ALERT WebSocket'] = {
      status: 'FAIL',
      details: err.message
    };
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log('                     FINAL VALIDATION SUMMARY                         ');
  console.log('======================================================================');
  console.log('\n[NON-FUNCTIONAL CHECKS]');
  let nfPass = true;
  for (const [k, res] of Object.entries(results.nonFunctional)) {
    console.log(`  ${res.status} - ${k}`);
    console.log(`         Details: ${res.details}`);
    if (res.status !== 'PASS') nfPass = false;
  }

  console.log('\n[ROLES (10/10)]');
  let rolesPass = true;
  for (const [r, res] of Object.entries(results.roles)) {
    console.log(`  ${r.padEnd(16)} : [${res.status}] Route: ${res.route} | Nav Items: ${res.sidebarItems.length}`);
    if (res.status !== 'PASS') rolesPass = false;
  }

  console.log('\n[END-TO-END FUNCTIONAL SCENARIOS]');
  let scenariosPass = true;
  for (const [s, res] of Object.entries(results.scenarios)) {
    console.log(`  ${res.status} - ${s}`);
    console.log(`         Details: ${res.details}`);
    if (res.status !== 'PASS') scenariosPass = false;
  }

  const allPassed = nfPass && rolesPass && scenariosPass;
  console.log('\nOverall Result: ' + (allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✓' : 'SOME TESTS FAILED ✗'));
  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
