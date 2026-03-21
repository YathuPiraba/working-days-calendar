import type { CalendarEvent } from "./types";

const year = new Date().getFullYear();
const month = String(new Date().getMonth() + 1).padStart(2, "0");

/** Build a plain date string (no time — all-day event) */
const d = (day: number) => `${year}-${month}-${String(day).padStart(2, "0")}`;

/** Build a datetime string (timed event — appears on the time grid in week view) */
const dt = (day: number, time: string, tz = "+00:00") =>
  `${year}-${month}-${String(day).padStart(2, "0")}T${time}:00${tz}`;

// ─────────────────────────────────────────────────────────────────────────────
// Primary mock data
// Covers: multi-day spans, row-wrap, overflow, timed events, timezone events,
//         all-day banner, tooltip date range, tooltip timezone badge
// ─────────────────────────────────────────────────────────────────────────────
export const mockEvents: CalendarEvent[] = [
  // ── Multi-day: full week sprint (date-only → all-day banner in week view) ──
  {
    id: "span-001",
    date: d(3),
    endDate: d(7),
    label: "Sprint 22",
    color: "#3B8BD4",
    priority: 3,
    data: {
      team: "Engineering",
      points: "42 estimated",
      status: "in progress",
    },
  },

  // ── Multi-day: crosses a row boundary ─────────────────────────────────────
  {
    id: "span-002",
    date: d(9),
    endDate: d(13),
    label: "Design conference",
    color: "#9B59B6",
    priority: 2,
    data: { location: "San Francisco", attendees: "8 team members" },
  },

  // ── Multi-day: short 2-day event ──────────────────────────────────────────
  {
    id: "span-003",
    date: d(15),
    endDate: d(16),
    label: "Hackathon",
    color: "#E67E22",
    priority: 2,
    data: { theme: "AI tooling", venue: "Main office", prizes: "3 awarded" },
  },

  // ── Multi-day: long 11-day span ───────────────────────────────────────────
  {
    id: "span-004",
    date: d(18),
    endDate: d(28),
    label: "Q2 planning cycle",
    color: "#1D9E75",
    priority: 1,
    data: {
      owner: "Product",
      deliverable: "Roadmap v3",
      stakeholders: "Exec + leads",
    },
  },

  // ── Day 3: single-day alongside span-001 (track coexistence test) ─────────
  {
    id: "evt-001",
    date: d(3),
    label: "Team standup",
    color: "#E8593C",
    priority: 1,
    data: {
      time: "09:00 AM",
      duration: "15 min",
      organizer: "Sarah K.",
      location: "Zoom",
    },
    onClick: (e) => console.log("clicked", e.id),
  },

  // ── Day 5: two single-day events ──────────────────────────────────────────
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
    data: { assignee: "Mike R.", tickets: "14 open", sprint: "Sprint 22" },
  },

  // ── Day 8: overflow scenario — 4 events (triggers "+2 more" chip) ─────────
  //    evt-005 is timed → appears on time grid in week view
  //    evt-004, 006, 007 are date-only → appear in all-day banner in week view
  {
    id: "evt-004",
    date: d(8),
    label: "Design sync",
    color: "#9B59B6",
    priority: 4,
    data: { time: "10:00 AM", attendees: "5", figma: "link attached" },
  },
  {
    id: "evt-005",
    date: dt(8, "15:00"), // timed UTC → time grid in week view
    timezone: "UTC",
    label: "Budget review",
    color: "#E67E22",
    priority: 3,
    data: { quarter: "Q2", presenter: "Finance team", room: "Board room A" },
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
    data: { tool: "AWS Cost Explorer", assignee: "Priya M." },
  },

  // ── Day 12: single event ───────────────────────────────────────────────────
  {
    id: "evt-008",
    date: d(12),
    label: "Public holiday",
    color: "#95A5A6",
    data: { note: "Office closed" },
  },

  // ── Day 20: date-only + timed event ───────────────────────────────────────
  //    "Release cutoff" is date-only → all-day banner in week view
  //    "User interviews" is timed IST → time grid + timezone tooltip
  {
    id: "evt-016",
    date: d(20),
    label: "Release cutoff",
    color: "#E8593C",
    priority: 2,
    data: { version: "2.2.0-rc1", owner: "Platform team", blocker: "none" },
  },
  {
    id: "evt-017",
    date: dt(20, "08:30", "+05:30"), // timed IST → time grid + UTC+5:30 badge
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
];

// ─────────────────────────────────────────────────────────────────────────────
// Overlap mock data — use ONLY for docs/weekview-overlap.png
// Three timed events on day 17 that overlap → renders as side-by-side columns
// ─────────────────────────────────────────────────────────────────────────────
export const mockEventsOverlap: CalendarEvent[] = [
  {
    id: "overlap-001",
    date: dt(17, "09:00"), // 09:00–10:00 (default 1hr)
    label: "All-hands",
    color: "#2C3E50",
    priority: 3,
    data: { host: "CEO", duration: "1 hr", attendees: "All staff" },
  },
  {
    id: "overlap-002",
    date: dt(17, "09:30"),
    endDate: dt(17, "11:00"), // 09:30–11:00 → overlaps 001 and 003
    label: "Hiring panel",
    color: "#9B59B6",
    priority: 2,
    data: { candidate: "Frontend engineer", stage: "Final round" },
  },
  {
    id: "overlap-003",
    date: dt(17, "10:00"),
    endDate: dt(17, "10:45"), // 10:00–10:45 → overlaps 002
    label: "Security scan",
    color: "#E67E22",
    priority: 1,
    data: { tool: "Snyk", scope: "All repos" },
  },
  {
    id: "overlap-004",
    date: dt(17, "13:00"),
    endDate: dt(17, "13:30"), // no overlap — single column
    label: "Lunch & learn",
    color: "#1D9E75",
    priority: 1,
    data: { topic: "GraphQL best practices", speaker: "Jordan T." },
  },
  {
    id: "overlap-005",
    date: dt(17, "16:30"),
    endDate: dt(17, "17:15"), // no overlap — single column
    label: "Sprint retro",
    color: "#3B8BD4",
    priority: 1,
    data: { sprint: "Sprint 22", facilitator: "Emma L." },
  },
];
