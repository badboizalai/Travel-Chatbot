import React, { useState } from 'react';

interface PricingPlan {
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: any;
}

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const formatPrice = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    alert(`Đã chọn gói ${planName}. Tính năng thanh toán sẽ được thêm sau.`);
  };

  const plans: PricingPlan[] = [
    {
      name: 'Basic',
      price: 0,
      duration: 'Miễn phí',
      description: 'Trải nghiệm cơ bản với TravelMate AI',
      features: [
        '10 câu hỏi mỗi ngày',
        'Thông tin du lịch cơ bản',
        'Gợi ý địa điểm phổ biến',
        'Hỗ trợ tiếng Việt',
        'Thời gian phản hồi: 5-10 giây'
      ],
      color: 'from-gray-400 to-gray-600',
      icon: <span className="text-2xl">🌐</span>
    },
    {
      name: 'Pro',
      price: 299000,
      originalPrice: 599000,
      duration: '/tháng',
      description: 'Trải nghiệm AI thông minh nhất cho du lịch',
      features: [
        'Không giới hạn câu hỏi',
        'AI thông minh với GPT-4 & Claude',
        'Lập kế hoạch chi tiết từng ngày',
        'Tìm kiếm chỗ ở, vé máy bay',
        'Bản đồ tương tác với GPS',
        'Thông tin thời tiết thời gian thực',
        'Gợi ý ẩm thực đặc biệt',
        'Hỗ trợ đa ngôn ngữ',
        'Thời gian phản hồi: 1-2 giây',
        'Ưu tiên hỗ trợ 24/7'
      ],
      popular: true,
      color: 'from-pink-500 to-purple-600',
      icon: <span className="w-6 h-6">👑</span>    },
    {
      name: 'Enterprise',
      price: 999000,
      duration: '/tháng',
      description: 'Giải pháp toàn diện cho doanh nghiệp',
      features: [
        'Tất cả tính năng Pro',
        'API riêng biệt',
        'Tùy chỉnh thương hiệu',
        'Báo cáo phân tích chi tiết',
        'Tích hợp hệ thống riêng',
        'Hỗ trợ kỹ thuật ưu tiên',
        'Training AI theo yêu cầu',
        'SLA 99.9% uptime',
        'Dedicated support team'
      ],
      color: 'from-purple-600 to-indigo-600',
      icon: <span className="w-6 h-6">🛡️</span>
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Chọn gói <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">phù hợp</span> với bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Từ khám phá cơ bản đến AI chuyên sâu, chúng tôi có gói dịch vụ hoàn hảo cho mọi nhu cầu du lịch của bạn.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-gray-700">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-green-500">✨</span>
              <span>AI thông minh</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-blue-500">💬</span>
              <span>Tư vấn 24/7</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-purple-500">👑</span>
              <span>Trải nghiệm cao cấp</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-red-500">📍</span>
              <span>Bản đồ tương tác</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-yellow-500">⚡</span>
              <span>Phản hồi nhanh</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-indigo-500">🌐</span>
              <span>Đa ngôn ngữ</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300 shadow-2xl transform scale-105' 
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🔥 Phổ biến nhất
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  <span className="text-white text-2xl">{plan.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through block">
                      {formatPrice(plan.originalPrice)}{plan.duration}
                    </span>
                  )}
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Miễn phí' : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-1">{plan.duration}</span>
                    )}
                  </div>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:-translate-y-1'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                {plan.name === 'Basic' ? 'Bắt đầu miễn phí' : `Chọn gói ${plan.name}`}
              </button>
            </div>
          ))}
        </div>        <div className="text-center text-gray-600">
          <p className="mb-4">✨ Tất cả gói đều bao gồm bảo mật SSL và sao lưu dữ liệu</p>
          <p className="mb-4">🔄 Có thể thay đổi hoặc hủy gói bất cứ lúc nào</p>
          <p>📞 Hỗ trợ khách hàng 24/7 qua chat, email và điện thoại</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
