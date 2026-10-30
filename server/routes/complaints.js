const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Valid categories list
const VALID_CATEGORIES = [
  'Road Damage',
  'Garbage Collection',
  'Water Supply',
  'Streetlight Issues',
  'Drainage',
  'Sanitation'
];

// Helper to generate unique tracking ID: MCR-YYYY-XXXXXX
function generateTrackingId() {
  const year = new Date().getFullYear();
  let trackingId;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    trackingId = `MCR-${year}-${randomNum}`;
    const row = db.prepare('SELECT id FROM complaints WHERE tracking_id = ?').get(trackingId);
    if (!row) {
      exists = false;
    }
  }

  return trackingId;
}

// GET /api/complaints/stats - Public statistics for Home Page
router.get('/stats', (req, res, next) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM complaints').get();
    const pendingRow = db.prepare("SELECT COUNT(*) as pending FROM complaints WHERE status = 'Pending'").get();
    const inProgressRow = db.prepare("SELECT COUNT(*) as in_progress FROM complaints WHERE status = 'In Progress'").get();
    const resolvedRow = db.prepare("SELECT COUNT(*) as resolved FROM complaints WHERE status = 'Resolved'").get();
    const rejectedRow = db.prepare("SELECT COUNT(*) as rejected FROM complaints WHERE status = 'Rejected'").get();

    // Category distribution counts
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category
    `).all();

    res.json({
      success: true,
      stats: {
        total: totalRow.total || 0,
        pending: pendingRow.pending || 0,
        in_progress: inProgressRow.in_progress || 0,
        resolved: resolvedRow.resolved || 0,
        rejected: rejectedRow.rejected || 0,
        categories: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/complaints - Citizen registers a complaint
router.post('/', (req, res, next) => {
  try {
    const {
      citizen_name,
      mobile_number,
      email,
      category,
      title,
      description,
      ward_number,
      locality,
      landmark
    } = req.body;

    const errors = {};

    // Validation
    if (!citizen_name || !citizen_name.trim()) {
      errors.citizen_name = 'Citizen name is required.';
    } else if (citizen_name.trim().length < 2) {
      errors.citizen_name = 'Name must be at least 2 characters.';
    }

    // Mobile number: exactly 10 digits
    const cleanedMobile = (mobile_number || '').trim();
    if (!cleanedMobile) {
      errors.mobile_number = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(cleanedMobile)) {
      errors.mobile_number = 'Mobile number must contain exactly 10 digits.';
    }

    // Optional email validation
    const cleanedEmail = (email || '').trim();
    if (cleanedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      errors.email = 'Please provide a valid email address.';
    }

    // Category validation
    if (!category || !category.trim()) {
      errors.category = 'Complaint category is required.';
    } else if (!VALID_CATEGORIES.includes(category.trim())) {
      errors.category = `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }

    // Title validation
    if (!title || !title.trim()) {
      errors.title = 'Complaint title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Complaint title must be at least 5 characters.';
    }

    // Description validation
    if (!description || !description.trim()) {
      errors.description = 'Detailed description is required.';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long.';
    }

    // Ward number validation
    if (!ward_number || !ward_number.toString().trim()) {
      errors.ward_number = 'Ward number is required.';
    }

    // Locality validation
    if (!locality || !locality.trim()) {
      errors.locality = 'Area / Locality is required.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors
      });
    }

    const trackingId = generateTrackingId();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insertComplaint = db.prepare(`
      INSERT INTO complaints (
        tracking_id, citizen_name, mobile_number, email, category,
        title, description, ward_number, locality, landmark,
        status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        'Pending', ?, ?
      )
    `);

    const insertHistory = db.prepare(`
      INSERT INTO complaint_status_history (
        complaint_id, old_status, new_status, admin_note, changed_at
      ) VALUES (
        ?, NULL, 'Pending', 'Complaint submitted successfully by citizen via portal.', ?
      )
    `);

    const transaction = db.transaction(() => {
      const result = insertComplaint.run(
        trackingId,
        citizen_name.trim(),
        cleanedMobile,
        cleanedEmail || null,
        category.trim(),
        title.trim(),
        description.trim(),
        ward_number.toString().trim(),
        locality.trim(),
        landmark ? landmark.trim() : null,
        now,
        now
      );

      const complaintId = result.lastInsertRowid;
      insertHistory.run(complaintId, now);

      return complaintId;
    });

    transaction();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      tracking_id: trackingId,
      complaint: {
        tracking_id: trackingId,
        title: title.trim(),
        category: category.trim(),
        created_at: now,
        status: 'Pending'
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/complaints/track/:trackingId - Public complaint tracking
router.get('/track/:trackingId', (req, res, next) => {
  try {
    const rawId = req.params.trackingId.trim().toUpperCase();

    const complaint = db.prepare(`
      SELECT 
        id, tracking_id, citizen_name, category, title, description,
        ward_number, locality, landmark, status, created_at, updated_at
      FROM complaints 
      WHERE UPPER(tracking_id) = ?
    `).get(rawId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with Tracking ID "${req.params.trackingId}". Please check the ID and try again.`
      });
    }

    // Mask citizen name for public privacy protection (e.g. John Doe -> J*** D***)
    const maskedName = complaint.citizen_name.split(' ').map(part => {
      if (part.length <= 1) return part;
      return part[0] + '*'.repeat(Math.max(2, part.length - 1));
    }).join(' ');

    const safeComplaint = {
      ...complaint,
      citizen_name: maskedName
      // mobile_number and email are completely excluded from SELECT
    };

    // Fetch status history timeline
    const history = db.prepare(`
      SELECT id, old_status, new_status, admin_note, changed_at
      FROM complaint_status_history
      WHERE complaint_id = ?
      ORDER BY changed_at ASC, id ASC
    `).all(complaint.id);

    res.json({
      success: true,
      complaint: safeComplaint,
      history
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/complaints/search - Alternative search endpoint
router.post('/search', (req, res, next) => {
  try {
    const { tracking_id } = req.body;
    if (!tracking_id || !tracking_id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required.'
      });
    }

    const rawId = tracking_id.trim().toUpperCase();
    const complaint = db.prepare(`
      SELECT 
        id, tracking_id, citizen_name, category, title, description,
        ward_number, locality, landmark, status, created_at, updated_at
      FROM complaints 
      WHERE UPPER(tracking_id) = ?
    `).get(rawId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with Tracking ID "${tracking_id}".`
      });
    }

    const history = db.prepare(`
      SELECT id, old_status, new_status, admin_note, changed_at
      FROM complaint_status_history
      WHERE complaint_id = ?
      ORDER BY changed_at ASC, id ASC
    `).all(complaint.id);

    res.json({
      success: true,
      complaint: {
        ...complaint,
        citizen_name: complaint.citizen_name[0] + '***'
      },
      history
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
