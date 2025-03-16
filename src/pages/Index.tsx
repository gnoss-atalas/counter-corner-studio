import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Sun, Moon, Plus, Download, Upload } from "lucide-react";
import HabitsList from "@/components/HabitsList";
import ActivityGraph from "@/components/ActivityGraph";
import { Habit, HabitEntry } from "@/types/habit";
import { saveToCSV, loadFromCSV } from "@/utils/csvUtils";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error("Failed to parse habits:", e);
        setHabits([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Error",
        description: "Habit name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const habitExists = habits.some(
      (habit) => habit.name.toLowerCase() === newHabitName.toLowerCase()
    );

    if (habitExists) {
      toast({
        title: "Error",
        description: "A habit with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      createdAt: new Date().toISOString(),
      entries: [],
    };

    setHabits([...habits, newHabit]);
    setNewHabitName("");
    toast({
      title: "Success",
      description: "Habit added successfully",
    });
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id));
    toast({
      title: "Success",
      description: "Habit deleted successfully",
    });
  };

  const trackHabit = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];

    setHabits(
      habits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const todayEntry = habit.entries.find(
          (entry) => entry.date.split("T")[0] === today
        );

        if (todayEntry) {
          const updatedEntries = habit.entries.map((entry) => {
            if (entry.date.split("T")[0] === today) {
              return { ...entry, count: entry.count + 1 };
            }
            return entry;
          });
          return { ...habit, entries: updatedEntries };
        } else {
          const newEntry: HabitEntry = {
            date: new Date().toISOString(),
            count: 1,
          };
          return { ...habit, entries: [...habit.entries, newEntry] };
        }
      })
    );
  };

  const exportData = () => {
    saveToCSV(habits);
    toast({
      title: "Success",
      description: "Habits exported to CSV successfully",
    });
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedHabits = await loadFromCSV(file);
      setHabits(importedHabits);
      toast({
        title: "Success",
        description: "Habits imported from CSV successfully",
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast({
        title: "Error",
        description: "Failed to import habits from CSV",
        variant: "destructive",
      });
    }
    
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <Moon className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Habit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                />
                <Button onClick={addHabit}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Habits</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportData}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <label htmlFor="import-csv">
                    <Button variant="outline" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                    <input
                      id="import-csv"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={importData}
                    />
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HabitsList
                habits={habits}
                onTrack={trackHabit}
                onDelete={deleteHabit}
              />
            </CardContent>
          </Card>

          {habits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityGraph habits={habits} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
