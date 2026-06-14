import AuthService from './AuthService';
import { Env } from './Env';

const API_URL = Env.NEXT_PUBLIC_API_URL;

export interface PlanningRequest {
  start_lat: number;
  start_long: number;
  start_time: number;
  end_time: number;
  preferences: string[];
  max_places: number;
  seed: number;
  return_to_start: boolean;
}

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  category: string;
  rating: number;
}

export interface ScheduledPlace {
  place: Place;
  arrival_time: number;
  departure_time: number;
  distance_from_previous: number;
  activity_label: string;
}

export interface PlanningResponse {
  itinerary: ScheduledPlace[];
  total_distance: number;
  total_duration: number;
  average_rating: number;
  geometry?: any;
  return_geometry?: any;
}

export interface SaveTripRequest {
  name: string;
  start_time: number;
  end_time: number;
  total_distance: number;
  place_ids: string[];
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_time: number;
  end_time: number;
  total_distance: number;
}

export interface TripDetail extends Trip {
  itinerary: {
    trip_id: string;
    place_id: string;
    order_index: number;
    place: Place;
  }[];
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  place: Place;
}

class TripService {
  async generateTrip(data: PlanningRequest): Promise<PlanningResponse> {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate trip');
    }

    return response.json();
  }

  async saveTrip(data: SaveTripRequest): Promise<void> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save trip';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Fallback if response is not JSON
        errorMessage = (await response.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  async getTrips(): Promise<Trip[]> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/trips`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }

    return response.json();
  }

  async getTripDetail(id: string): Promise<TripDetail> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/trips/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch trip details. Status: ${response.status}`);
      let errorMessage = 'Failed to fetch trip details';
      try {
        const errorData = await response.json();
        console.error('Error response body:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback if not JSON
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteTrip(id: string): Promise<void> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/trips/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete trip');
    }
  }

  async getFavorites(): Promise<Favorite[]> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  }

  async addToFavorites(placeId: string): Promise<void> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ place_id: placeId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to favorites');
    }
  }

  async removeFromFavorites(placeId: string): Promise<void> {
    const token = AuthService.getAccessToken();
    const response = await fetch(`${API_URL}/favorites/${placeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }
  }

  async getAlternatives(type?: string, category?: string): Promise<Place[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);

    const response = await fetch(
      `${API_URL}/alternatives?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch alternatives');
    }

    return response.json();
  }
}

export default new TripService();
