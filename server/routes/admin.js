const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative username or password.'
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative username or password.'
      });
    }

    // Set session data
    req.session.adminId = user.id;
    req.session.username = user.username;

    res.json({
      success: true,
      message: 'Administrator authentication successful.',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not log out at this moment.'
      });
    }
    res.clearCookie('connect.sid');
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
});

// GET /api/admin/me
router.get('/me', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.session.adminId,
        username: req.session.username
      }
    });
  }
  return res.json({
    success: false,
    authenticated: false
  });
});

// Protect all following routes with requireAdminAuth
router.use(requireAdminAuth);

// GET /api/admin/dashboard - Metrics and stats
router.get('/dashboard', (req, res, next) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM complaints').get();
    const pendingRow = db.prepare("SELECT COUNT(*) as pending FROM complaints WHERE status = 'Pending'").get();
    const inProgressRow = db.prepare("SELECT COUNT(*) as in_progress FROM complaints WHERE status = 'In Progress'").get();
    const resolvedRow = db.prepare("SELECT COUNT(*) as resolved FROM complaints WHERE status = 'Resolved'").get();
    const rejectedRow = db.prepare("SELECT COUNT(*) as rejected FROM complaints WHERE status = 'Rejected'").get();

    // Category breakdown
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    // Recent 5 status changes
    const recentActivity = db.prepare(`
      SELECT 
        h.id, h.complaint_id, h.old_status, h.new_status, h.admin_note, h.changed_at,
        c.tracking_id, c.title, c.category
      FROM complaint_status_history h
      JOIN complaints c ON c.id = h.complaint_id
      ORDER BY h.changed_at DESC, h.id DESC
      LIMIT 6
    `).all();

    res.json({
      success: true,
      stats: {
        total: totalRow.total || 0,
        pending: pendingRow.pending || 0,
        in_progress: inProgressRow.in_progress || 0,
        resolved: resolvedRow.resolved || 0,
        rejected: rejectedRow.rejected || 0,
        categories,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/complaints - Filtered & searched complaints list
router.get('/complaints', (req, res, next) => {
  try {
    const { search, category, status, ward } = req.query;

    let query = `
      SELECT 
        id, tracking_id, citizen_name, mobile_number, email, category,
        title, description, ward_number, locality, landmark,
        status, created_at, updated_at
      FROM complaints
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        tracking_id LIKE ? OR 
        title LIKE ? OR 
        citizen_name LIKE ? OR 
        locality LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && category.trim() && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category.trim());
    }

    if (status && status.trim() && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status.trim());
    }

    if (ward && ward.trim() && ward !== 'All') {
      query += ` AND ward_number = ?`;
      params.push(ward.trim());
    }

    query += ` ORDER BY created_at DESC`;

    const complaints = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/complaints/:id - Single complaint with full history
router.get('/complaints/:id', (req, res, next) => {
  try {
    const complaint = db.prepare(`
      SELECT 
        id, tracking_id, citizen_name, mobile_number, email, category,
        title, description, ward_number, locality, landmark,
        status, created_at, updated_at
      FROM complaints 
      WHERE id = ?
    `).get(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
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
      complaint,
      history
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/complaints/:id/status - Update complaint status
router.patch('/complaints/:id/status', (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { status, admin_note } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (!admin_note || !admin_note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Administrative remarks or notes are required when updating status.'
      });
    }

    const existing = db.prepare('SELECT id, status, tracking_id FROM complaints WHERE id = ?').get(complaintId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const updateStmt = db.prepare(`
      UPDATE complaints 
      SET status = ?, updated_at = ?
      WHERE id = ?
    `);

    const insertHistoryStmt = db.prepare(`
      INSERT INTO complaint_status_history (
        complaint_id, old_status, new_status, admin_note, changed_at
      ) VALUES (
        ?, ?, ?, ?, ?
      )
    `);

    const updateTransaction = db.transaction(() => {
      updateStmt.run(status, now, complaintId);
      insertHistoryStmt.run(complaintId, existing.status, status, admin_note.trim(), now);
    });

    updateTransaction();

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    const history = db.prepare('SELECT * FROM complaint_status_history WHERE complaint_id = ? ORDER BY changed_at ASC, id ASC').all(complaintId);

    res.json({
      success: true,
      message: `Status updated to "${status}" successfully.`,
      complaint: updated,
      history
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
