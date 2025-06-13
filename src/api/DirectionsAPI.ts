// src/api/DirectionsAPI.ts
import { config } from '../config';

interface DirectionRequest {
  from_: string | number;
  to: string | number;
}

interface DirectionResponse {
  from: string;
  to: string;
  path: number[];
  directions: string[];
  total_distance: number;
}

export const getDirections = async (fromId: string | number, toId: string | number): Promise<DirectionResponse> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/directions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_: fromId,
        to: toId,
      } as DirectionRequest),
    });

    if (!response.ok) {
      throw new Error(`Error fetching directions: ${response.statusText}`);
    }

    return await response.json() as DirectionResponse;
  } catch (error: unknown) {
    console.error('Failed to get directions:', error instanceof Error ? error.message : 'Unknown error');
    // Return a fallback response for development/testing
    return {
      from: 'Unknown',
      to: 'Unknown',
      path: [],
      directions: ['Unable to get directions. Please try again.'],
      total_distance: 0,
    };
  }
};