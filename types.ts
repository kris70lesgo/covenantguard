export interface SalesData {
  month: string;
  visitors: number;
  sales: number; // purple segment
  ads: number;   // green segment
}

export interface TimelineEvent {
  year: string;
  title?: string;
  active?: boolean;
}

export interface Transaction {
  id: string;
  pair: string;
  avatars: string[];
}

export interface ForecastData {
  btcPrice: number;
  marketCap: number; // in Trillions
}

export interface AnalyticsData {
  label: string;
  amount: number;
  percentage: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface StatisticsData {
  label: string;
  value: number;
}