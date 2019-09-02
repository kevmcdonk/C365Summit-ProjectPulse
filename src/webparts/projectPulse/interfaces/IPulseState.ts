import { IPulseItem } from './IPulseItem';

export interface IPulseState {
  status: string;
  items: IPulseItem[];
  showPulses: boolean;
  showLoading: boolean;
  showTemperature: boolean;
  temperature: number;
  happyCount: number;
  mehCount: number;
  sadCount: number;
  pulseText: string;
}