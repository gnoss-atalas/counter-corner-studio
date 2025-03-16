
export interface HabitEntry {
  date: string;
  count: number;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  entries: HabitEntry[];
}
