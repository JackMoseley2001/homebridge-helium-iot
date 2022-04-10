import { DeviceConfig, HeliumEvent, HeliumEventCategory, HeliumEventData } from './types';

import { CONSOLE_API_URL } from './settings';
import axios from 'axios';

export async function fetchLatestEvent(device: DeviceConfig, apiKey: string): Promise<HeliumEvent | null> {
  const headers = {
    Key: apiKey,
    'Content-Type': 'application/json',
  };

  const url = `${CONSOLE_API_URL}/devices/${device.deviceId}/events?sub_category=uplink_unconfirmed`;

  const response = await axios({ url, method: 'GET', headers });

  if (response.status !== 200) {
    throw new Error('Failed to fetch latest event');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = response.data as { [key: string]: any };

  const events: HeliumEvent[] = json.map((value) => {
    const reportedAt = parseInt(value['reported_at']);

    return {
      category: getEventCategory(value['category']),
      data: getEventData(value['data']),
      reportedAt: new Date(reportedAt),
    };
  });

  if (events.length === 0) {
    return null;
  }

  return events
    .filter((val) => val.data.port == device.port)
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())[0];
}

function getEventCategory(value: string): HeliumEventCategory {
  switch (value) {
    case 'uplink':
      return HeliumEventCategory.UPLINK;
    case 'join_request':
      return HeliumEventCategory.JOIN_REQUEST;
    case 'join_accept':
      return HeliumEventCategory.JOIN_ACCEPT;
    default:
      return HeliumEventCategory.UNKNOWN;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEventData(data: { [key: string]: any }): HeliumEventData {
  const payload = Buffer.from(data['payload'], 'base64');
  return {
    payload: payload,
    port: data['port'],
  };
}
