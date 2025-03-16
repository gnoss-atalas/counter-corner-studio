
import { useMemo } from "react";
import { Habit } from "@/types/habit";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface ActivityGraphProps {
  habits: Habit[];
}

interface DataPoint {
  date: string;
  value: number;
  habitName: string;
}

const ActivityGraph = ({ habits }: ActivityGraphProps) => {
  const activityData = useMemo(() => {
    const data: DataPoint[] = [];
    
    // Group all entries by date
    const entriesByDate = new Map<string, { total: number; habits: Set<string> }>();
    
    habits.forEach(habit => {
      habit.entries.forEach(entry => {
        const dateStr = entry.date.split('T')[0]; // YYYY-MM-DD
        const existingDate = entriesByDate.get(dateStr);
        
        if (existingDate) {
          existingDate.total += entry.count;
          existingDate.habits.add(habit.name);
        } else {
          entriesByDate.set(dateStr, { 
            total: entry.count, 
            habits: new Set([habit.name]) 
          });
        }
      });
    });
    
    // Convert to array for chart
    Array.from(entriesByDate.entries()).forEach(([dateStr, { total, habits }]) => {
      data.push({
        date: dateStr,
        value: total,
        habitName: Array.from(habits).join(", ")
      });
    });
    
    // Sort by date (oldest first)
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [habits]);

  const config = {
    activities: {
      label: "Activities",
      theme: {
        light: "#16a34a",
        dark: "#22c55e",
      },
    },
  };

  if (activityData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Track your habits to see your activity graph!
      </div>
    );
  }

  return (
    <ChartContainer className="h-[300px]" config={config}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          name="Date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(date) => {
            const dateObj = new Date(date);
            return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
          }}
        />
        <YAxis 
          dataKey="value" 
          name="Count" 
          tick={{ fontSize: 12 }}
          domain={[0, 'dataMax + 2']}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as DataPoint;
              const date = new Date(data.date);
              const formattedDate = date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <ChartTooltipContent>
                  <div className="text-sm font-medium">{formattedDate}</div>
                  <div className="text-sm text-muted-foreground">
                    Habits: {data.habitName}
                  </div>
                  <div className="font-medium">
                    Count: {data.value}
                  </div>
                </ChartTooltipContent>
              );
            }
            return null;
          }}
        />
        <Scatter
          name="activities"
          data={activityData}
          fill="var(--color-activities)"
          line={{ stroke: "var(--color-activities)", strokeWidth: 1 }}
          lineType="monotone"
        />
      </ScatterChart>
    </ChartContainer>
  );
};

export default ActivityGraph;
