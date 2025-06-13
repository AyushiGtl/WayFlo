export interface Location {
  id: string;
  name: string;
  type: 'room' | 'lab' | 'facility';
  description?: string;
  floor: number;
  coordinates?: {
    x: number;
    y: number;
  };
} 