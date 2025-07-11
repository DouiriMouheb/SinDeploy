// src/services/timer.js - Legacy compatibility wrapper
// This file provides backward compatibility for old timer service imports
// All functionality has been moved to timesheets.js

import { timesheetService } from "./timesheets";

// Export timesheetService as timerService for backward compatibility
export const timerService = timesheetService;

// Default export
export default timerService;
