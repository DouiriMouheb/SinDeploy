// src/utils/pdfGenerator.js - PDF generation utility for timesheets
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTimesheetPDF = (user, timesheets, dateRange = null) => {
  // Validate inputs
  if (!user) {
    throw new Error("User information is required to generate PDF");
  }

  if (!timesheets || !Array.isArray(timesheets)) {
    throw new Error("Valid timesheet data is required to generate PDF");
  }

  if (timesheets.length === 0) {
    throw new Error("No timesheet entries available to generate PDF");
  }

  const doc = new jsPDF();

  // Add company header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Timesheet Report", 20, 25);

  // Add user information
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  // Handle both single name and firstName/lastName formats
  const userName =
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unknown User";
  doc.text(`Employee: ${userName}`, 20, 40);
  doc.text(`Email: ${user.email}`, 20, 48);
  doc.text(`Role: ${user.role}`, 20, 56);

  // Add date range if provided
  if (dateRange) {
    doc.text(`Period: ${dateRange.start} - ${dateRange.end}`, 20, 64);
  }

  // Add generation date
  const generatedDate = new Date().toLocaleDateString();
  doc.text(`Generated: ${generatedDate}`, 20, 72);

  // Prepare table data
  const tableColumns = [
    "Date",
    "Project",
    "Customer",
    "Activity",
    "Start Time",
    "End Time",
    "Duration",
    "Description",
  ];

  const tableRows = timesheets.map((entry) => {
    const startDate = new Date(entry.startTime);
    const endDate = entry.endTime ? new Date(entry.endTime) : null;

    const formatTime = (date) => {
      return date
        ? date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--";
    };

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US");
    };

    const calculateDuration = (start, end) => {
      if (!end) return "In Progress";
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    return [
      formatDate(startDate),
      entry.workProject?.name || "No Project",
      entry.workProject?.customer?.name || "No Customer",
      entry.activity?.name || "No Activity",
      formatTime(startDate),
      formatTime(endDate),
      calculateDuration(startDate, endDate),
      entry.description || "No description",
    ];
  });

  // Calculate total hours
  const totalMinutes = timesheets.reduce((total, entry) => {
    if (entry.endTime) {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      return total + (end - start) / (1000 * 60);
    }
    return total;
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.floor(totalMinutes % 60);

  // Add table
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 85,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Date
      1: { cellWidth: 25 }, // Project
      2: { cellWidth: 25 }, // Customer
      3: { cellWidth: 25 }, // Activity
      4: { cellWidth: 20 }, // Start Time
      5: { cellWidth: 20 }, // End Time
      6: { cellWidth: 20 }, // Duration
      7: { cellWidth: 30 }, // Description
    },
    didDrawPage: function (data) {
      // Add page footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  // Add summary
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 150;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Summary:", 20, finalY);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Total Entries: ${timesheets.length}`, 20, finalY + 10);
  doc.text(`Total Time: ${totalHours}h ${remainingMinutes}m`, 20, finalY + 18);

  // Count completed vs in-progress entries
  const completedEntries = timesheets.filter((entry) => entry.endTime).length;
  const inProgressEntries = timesheets.length - completedEntries;

  doc.text(`Completed Entries: ${completedEntries}`, 20, finalY + 26);
  if (inProgressEntries > 0) {
    doc.text(`In Progress: ${inProgressEntries}`, 20, finalY + 34);
  }

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  // Handle both single name and firstName/lastName formats for filename
  const userNameForFile = user.name
    ? user.name.replace(/\s+/g, "_")
    : `${user.firstName || "Unknown"}_${user.lastName || "User"}`;
  const filename = `timesheet_${userNameForFile}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);

  return filename;
};
