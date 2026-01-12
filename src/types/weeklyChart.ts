// types/weekly-chart.ts
export interface WeekData {
  weekLabel: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  key: string;
}

export interface ChartDataPoint {
  week: string;
  value: number;
  weekNum: number;
  startDate?: Date;
  endDate?: Date;   
}

export interface SeriesData {
  label: string;
  data: number[];
  color: string;
}

export interface MonthlyWeekLineChartProps {
  dataPoints?: number[];
  year?: number;
  month?: number; // 0-indexed (0 = January)
  title?: string;
  series?: SeriesData[];
  height?: number;
  showArea?: boolean;
}