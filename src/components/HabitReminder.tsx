
import { useState } from "react";
import { Habit, HabitReminder } from "@/types/habit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Clock, Bell, BellOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

interface HabitReminderProps {
  habit: Habit;
  onUpdate: (updatedHabit: Habit) => void;
}

const HabitReminderComponent = ({ habit, onUpdate }: HabitReminderProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [time, setTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "wednesday", "friday"]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addReminder = () => {
    if (selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day of the week",
        variant: "destructive",
      });
      return;
    }

    const newReminder: HabitReminder = {
      id: Date.now().toString(),
      time,
      days: [...selectedDays],
      enabled: true
    };

    const updatedHabit = {
      ...habit,
      reminders: [...habit.reminders, newReminder]
    };

    onUpdate(updatedHabit);
    setIsAdding(false);
    setTime("08:00");
    setSelectedDays(["monday", "wednesday", "friday"]);

    toast({
      title: "Success",
      description: "Reminder added successfully",
    });
  };

  const toggleReminderStatus = (reminderId: string) => {
    const updatedReminders = habit.reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    );

    onUpdate({
      ...habit,
      reminders: updatedReminders
    });
  };

  const deleteReminder = (reminderId: string) => {
    const updatedReminders = habit.reminders.filter(
      reminder => reminder.id !== reminderId
    );

    onUpdate({
      ...habit,
      reminders: updatedReminders
    });

    toast({
      title: "Success",
      description: "Reminder deleted successfully",
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Reminders</h3>
        {!isAdding && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)}
          >
            <Bell className="h-4 w-4 mr-1" /> Add Reminder
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 border rounded-md space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Repeat on</p>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <label 
                    htmlFor={`day-${day.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={addReminder}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {habit.reminders.length > 0 && (
        <div className="space-y-2">
          {habit.reminders.map((reminder) => (
            <div 
              key={reminder.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center gap-2">
                {reminder.enabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">{reminder.time}</p>
                  <p className="text-xs text-muted-foreground">
                    {reminder.days.map(day => day.slice(0, 3)).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={reminder.enabled}
                  onCheckedChange={() => toggleReminderStatus(reminder.id)}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteReminder(reminder.id)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitReminderComponent;
