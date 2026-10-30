const bcrypt = require('bcryptjs');
const db = require('../database/db');

function initializeDatabase() {
  console.log('[DB] Checking and initializing SQLite database...');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id TEXT UNIQUE NOT NULL,
      citizen_name TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      email TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      ward_number TEXT NOT NULL,
      locality TEXT NOT NULL,
      landmark TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaint_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      admin_note TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_tracking_id ON complaints(tracking_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
    CREATE INDEX IF NOT EXISTS idx_complaint_history_cid ON complaint_status_history(complaint_id);
  `);

  // Seed default administrator if not present
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(adminUsername);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(adminUsername, passwordHash);
    console.log(`[DB] Created default admin account '${adminUsername}' with password '${adminPassword}'`);
  }

  // Seed fictional demonstration complaints if complaints table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  if (countRow.count === 0) {
    console.log('[DB] Seeding demonstration complaints...');

    const sampleComplaints = [
      {
        tracking_id: 'MCR-2026-881204',
        citizen_name: 'Rajesh Sharma',
        mobile_number: '9876543210',
        email: 'rajesh.sharma@example.com',
        category: 'Road Damage',
        title: 'Pothole near the community park',
        description: 'A deep pothole has formed right in front of the main entrance of Green Valley Community Park. Two two-wheelers skidded yesterday. Urgent asphalt patch required.',
        ward_number: '12',
        locality: 'Green Valley Enclave',
        landmark: 'Near Park Gate 2 and Milk Booth',
        status: 'Pending',
        created_at: '2026-10-28 09:15:00',
        updated_at: '2026-10-28 09:15:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint submitted by citizen via citizen portal.', time: '2026-10-28 09:15:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-749102',
        citizen_name: 'Priya Sundaram',
        mobile_number: '9845123456',
        email: 'priya.s@example.com',
        category: 'Garbage Collection',
        title: 'Garbage collection delayed',
        description: 'Door-to-door municipal waste collection truck has not visited 4th Main Road for the past three days. Domestic waste is piling up outside houses.',
        ward_number: '05',
        locality: 'Gandhi Bazaar',
        landmark: 'Opposite State Bank Branch',
        status: 'In Progress',
        created_at: '2026-10-27 10:30:00',
        updated_at: '2026-10-28 14:00:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint submitted by citizen.', time: '2026-10-27 10:30:00' },
          { old_status: 'Pending', new_status: 'In Progress', note: 'Forwarded to Ward 5 Sanitation Officer. Special collection vehicle dispatched today afternoon.', time: '2026-10-28 14:00:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-612398',
        citizen_name: 'Amitabh Sen',
        mobile_number: '9711223344',
        email: 'amitabh.sen@example.com',
        category: 'Water Supply',
        title: 'Irregular water supply',
        description: 'Water pressure in Shanthi Layout has dropped drastically since Monday, with zero supply during morning hours.',
        ward_number: '08',
        locality: 'Shanthi Layout',
        landmark: 'Behind Municipal Water Tank',
        status: 'Resolved',
        created_at: '2026-10-25 08:00:00',
        updated_at: '2026-10-27 17:45:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-25 08:00:00' },
          { old_status: 'Pending', new_status: 'In Progress', note: 'Water Board engineering team inspected pipeline valve blockage.', time: '2026-10-26 11:30:00' },
          { old_status: 'In Progress', new_status: 'Resolved', note: 'Main feeder valve replaced and pressure restored to normal levels (2.5 bar). Verified with resident association.', time: '2026-10-27 17:45:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-559104',
        citizen_name: 'Sunita Rao',
        mobile_number: '9988776655',
        email: 'sunita.rao@example.com',
        category: 'Streetlight Issues',
        title: 'Streetlight not working',
        description: 'Three consecutive streetlights on Cross Road 6 are non-operational for a week. The stretch is pitch dark after 7 PM, creating safety hazards for pedestrians.',
        ward_number: '14',
        locality: 'Rajajinagar 3rd Block',
        landmark: 'Adjacent to Community Hall',
        status: 'Pending',
        created_at: '2026-10-29 18:20:00',
        updated_at: '2026-10-29 18:20:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-29 18:20:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-443219',
        citizen_name: 'Mohammed Farooq',
        mobile_number: '9123456780',
        email: 'farooq.m@example.com',
        category: 'Drainage',
        title: 'Blocked stormwater drain',
        description: 'Stormwater drain along Lake View road is clogged with silt and plastic debris. Even a light drizzle causes dirty water to overflow onto pedestrian pathways.',
        ward_number: '07',
        locality: 'Lake View Enclave',
        landmark: 'Near Children Play Area Culvert',
        status: 'In Progress',
        created_at: '2026-10-28 11:45:00',
        updated_at: '2026-10-29 10:15:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-28 11:45:00' },
          { old_status: 'Pending', new_status: 'In Progress', note: 'Drainage desilting crew with suction vehicle deployed on site. Work underway.', time: '2026-10-29 10:15:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-382941',
        citizen_name: 'Anita Verma',
        mobile_number: '9456123789',
        email: 'anita.verma@example.com',
        category: 'Sanitation',
        title: 'Public area sanitation issue',
        description: 'Public convenience complex near Central Bus Stand Platform 3 was neglected and unsanitary. Running water was unavailable.',
        ward_number: '03',
        locality: 'City Bus Terminal Area',
        landmark: 'Opposite Platform 3 Departure Bay',
        status: 'Resolved',
        created_at: '2026-10-24 14:10:00',
        updated_at: '2026-10-26 16:30:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-24 14:10:00' },
          { old_status: 'Pending', new_status: 'In Progress', note: 'Sanitation contractor notified. Deep cleaning team assigned.', time: '2026-10-25 09:00:00' },
          { old_status: 'In Progress', new_status: 'Resolved', note: 'Facility thoroughly cleaned, disinfected, water pump repaired, and daily maintenance roster assigned.', time: '2026-10-26 16:30:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-291045',
        citizen_name: 'Karthik Menon',
        mobile_number: '9345678901',
        email: 'karthik.menon@example.com',
        category: 'Road Damage',
        title: 'Damaged road near the market',
        description: 'Bitumen surface eroded on the bypass corridor leading to the Wholesale Grain Market. Heavy vehicle ruts make driving difficult.',
        ward_number: '09',
        locality: 'Market Bypass Highway',
        landmark: 'Highway Ring Road Junction',
        status: 'Rejected',
        created_at: '2026-10-26 12:00:00',
        updated_at: '2026-10-27 15:20:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-26 12:00:00' },
          { old_status: 'Pending', new_status: 'Rejected', note: 'Jurisdiction Check: This stretch is classified as National Highway Bypass under NHAI authority, outside municipal purview. Official intimation letter forwarded to the Project Director, NHAI.', time: '2026-10-27 15:20:00' }
        ]
      },
      {
        tracking_id: 'MCR-2026-193852',
        citizen_name: 'Deepak Patel',
        mobile_number: '9789012345',
        email: 'deepak.patel@example.com',
        category: 'Garbage Collection',
        title: 'Missed waste collection',
        description: 'Sanitation workers skipped commercial street lane 2 this morning. Organic bins are overflowing and stray animals are scattering garbage.',
        ward_number: '02',
        locality: 'Commercial Street West',
        landmark: 'Behind City Supermarket',
        status: 'Pending',
        created_at: '2026-10-30 08:30:00',
        updated_at: '2026-10-30 08:30:00',
        history: [
          { old_status: null, new_status: 'Pending', note: 'Complaint registered by citizen.', time: '2026-10-30 08:30:00' }
        ]
      }
    ];

    const insertComplaint = db.prepare(`
      INSERT INTO complaints (
        tracking_id, citizen_name, mobile_number, email, category,
        title, description, ward_number, locality, landmark,
        status, created_at, updated_at
      ) VALUES (
        @tracking_id, @citizen_name, @mobile_number, @email, @category,
        @title, @description, @ward_number, @locality, @landmark,
        @status, @created_at, @updated_at
      )
    `);

    const insertHistory = db.prepare(`
      INSERT INTO complaint_status_history (
        complaint_id, old_status, new_status, admin_note, changed_at
      ) VALUES (
        ?, ?, ?, ?, ?
      )
    `);

    const seedTransaction = db.transaction((complaints) => {
      for (const item of complaints) {
        const result = insertComplaint.run(item);
        const complaintId = result.lastInsertRowid;
        for (const h of item.history) {
          insertHistory.run(complaintId, h.old_status, h.new_status, h.note, h.time);
        }
      }
    });

    seedTransaction(sampleComplaints);
    console.log(`[DB] Successfully inserted ${sampleComplaints.length} demonstration complaints.`);
  }

  console.log('[DB] Database ready.');
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  initializeDatabase();
}

module.exports = initializeDatabase;
