export const mockUsers = [
  {
    id: 1,
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    id: 2,
    email: "manager@company.com",
    password: "manager123",
    role: "manager",
    name: "Manager User",
  },
  {
    id: 3,
    email: "user@company.com",
    password: "user123",
    role: "user",
    name: "Regular User",
  },
];

export const initialTickets = [
  {
    id: 1,
    title: "Website Bug Fix",
    description: "Fix login page issue",
    status: "open",
    priority: "high",
    assignee: "John Doe",
    createdAt: "2025-05-20",
  },
  {
    id: 2,
    title: "Feature Request",
    description: "Add dark mode",
    status: "in-progress",
    priority: "medium",
    assignee: "Jane Smith",
    createdAt: "2025-05-21",
  },
  {
    id: 3,
    title: "Database Optimization",
    description: "Improve query performance",
    status: "closed",
    priority: "low",
    assignee: "Bob Johnson",
    createdAt: "2025-05-22",
  },
];

export const dashboardStats = [
  { title: "Open Tickets", value: "12", color: "bg-blue-500" },
  { title: "Overdue Items", value: "3", color: "bg-red-500" },
  { title: "Completed This Week", value: "24", color: "bg-purple-500" },
];
