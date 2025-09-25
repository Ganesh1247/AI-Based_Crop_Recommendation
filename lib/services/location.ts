export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data?: LocationData;
}

// Get user's current location using browser geolocation API
export const getCurrentLocation = (): Promise<LocationResponse> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const address = await reverseGeocode(latitude, longitude);
          
          resolve({
            success: true,
            message: 'Location retrieved successfully',
            data: {
              latitude,
              longitude,
              address
            }
          });
        } catch (error) {
          resolve({
            success: true,
            message: 'Location retrieved without address',
            data: {
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
          });
        }
      },
      (error) => {
        let message = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }

        resolve({
          success: false,
          message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Reverse geocoding using OpenStreetMap Nominatim API (free alternative to Google Maps)
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CropPredict-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    if (data.address) {
      const { village, town, city, county, state, country } = data.address;
      const location = village || town || city || county || state || country || 'Unknown location';
      return `${location}, ${state || country || ''}`.replace(', ,', ',').trim();
    }

    return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Get location from coordinates input
export const getLocationFromCoordinates = async (latitude: number, longitude: number): Promise<LocationResponse> => {
  try {
    const address = await reverseGeocode(latitude, longitude);
    
    return {
      success: true,
      message: 'Location retrieved from coordinates',
      data: {
        latitude,
        longitude,
        address
      }
    };
  } catch (error) {
    return {
      success: true,
      message: 'Coordinates processed without address lookup',
      data: {
        latitude,
        longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }
    };
  }
};

// Search for location by address
export const searchLocation = async (query: string): Promise<LocationResponse> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CropPredict-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Location search failed');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return {
        success: false,
        message: 'Location not found'
      };
    }

    const result = data[0];
    
    return {
      success: true,
      message: 'Location found',
      data: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name
      }
    };
  } catch (error) {
    console.error('Location search error:', error);
    return {
      success: false,
      message: 'Failed to search location'
    };
  }
};