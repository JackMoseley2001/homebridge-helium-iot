export enum HeliumEventCategory {
  UPLINK,
  JOIN_REQUEST,
  JOIN_ACCEPT,
  UNKNOWN,
}

export type HeliumEventData = {
  payload: Buffer;
  port: number;
};

export type HeliumEvent = {
  category: HeliumEventCategory;
  data: HeliumEventData;
  reportedAt: Date;
};
