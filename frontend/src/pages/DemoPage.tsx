import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Users, Search } from 'lucide-react';

const DemoPage = () => {
  const [selectedDestination, setSelectedDestination] = useState(0);

  const destinations = [
    {
      id: 1,
      name: 'Hạ Long Bay',
      location: 'Quảng Ninh',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
      description: 'Vịnh Hạ Long với hàng nghìn đảo đá vôi tạo nên cảnh quan tuyệt đẹp.',
      highlights: ['Du thuyền qua đêm', 'Hang Sửng Sốt', 'Làng chài Cửa Vạn', 'Kayak khám phá'],
      duration: '2-3 ngày',
      bestTime: 'Tháng 10 - Tháng 4',
      visitors: '6M+/năm'
    },
    {
      id: 2,
      name: 'Phố Cổ Hội An',
      location: 'Quảng Nam',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
      description: 'Thành phố cổ với kiến trúc độc đáo, ẩm thực phong phú và văn hóa đa dạng.',
      highlights: ['Phố đèn lồng', 'Chùa Cầu', 'Ẩm thực đường phố', 'May đo áo dài'],
      duration: '2-4 ngày',
      bestTime: 'Tháng 2 - Tháng 8',
      visitors: '5M+/năm'
    },
    {
      id: 3,
      name: 'Sapa',
      location: 'Lào Cai',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
      description: 'Thị trấn miền núi với ruộng bậc thang tuyệt đẹp và văn hóa dân tộc.',
      highlights: ['Ruộng bậc thang', 'Fansipan', 'Chợ tình Sapa', 'Bản làng dân tộc'],
      duration: '3-5 ngày',
      bestTime: 'Tháng 9 - Tháng 11, Tháng 3 - Tháng 5',
      visitors: '4M+/năm'
    },
    {
      id: 4,
      name: 'Phú Quốc',
      location: 'Kiên Giang',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      description: 'Đảo ngọc với bãi biển trắng, nước biển trong xanh và hải sản tươi ngon.',
      highlights: ['Bãi Sao', 'Cáp treo Hòn Thơm', 'Chợ đêm Dinh Cậu', 'Safari Phú Quốc'],
      duration: '3-7 ngày',
      bestTime: 'Tháng 11 - Tháng 4',
      visitors: '3M+/năm'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Khám Phá Việt Nam
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Cùng TravelMate AI khám phá những điểm đến tuyệt vời nhất tại Việt Nam
          </motion.p>
          <motion.div 
            className="flex justify-center space-x-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="text-blue-200">Điểm đến</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-200">Người dùng</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-blue-200">Đánh giá</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Destinations Section */}
      <motion.div 
        className="py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Điểm Đến Phổ Biến</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những địa điểm du lịch được yêu thích nhất tại Việt Nam
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Destination Cards */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((dest, index) => (
                  <motion.div
                    key={dest.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedDestination === index ? 'ring-4 ring-blue-500 scale-105' : 'hover:shadow-xl'
                    }`}
                    onClick={() => setSelectedDestination(index)}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative h-48">
                      <img 
                        src={dest.image} 
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-semibold text-sm">{dest.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{dest.name}</h3>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{dest.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{dest.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{dest.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{dest.visitors}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Detailed Info Panel */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <div className="mb-6">
                  <img 
                    src={destinations[selectedDestination].image}
                    alt={destinations[selectedDestination].name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {destinations[selectedDestination].name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {destinations[selectedDestination].description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-red-500" />
                      Điểm nổi bật
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {destinations[selectedDestination].highlights.map((highlight, index) => (
                        <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-gray-600">Thời gian tốt nhất:</span>
                    <span className="font-semibold">{destinations[selectedDestination].bestTime}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Thời lượng khuyến nghị:</span>
                    <span className="font-semibold">{destinations[selectedDestination].duration}</span>
                  </div>
                </div>

                <motion.button
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tìm hiểu thêm
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="py-16 bg-gradient-to-r from-blue-50 to-purple-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Tại sao chọn TravelMate?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trợ lý AI thông minh giúp bạn có chuyến du lịch hoàn hảo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Search className="w-8 h-8" />,
                title: 'Gợi ý thông minh',
                description: 'AI phân tích sở thích để đưa ra gợi ý phù hợp nhất'
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: 'Định vị chính xác',
                description: 'Tìm kiếm địa điểm và dẫn đường chi tiết'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Tiết kiệm thời gian',
                description: 'Lập kế hoạch du lịch nhanh chóng và hiệu quả'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Cộng đồng chia sẻ',
                description: 'Kết nối với cộng đồng du lịch Việt Nam'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoPage;
