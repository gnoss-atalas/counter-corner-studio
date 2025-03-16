
import { useMemo } from "react";
import { Habit } from "@/types/habit";
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns";

interface ActivityGraphProps {
  habits: Habit[];
}

interface DayData {
  date: string;
  count: number;
  formattedDate: string;
  habitNames: string[];
}

const ActivityGraph = ({ habits }: ActivityGraphProps) => {
  const heatmapData = useMemo(() => {
    // Create a map to store activity counts for each day
    const activityByDate = new Map<string, { count: number; habits: Set<string> }>();
    
    // Fill in the map with habit data
    habits.forEach(habit => {
      habit.entries.forEach(entry => {
        const dateStr = entry.date.split('T')[0]; // YYYY-MM-DD
        const currentData = activityByDate.get(dateStr);
        
        if (currentData) {
          currentData.count += entry.count;
          currentData.habits.add(habit.name);
        } else {
          activityByDate.set(dateStr, { 
            count: entry.count, 
            habits: new Set([habit.name]) 
          });
        }
      });
    });
    
    // Generate all dates for the last year (365 days)
    const today = new Date();
    const yearAgo = subDays(today, 364);
    
    const allDates = eachDayOfInterval({
      start: yearAgo,
      end: today
    });
    
    // Convert to array with all days of the year
    return allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const activityData = activityByDate.get(dateStr);
      
      return {
        date: dateStr,
        count: activityData?.count || 0,
        formattedDate: format(date, 'MMM d, yyyy'),
        habitNames: activityData ? Array.from(activityData.habits) : []
      } as DayData;
    });
  }, [habits]);

  // Function to determine cell color based on count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-muted hover:bg-muted/80";
    if (count <= 1) return "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50";
    if (count <= 3) return "bg-green-200 dark:bg-green-800/40 hover:bg-green-300 dark:hover:bg-green-800/60";
    if (count <= 5) return "bg-green-300 dark:bg-green-700/50 hover:bg-green-400 dark:hover:bg-green-700/70";
    if (count <= 7) return "bg-green-400 dark:bg-green-600/60 hover:bg-green-500 dark:hover:bg-green-600/80";
    return "bg-green-500 dark:bg-green-500/70 hover:bg-green-600 dark:hover:bg-green-500/90";
  };

  // Group heatmap data by weeks (for rendering rows)
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      
      // Start a new week after 7 days
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [heatmapData]);

  // Generate month labels for the top of the heatmap
  const monthLabels = useMemo(() => {
    const months: { month: string, index: number }[] = [];
    let currentMonth = '';
    
    heatmapData.forEach((day, index) => {
      const month = day.date.substring(5, 7); // Get month part (MM) from YYYY-MM-DD
      
      if (month !== currentMonth) {
        months.push({ month: format(parseISO(day.date), 'MMM'), index });
        currentMonth = month;
      }
    });
    
    return months;
  }, [heatmapData]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Track your habits to see your activity graph!
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Month labels */}
        <div className="flex h-8 text-xs text-muted-foreground">
          <div className="w-8"></div>
          <div className="flex-1 flex">
            {monthLabels.map((label, i) => (
              <div 
                key={i} 
                className="flex-shrink-0"
                style={{ 
                  marginLeft: i === 0 ? `${(label.index * 100) / 7}%` : 0,
                  width: i === monthLabels.length - 1 
                    ? `${100 - ((label.index * 100) / 7)}%` 
                    : `${((monthLabels[i+1]?.index || 0) - label.index) * 100 / 7}%`
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
        </div>
        
        {/* Day labels and heatmap grid */}
        <div className="flex">
          {/* Day of week labels */}
          <div className="w-8 text-xs text-muted-foreground">
            <div className="h-[10px] text-center">S</div>
            <div className="h-[10px] text-center">M</div>
            <div className="h-[10px] text-center">T</div>
            <div className="h-[10px] text-center">W</div>
            <div className="h-[10px] text-center">T</div>
            <div className="h-[10px] text-center">F</div>
            <div className="h-[10px] text-center">S</div>
          </div>
          
          {/* Calendar cells */}
          <div className="flex-1 flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    title={`${day.formattedDate}: ${day.count} activities${day.habitNames.length ? `\n${day.habitNames.join(', ')}` : ''}`}
                    className={`w-[10px] h-[10px] rounded-sm ${getCellColor(day.count)} transition-colors cursor-default`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-end items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-sm bg-muted"></div>
          <div className="w-[10px] h-[10px] rounded-sm bg-green-100 dark:bg-green-900/30"></div>
          <div className="w-[10px] h-[10px] rounded-sm bg-green-200 dark:bg-green-800/40"></div>
          <div className="w-[10px] h-[10px] rounded-sm bg-green-300 dark:bg-green-700/50"></div>
          <div className="w-[10px] h-[10px] rounded-sm bg-green-400 dark:bg-green-600/60"></div>
          <div className="w-[10px] h-[10px] rounded-sm bg-green-500 dark:bg-green-500/70"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityGraph;
