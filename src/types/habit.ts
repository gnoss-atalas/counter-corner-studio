
export interface HabitEntry {
  date: string;
  count: number;
}

export interface HabitReminder {
  id: string;
  time: string;
  days: string[]; // days of week: "monday", "tuesday", etc.
  enabled: boolean;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  entries: HabitEntry[];
  reminders: HabitReminder[];
}
