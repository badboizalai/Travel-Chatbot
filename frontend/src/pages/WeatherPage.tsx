import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Calendar } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

const WeatherPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mockWeatherData: WeatherData = {
    location: 'Hà Nội, Việt Nam',
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    forecast: [
      { date: 'Today', high: 30, low: 22, condition: 'Partly Cloudy' },
      { date: 'Tomorrow', high: 29, low: 21, condition: 'Cloudy' },
      { date: 'Wed', high: 31, low: 23, condition: 'Rainy' },
      { date: 'Thu', high: 27, low: 20, condition: 'Cloudy' },
      { date: 'Fri', high: 28, low: 21, condition: 'Sunny' },
      { date: 'Sat', high: 32, low: 24, condition: 'Partly Cloudy' },
      { date: 'Sun', high: 31, low: 24, condition: 'Sunny' }
    ]
  };

  const popularCities = [
    { name: 'Hồ Chí Minh', temp: 32, condition: 'Sunny' },
    { name: 'Đà Nẵng', temp: 29, condition: 'Partly Cloudy' },
    { name: 'Hải Phòng', temp: 26, condition: 'Cloudy' },
    { name: 'Hội An', temp: 30, condition: 'Sunny' },
    { name: 'Nha Trang', temp: 31, condition: 'Clear' },
    { name: 'Sapa', temp: 18, condition: 'Foggy' }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setWeatherData(mockWeatherData);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate search
    setTimeout(() => {
      setWeatherData({
        ...mockWeatherData,
        location: searchQuery
      });
      setIsLoading(false);
    }, 1000);
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-16 h-16 text-blue-500";
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <div className={`${iconClass} flex items-center justify-center text-yellow-500`}>☀️</div>;
      case 'partly cloudy':
        return <div className={`${iconClass} flex items-center justify-center text-gray-500`}>⛅</div>;
      case 'cloudy':
        return <div className={`${iconClass} flex items-center justify-center text-gray-600`}>☁️</div>;
      case 'rainy':
        return <div className={`${iconClass} flex items-center justify-center text-blue-600`}>🌧️</div>;
      case 'foggy':
        return <div className={`${iconClass} flex items-center justify-center text-gray-400`}>🌫️</div>;
      default:
        return <div className={`${iconClass} flex items-center justify-center text-blue-500`}>🌤️</div>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Thời Tiết Du Lịch
          </h1>
          <p className="text-gray-600">
            Theo dõi thời tiết để lên kế hoạch chuyến đi hoàn hảo
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm thành phố..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tìm
            </button>
          </div>
        </motion.div>

        {/* Current Weather */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin thời tiết...</p>
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key="weather"
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Weather Info */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <MapPin className="text-blue-500 mr-2 w-5 h-5" />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {weatherData.location}
                    </h2>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    {getWeatherIcon(weatherData.condition)}
                    <div className="ml-6">
                      <div className="text-5xl font-bold text-gray-800">
                        {weatherData.temperature}°C
                      </div>
                      <div className="text-xl text-gray-600">
                        {weatherData.condition}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {weatherData.humidity}%
                    </div>
                    <div className="text-sm text-gray-600">Độ ẩm</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {weatherData.windSpeed} km/h
                    </div>
                    <div className="text-sm text-gray-600">Gió</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {weatherData.pressure} hPa
                    </div>
                    <div className="text-sm text-gray-600">Áp suất</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {weatherData.uvIndex}
                    </div>
                    <div className="text-sm text-gray-600">UV Index</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 7-Day Forecast */}
        {weatherData && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <Calendar className="text-blue-500 mr-2 w-5 h-5" />
              <h3 className="text-xl font-semibold text-gray-800">
                Dự báo 7 ngày
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherData.forecast.map((day, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800 mb-2">
                    {day.date}
                  </div>
                  <div className="mb-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800">
                      {day.high}°
                    </div>
                    <div className="text-gray-500">
                      {day.low}°
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Popular Cities */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Thành phố phổ biến
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCities.map((city, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchQuery(city.name);
                  handleSearch();
                }}
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {city.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {city.condition}
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {city.temp}°C
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WeatherPage;
