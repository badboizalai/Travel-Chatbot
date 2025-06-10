import React, { useState } from 'react';
import api from '../services/api';

interface BookingFormData {
  type: 'flight' | 'hotel' | 'train';
  from?: string;
  to?: string;
  checkIn?: string;
  checkOut?: string;
  departure?: string;
  return?: string;
  passengers?: number;
  guests?: number;
  rooms?: number;
  class?: string;
}

const BookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'train'>('flight');
  const [formData, setFormData] = useState<BookingFormData>({
    type: 'flight',
    passengers: 1,
    guests: 1,
    rooms: 1,
    class: 'economy'
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const endpoint = `/booking/${activeTab}/search`;
      const response = await api.post(endpoint, formData);
      setSearchResults(response.data.results || []);
    } catch (error: any) {
      setError(error.response?.data?.detail || `Failed to search ${activeTab}s`);
      console.error('Booking search error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleBooking = async (item: any) => {
    try {
      const endpoint = `/booking/${activeTab}`;
      await api.post(endpoint, {
        ...formData,
        selectedItem: item
      });
      
      // Handle successful booking
      alert('Booking successful! Check your bookings in the profile section.');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Booking failed. Please try again.');
    }
  };

  const renderFlightForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="text"
          value={formData.from || ''}
          onChange={(e) => handleInputChange('from', e.target.value)}
          placeholder="Departure city"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
        <input
          type="text"
          value={formData.to || ''}
          onChange={(e) => handleInputChange('to', e.target.value)}
          placeholder="Destination city"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
        <input
          type="date"
          value={formData.departure || ''}
          onChange={(e) => handleInputChange('departure', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Return (Optional)</label>
        <input
          type="date"
          value={formData.return || ''}
          onChange={(e) => handleInputChange('return', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
        <select
          value={formData.passengers}
          onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
        <select
          value={formData.class}
          onChange={(e) => handleInputChange('class', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="economy">Economy</option>
          <option value="business">Business</option>
          <option value="first">First Class</option>
        </select>
      </div>
    </div>
  );

  const renderHotelForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
        <input
          type="text"
          value={formData.to || ''}
          onChange={(e) => handleInputChange('to', e.target.value)}
          placeholder="City or hotel name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
        <select
          value={formData.rooms}
          onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4].map(num => (
            <option key={num} value={num}>{num} room{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          value={formData.checkIn || ''}
          onChange={(e) => handleInputChange('checkIn', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          value={formData.checkOut || ''}
          onChange={(e) => handleInputChange('checkOut', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
        <select
          value={formData.guests}
          onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTrainForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="text"
          value={formData.from || ''}
          onChange={(e) => handleInputChange('from', e.target.value)}
          placeholder="Departure station"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
        <input
          type="text"
          value={formData.to || ''}
          onChange={(e) => handleInputChange('to', e.target.value)}
          placeholder="Destination station"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
        <input
          type="date"
          value={formData.departure || ''}
          onChange={(e) => handleInputChange('departure', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
        <select
          value={formData.passengers}
          onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Book Your Travel</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { key: 'flight', label: 'Flights', icon: '✈️' },
          { key: 'hotel', label: 'Hotels', icon: '🏨' },
          { key: 'train', label: 'Trains', icon: '🚄' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setFormData(prev => ({ ...prev, type: tab.key as any }));
              setSearchResults([]);
              setError('');
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch}>
          {activeTab === 'flight' && renderFlightForm()}
          {activeTab === 'hotel' && renderHotelForm()}
          {activeTab === 'train' && renderTrainForm()}
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : `Search ${activeTab}s`}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
          <div className="space-y-4">
            {searchResults.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name || item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {item.duration && <span>Duration: {item.duration} • </span>}
                      {item.stops !== undefined && <span>Stops: {item.stops} • </span>}
                      {item.rating && <span>Rating: {item.rating}/5</span>}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">${item.price}</div>
                    <button
                      onClick={() => handleBooking(item)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && !error && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'flight' && '✈️'}
            {activeTab === 'hotel' && '🏨'}
            {activeTab === 'train' && '🚄'}
          </div>
          <p>Fill out the form above to search for {activeTab}s</p>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
