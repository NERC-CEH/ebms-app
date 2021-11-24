export type MatchParams = {
  isExact: boolean;
  params: {
    smpId: string;
    taxa: string;
  };
  path: string;
  url: string;
};

export interface Point {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: any;
}
