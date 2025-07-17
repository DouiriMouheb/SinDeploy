// routes/dailyLogin.js - Daily login tracking routes
const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireUser } = require("../middleware/rbac");
const { catchAsync } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUser);











/**
 * @route   GET /api/daily-login/team-overview
 * @desc    Get daily login overview for all team members (admins only)
 * @access  Private (Admin)
 */
router.get(
  "/team-overview",
  
  catchAsync(async (req, res) => {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const loginDate = targetDate.toISOString().split("T")[0];

    

   

    // Calculate summary
    const totalUsers = teamOverview.length;
    const usersStarted = teamOverview.filter(
      (u) => u.todayStatus.hasStartedDay
    ).length;
    const usersEnded = teamOverview.filter(
      (u) => u.todayStatus.hasEndedDay
    ).length;
    const usersActive = usersStarted - usersEnded;

    res.json({
      success: true,
      data: {
        date: loginDate,
        teamOverview,
        summary: {
          totalUsers,
          usersStartedToday: usersStarted,
          usersEndedToday: usersEnded,
          usersCurrentlyActive: usersActive,
        },
      },
    });
  })
);



module.exports = router;
