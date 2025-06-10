import React, { useState, useEffect, useRef } from 'react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'restaurant' | 'attraction' | 'hotel' | 'shopping';
  rating: number;
  description: string;
  image: string;
  distance?: number;
}

const MapPage: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Location[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const mapRef = useRef<HTMLDivElement>(null);

  // Sample locations (replace with real data from APIs)
  const sampleLocations: Location[] = [
    {
      id: '1',
      name: 'Chùa Một Cột',
      lat: 21.0285,
      lng: 105.8542,
      category: 'attraction',
      rating: 4.5,
      description: 'Ngôi chùa lịch sử nổi tiếng với kiến trúc độc đáo',
      image: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Phở Thìn',
      lat: 21.0245,
      lng: 105.8412,
      category: 'restaurant',
      rating: 4.8,
      description: 'Quán phở truyền thống nổi tiếng Hà Nội',
      image: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Khách sạn Metropole',
      lat: 21.0278,
      lng: 105.8470,
      category: 'hotel',
      rating: 4.9,
      description: 'Khách sạn sang trọng với lịch sử lâu đời',
      image: '/api/placeholder/300/200'
    },
    {
      id: '4',
      name: 'Chợ Đồng Xuân',
      lat: 21.0358,
      lng: 105.8487,
      category: 'shopping',
      rating: 4.2,
      description: 'Chợ truyền thống với đủ loại hàng hóa',
      image: '/api/placeholder/300/200'
    }
  ];

  useEffect(() => {
    // Initialize map with sample locations
    setNearbyPlaces(sampleLocations);
  }, []);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setIsLoadingLocation(false);
          // In real app, call nearby places API here
          searchNearbyPlaces(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          // Default to Hanoi center
          setCurrentLocation({ lat: 21.0285, lng: 105.8542 });
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ định vị GPS');
      setIsLoadingLocation(false);
    }
  };

  const searchNearbyPlaces = (lat: number, lng: number) => {
    // In real app, call Google Places API or similar
    // For demo, calculate distance to sample locations
    const placesWithDistance = sampleLocations.map(place => ({
      ...place,
      distance: calculateDistance(lat, lng, place.lat, place.lng)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    setNearbyPlaces(placesWithDistance);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    // In real app, use Google Geocoding API
    // For demo, search in sample locations
    const results = sampleLocations.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.description.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length > 0) {
      setSelectedLocation(results[0]);
      setCurrentLocation({ lat: results[0].lat, lng: results[0].lng });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'hotel': return '🏨';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'restaurant': return 'bg-orange-500';
      case 'attraction': return 'bg-blue-500';
      case 'hotel': return 'bg-green-500';
      case 'shopping': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bản Đồ Du Lịch</h1>
                <p className="text-gray-600">Khám phá địa điểm xung quanh bạn</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mapType === 'roadmap' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Bản đồ
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mapType === 'satellite' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Vệ tinh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Tìm Kiếm Địa Điểm</h2>
              <div className="space-y-4">                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
                    placeholder="Tìm kiếm địa điểm..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span className="text-lg">🧭</span>
                    <span>{isLoadingLocation ? 'Đang tìm...' : 'Vị trí của tôi'}</span>
                  </button>
                  
                  <button
                    onClick={() => searchLocation(searchQuery)}
                    className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">🔍</span>
                    <span>Tìm kiếm</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Vị Trí Hiện Tại</h3>                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-xl text-blue-600">🧭</span>
                  <div>
                    <p className="font-medium text-blue-900">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                    <p className="text-sm text-blue-600">Tọa độ GPS</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nearby Places */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Địa Điểm Gần Đây</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {nearbyPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => setSelectedLocation(place)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${getCategoryColor(place.category)} rounded-lg flex items-center justify-center text-white text-sm`}>
                        {getCategoryIcon(place.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{place.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{place.description}</p>
                        <div className="flex items-center justify-between mt-2">                          <div className="flex items-center space-x-1">
                            <span className="w-4 h-4 text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600">{place.rating}</span>
                          </div>
                          {place.distance && (
                            <span className="text-sm text-gray-500">{place.distance.toFixed(1)} km</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Map placeholder - In real app, integrate with Google Maps */}
              <div 
                ref={mapRef}
                className="w-full h-[600px] bg-gradient-to-br from-blue-100 to-green-100 relative flex items-center justify-center"
              >                <div className="text-center">
                  <span className="text-6xl text-gray-400 mb-4 block">📍</span>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Bản Đồ Tương Tác</h3>
                  <p className="text-gray-600 mb-4">
                    Tích hợp Google Maps sẽ hiển thị ở đây
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 max-w-sm mx-auto">
                    <p className="text-sm text-gray-600">
                      <strong>API cần thiết:</strong><br />
                      • Google Maps JavaScript API<br />
                      • Google Places API<br />
                      • Google Geocoding API
                    </p>
                  </div>
                </div>

                {/* Sample markers */}
                {nearbyPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    className={`absolute w-8 h-8 ${getCategoryColor(place.category)} rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                    onClick={() => setSelectedLocation(place)}
                  >
                    {getCategoryIcon(place.category)}
                  </div>
                ))}
              </div>

              {/* Selected Location Info */}
              {selectedLocation && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <img
                      src={selectedLocation.image}
                      alt={selectedLocation.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold">{selectedLocation.name}</h4>
                        <div className={`px-2 py-1 ${getCategoryColor(selectedLocation.category)} text-white rounded-full text-xs`}>
                          {selectedLocation.category}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{selectedLocation.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">                          <div className="flex items-center space-x-1">
                            <span className="w-4 h-4 text-yellow-400">⭐</span>
                            <span className="text-sm">{selectedLocation.rating}/5</span>
                          </div>
                          {selectedLocation.distance && (
                            <span className="text-sm text-gray-500">
                              {selectedLocation.distance.toFixed(1)} km từ bạn
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">                          <button className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
                            <span className="w-5 h-5">❤️</span>
                          </button>
                          <button className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
                            <span className="w-5 h-5">📷</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">🔧 API Configuration Required</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables (.env):</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                <div>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</div>
                <div>REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here</div>
                <div>REACT_APP_GOOGLE_GEOCODING_API_KEY=your_api_key_here</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Required APIs:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Google Maps JavaScript API</strong> - Hiển thị bản đồ</li>
                <li>• <strong>Google Places API</strong> - Tìm địa điểm gần đây</li>
                <li>• <strong>Google Geocoding API</strong> - Chuyển đổi địa chỉ</li>
                <li>• <strong>Google Directions API</strong> - Chỉ đường</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
