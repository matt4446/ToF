// Define interfaces for our data structures
export interface TimePoint {
  id: string;
  time: number;
  label: string;
}

export interface DurationPair {
  startId: string;
  endId: string;
  duration: number;
}
