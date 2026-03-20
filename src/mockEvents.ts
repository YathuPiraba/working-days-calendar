import type { CalendarEvent } from "./types";

const year = new Date().getFullYear();
const month = String(new Date().getMonth() + 1).padStart(2, "0");
const d = (day: number) => `${year}-${month}-${String(day).padStart(2, "0")}`;

// Full ISO datetime helpers — used for events that need tz-aware placement
const dt = (day: number, time: string, tz = "+00:00") =>
  `${year}-${month}-${String(day).padStart(2, "0")}T${time}:00${tz}`;

export const mockEvents: CalendarEvent[] = [
  // ── Day 3 — single event, local date (no tz) ──────────────────────────
  {
    id: "evt-001",
    date: d(3),
    label: "Team standup",
    color: "#3B8BD4",
    priority: 1,
    data: {
      time: "09:00 AM",
      duration: "15 min",
      organizer: "Sarah K.",
      location: "Zoom",
    },
    onClick: (e) => console.log("clicked", e.id),
  },

  // ── Day 5 — two events ────────────────────────────────────────────────
  {
    id: "evt-002",
    date: d(5),
    label: "Deploy v2.1",
    color: "#1D9E75",
    priority: 2,
    data: {
      environment: "production",
      version: "2.1.0",
      owner: "DevOps",
      status: "scheduled",
    },
  },
  {
    id: "evt-003",
    date: d(5),
    label: "QA review",
    color: "#E8593C",
    priority: 1,
    data: {
      assignee: "Mike R.",
      tickets: "14 open",
      sprint: "Sprint 22",
    },
  },

  // ── Day 8 — overflow (4 events) ───────────────────────────────────────
  {
    id: "evt-004",
    date: d(8),
    label: "Design sync",
    color: "#9B59B6",
    priority: 4,
    data: {
      time: "10:00 AM",
      attendees: "5",
      figma: "link attached",
    },
  },
  {
    id: "evt-005",
    // UTC datetime — tooltip will show "UTC+0" badge
    date: dt(8, "15:00"),
    timezone: "UTC",
    label: "Budget review",
    color: "#E67E22",
    priority: 3,
    data: {
      quarter: "Q2",
      presenter: "Finance team",
      room: "Board room A",
    },
  },
  {
    id: "evt-006",
    date: d(8),
    label: "1:1 with Alex",
    color: "#3B8BD4",
    priority: 2,
    data: {
      time: "2:00 PM",
      duration: "30 min",
      notes: "Career growth discussion",
    },
  },
  {
    id: "evt-007",
    date: d(8),
    label: "Infra cost audit",
    color: "#E8593C",
    priority: 1,
    data: {
      tool: "AWS Cost Explorer",
      assignee: "Priya M.",
    },
  },

  // ── Day 12 — public holiday, no tz needed ────────────────────────────
  {
    id: "evt-008",
    date: d(12),
    label: "Public holiday",
    color: "#95A5A6",
    data: {
      note: "Office closed",
    },
  },

  // ── Day 14 — two events ───────────────────────────────────────────────
  {
    id: "evt-009",
    // New York office call — placed on the correct local day for NY viewers
    date: dt(14, "14:30", "-05:00"),
    timezone: "America/New_York",
    label: "Sprint planning",
    color: "#1D9E75",
    priority: 2,
    data: {
      time: "09:30 AM EST",
      sprint: "Sprint 23",
      points: "42 estimated",
      facilitator: "Emma L.",
    },
  },
  {
    id: "evt-010",
    date: d(14),
    label: "Client demo",
    color: "#E8593C",
    priority: 1,
    data: {
      client: "Acme Corp",
      time: "3:00 PM",
      attendees: "8",
      deck: "slides/acme-demo-v3.pdf",
    },
  },

  // ── Day 17 — overflow (5 events), mix of tz and plain dates ──────────
  {
    id: "evt-011",
    date: d(17),
    label: "All-hands",
    color: "#2C3E50",
    priority: 5,
    data: {
      time: "11:00 AM",
      host: "CEO",
      attendees: "All staff",
      agenda: "Q2 results",
    },
  },
  {
    id: "evt-012",
    // London team — BST (UTC+1) in summer
    date: dt(17, "10:00", "+01:00"),
    timezone: "Europe/London",
    label: "Hiring panel",
    color: "#9B59B6",
    priority: 4,
    data: {
      candidate: "Frontend engineer",
      interviewers: "3",
      stage: "Final round",
    },
  },
  {
    id: "evt-013",
    date: d(17),
    label: "Security scan",
    color: "#E67E22",
    priority: 3,
    data: {
      tool: "Snyk",
      scope: "All repos",
      report: "auto-generated",
    },
  },
  {
    id: "evt-014",
    date: d(17),
    label: "Lunch & learn",
    color: "#1D9E75",
    priority: 2,
    data: {
      topic: "GraphQL best practices",
      speaker: "Jordan T.",
      time: "12:30 PM",
    },
  },
  {
    id: "evt-015",
    date: d(17),
    label: "Retro",
    color: "#3B8BD4",
    priority: 1,
    data: {
      sprint: "Sprint 22",
      facilitator: "Emma L.",
      time: "4:30 PM",
    },
  },

  // ── Day 20 — today, one tz-aware event ────────────────────────────────
  {
    id: "evt-016",
    date: d(20),
    label: "Release cutoff",
    color: "#E8593C",
    priority: 2,
    data: {
      version: "2.2.0-rc1",
      owner: "Platform team",
      blocker: "none",
    },
  },
  {
    id: "evt-017",
    // Colombo office — IST (UTC+5:30). Tooltip shows "Asia/Colombo · UTC+5:30"
    date: dt(20, "08:30", "+05:30"),
    timezone: "Asia/Colombo",
    label: "User interviews",
    color: "#9B59B6",
    priority: 1,
    data: {
      participants: "3 users",
      researcher: "Dana W.",
      time: "2:00 PM IST",
      tool: "Maze",
    },
  },

  // ── Day 23 — plain local date ─────────────────────────────────────────
  {
    id: "evt-018",
    date: d(23),
    label: "Docs update",
    color: "#95A5A6",
    data: {
      assignee: "Tech writing",
      pages: "12 affected",
      pr: "#2041",
    },
  },

  // ── Day 25 — two events ───────────────────────────────────────────────
  {
    id: "evt-019",
    date: d(25),
    label: "Roadmap review",
    color: "#2C3E50",
    priority: 2,
    data: {
      quarter: "Q3 planning",
      owner: "Product",
      stakeholders: "Exec team",
    },
  },
  {
    id: "evt-020",
    // Tokyo on-call handoff — JST (UTC+9)
    date: dt(25, "09:00", "+09:00"),
    timezone: "Asia/Tokyo",
    label: "On-call handoff",
    color: "#E67E22",
    priority: 1,
    data: {
      outgoing: "Carlos M.",
      incoming: "Priya M.",
      runbook: "wiki/on-call",
    },
  },

  // ── Day 28 — end of month ─────────────────────────────────────────────
  {
    id: "evt-021",
    date: d(28),
    label: "Monthly report",
    color: "#1D9E75",
    priority: 1,
    data: {
      owner: "Analytics",
      due: "EOD",
      format: "PDF + Notion",
    },
  },
];
