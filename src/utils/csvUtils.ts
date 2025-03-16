
import { Habit } from "@/types/habit";

export const saveToCSV = (habits: Habit[]) => {
  // Header row
  const csvRows = ["id,name,createdAt,entryDate,count"];
  
  // Data rows
  habits.forEach(habit => {
    if (habit.entries.length === 0) {
      // If there are no entries, still include the habit
      csvRows.push(`${habit.id},${habit.name},${habit.createdAt},,0`);
    } else {
      // Add each entry as a row
      habit.entries.forEach(entry => {
        csvRows.push(
          `${habit.id},${habit.name},${habit.createdAt},${entry.date},${entry.count}`
        );
      });
    }
  });
  
  // Create and download the CSV file
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `habits_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const loadFromCSV = async (file: File): Promise<Habit[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        if (!result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const lines = result.split("\n");
        if (lines.length <= 1) {
          reject(new Error("CSV file is empty or has only headers"));
          return;
        }
        
        // Skip header row and process data
        const dataRows = lines.slice(1).filter(line => line.trim() !== "");
        
        // Group by habit ID
        const habitsMap = new Map<string, Habit>();
        
        dataRows.forEach(row => {
          const [id, name, createdAt, entryDate, countStr] = row.split(",");
          const count = parseInt(countStr, 10) || 0;
          
          if (!habitsMap.has(id)) {
            // Create new habit if it doesn't exist in the map
            habitsMap.set(id, {
              id,
              name,
              createdAt,
              entries: []
            });
          }
          
          // Add entry to habit if entry date exists
          if (entryDate) {
            const habit = habitsMap.get(id)!;
            habit.entries.push({
              date: entryDate,
              count
            });
          }
        });
        
        resolve(Array.from(habitsMap.values()));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(file);
  });
};
