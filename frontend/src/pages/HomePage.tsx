import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Globe, MapPin, Sparkles } from 'lucide-react';

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const features = [    {
      icon: <Globe className="w-8 h-8" />,
      title: 'AI Chat Thông Minh',
      description: 'Trò chuyện với AI để được tư vấn du lịch cá nhân hóa 24/7',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Khám Phá Điểm Đến',
      description: 'Tìm hiểu hàng trăm địa điểm tuyệt vời khắp Việt Nam',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Dự Báo Thời Tiết',
      description: 'Thông tin thời tiết chính xác để lên kế hoạch hoàn hảo',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Gợi Ý Cá Nhân',
      description: 'Nhận gợi ý phù hợp với sở thích và ngân sách của bạn',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const destinations = [
    {
      name: 'Hạ Long Bay',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=300&h=200&fit=crop',
      rating: 4.8,
      description: 'Kỳ quan thiên nhiên thế giới'
    },
    {
      name: 'Hội An',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop',
      rating: 4.7,
      description: 'Phố cổ đậm chất Việt Nam'
    },
    {
      name: 'Sapa',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      rating: 4.6,
      description: 'Ruộng bậc thang tuyệt đẹp'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden pt-16 pb-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-60"
            animate={{ 
              y: [0, 20, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-60"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div 
            className="flex justify-center mb-8"
            variants={itemVariants}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <motion.div 
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-white text-lg">✨</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            Khám Phá
            <motion.span 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {' '}Việt Nam{' '}
            </motion.span>
            <br />Cùng AI Thông Minh
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            🌟 Trải nghiệm du lịch hoàn toàn mới với TravelMate AI! Từ lập kế hoạch chi tiết, 
            tư vấn điểm đến, dự báo thời tiết đến khám phá ẩm thực địa phương - tất cả chỉ trong một ứng dụng!
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Khám Phá Ngay
                <span className="ml-2">→</span>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >              <Link
                to="/chat"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-800 font-semibold rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
              >
                <Star className="mr-2 w-5 h-5" />
                Trò Chuyện với AI
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {[
              { number: '100+', label: 'Điểm đến' },
              { number: '50K+', label: 'Người dùng' },
              { number: '4.8★', label: 'Đánh giá' },
              { number: '24/7', label: 'Hỗ trợ AI' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <div className="text-3xl font-bold text-gray-800">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn TravelMate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trợ lý AI thông minh giúp bạn có những chuyến du lịch hoàn hảo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Destinations Preview */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-50 to-purple-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Điểm Đến Phổ Biến
            </h2>
            <p className="text-xl text-gray-600">
              Khám phá những địa điểm tuyệt vời nhất Việt Nam
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold text-sm">{destination.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600">
                    {destination.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/demo"                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Xem Tất Cả Điểm Đến
                <span className="ml-2">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={itemVariants}
          >
            Bắt Đầu Hành Trình Khám Phá
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90"
            variants={itemVariants}
          >
            Hãy để TravelMate AI đồng hành cùng bạn trong mọi chuyến du lịch tuyệt vời!
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >            <Link
              to="/demo"
              className="inline-flex items-center px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Khám Phá Ngay
              <span className="ml-2">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
