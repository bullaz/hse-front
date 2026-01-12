// utils/weekCalculations.ts

import type { WeekData } from "../types/weeklyChart";

export const getWeeksOfMonth = (year: number, month: number): WeekData[] => {
  const weeks: WeekData[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const currentDate = new Date(firstDay);
  let weekNumber = 1;
  
  while (currentDate <= lastDay) {
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const displayStart = weekStart < firstDay ? new Date(firstDay) : new Date(weekStart);
    const displayEnd = weekEnd > lastDay ? new Date(lastDay) : new Date(weekEnd);
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const weekLabel = `Week ${weekNumber}\n(${formatDate(displayStart)} - ${formatDate(displayEnd)})`;
    
    weeks.push({
      weekLabel,
      weekNumber,
      startDate: displayStart,
      endDate: displayEnd,
      key: `week-${year}-${month}-${weekNumber}`,
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return weeks;
};

export const getISOWeeksOfMonth = (year: number, month: number): WeekData[] => {
  const weeks: WeekData[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const currentDate = new Date(firstDay);
  let weekNumber = 1;
  
  while (currentDate <= lastDay) {
    const dayOfWeek = currentDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(currentDate);
    monday.setDate(monday.getDate() - diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    const displayStart = monday < firstDay ? new Date(firstDay) : new Date(monday);
    const displayEnd = sunday > lastDay ? new Date(lastDay) : new Date(sunday);
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    weeks.push({
      weekLabel: `W${weekNumber}\n(${formatDate(displayStart)} - ${formatDate(displayEnd)})`,
      weekNumber,
      startDate: displayStart,
      endDate: displayEnd,
      key: `iso-week-${year}-${month}-${weekNumber}`,
    });
    
    currentDate.setDate(currentDate.getDate() + (7 - diffToMonday));
    weekNumber++;
  }
  
  return weeks;
};

export const generateSampleData = (weeks: WeekData[], baseValue: number = 50): number[] => {
  return weeks.map((_, index) => {
    const trend = Math.sin(index * 0.5) * 20;
    const random = (Math.random() - 0.5) * 30;
    return Math.max(0, baseValue + trend + random);
  });
};

export const formatWeekTooltip = (value: number, weekData?: WeekData): string => {
  if (!weekData) return `${value}`;
  
  const start = weekData.startDate.toLocaleDateString();
  const end = weekData.endDate.toLocaleDateString();
  return `Week ${weekData.weekNumber}\n${start} - ${end}\nValue: ${value.toFixed(2)}`;
};

// Helper to get week number from date (ISO week)
export const getWeekNumber = (date: Date): number => {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};