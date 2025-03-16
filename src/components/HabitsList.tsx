
import { Habit } from "@/types/habit";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

interface HabitsListProps {
  habits: Habit[];
  onTrack: (id: string) => void;
  onDelete: (id: string) => void;
}

const HabitsList = ({ habits, onTrack, onDelete }: HabitsListProps) => {
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No habits added yet. Add your first habit above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        // Find today's entry for this habit
        const todayEntry = habit.entries.find(
          (entry) => entry.date.split("T")[0] === today
        );
        const todayCount = todayEntry ? todayEntry.count : 0;

        // Calculate total count for all time
        const totalCount = habit.entries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        return (
          <div
            key={habit.id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div>
              <h3 className="font-medium">{habit.name}</h3>
              <div className="text-sm text-muted-foreground">
                Today: {todayCount} | Total: {totalCount}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTrack(habit.id)}
              >
                <Plus className="h-4 w-4 mr-1" /> Track
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(habit.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitsList;
