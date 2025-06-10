import React, { useState, useEffect } from 'react';
import paymentService, { PaymentMethod } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'pro_monthly' | 'pro_yearly' | 'enterprise_monthly' | 'enterprise_yearly';
  planName: string;
  onPaymentSuccess: () => void;
}

type PaymentStep = 'select' | 'processing' | 'success' | 'error';

const PaymentModal = ({
  isOpen,
  onClose,
  planType,
  planName,
  onPaymentSuccess
}: PaymentModalProps) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<PaymentStep>('select');

  const pricing = paymentService.getPricing();
  const currentPlan = pricing[planType];
  useEffect(() => {
    if (isOpen) {
      const loadPaymentMethods = async () => {
        const methods = await paymentService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      };
      loadPaymentMethods();
      setStep('select');
      setError('');
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!user || !selectedMethod) return;

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {      const paymentRequest = {
        planType,
        amount: currentPlan.amount,
        currency: currentPlan.currency,
        userId: String(user.id),
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };      let result;
      switch (selectedMethod) {
        case 'momo':
          result = await paymentService.createMoMoPayment(paymentRequest);
          break;
        case 'zalopay':
          result = await paymentService.createZaloPayPayment(paymentRequest);
          break;
        case 'vnpay':
          result = await paymentService.createVNPayPayment(paymentRequest);
          break;
        default:
          const paymentMethod = paymentMethods.find(m => m.id === selectedMethod);
          result = await paymentService.createPayment(paymentRequest, paymentMethod || paymentMethods[0]);
      }

      if (result.success && result.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = result.paymentUrl;
      } else {
        setError(result.error || 'Không thể tạo thanh toán');
        setStep('error');
      }
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'momo':
        return <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">M</div>;
      case 'zalopay':
        return <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">Z</div>;
      case 'vnpay':
        return <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">V</div>;      case 'banking':
        return <span className="text-2xl">🏦</span>;
      default:
        return <span className="text-2xl">💳</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <>
              {/* Plan Summary */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{planName}</h3>                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá:</span>
                  <span className="text-2xl font-bold text-pink-600">
                    {paymentService.formatPrice(currentPlan.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600">Chu kỳ:</span>
                  <span className="text-gray-800">{planType.includes('monthly') ? '/tháng' : '/năm'}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Chọn phương thức thanh toán</h4>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                      />
                      <div className="flex items-center space-x-3 flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                        {getMethodIcon(method.type)}
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">                <div className="flex items-start space-x-2">
                  <span className="text-yellow-600 mt-0.5 text-lg">⚠️</span>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      Bằng cách tiếp tục, bạn đồng ý với{' '}
                      <a href="#" className="text-pink-600 hover:underline">Điều khoản dịch vụ</a>{' '}
                      và{' '}
                      <a href="#" className="text-pink-600 hover:underline">Chính sách bảo mật</a>{' '}
                      của chúng tôi.
                    </p>
                    <p>
                      Gói đăng ký sẽ tự động gia hạn. Bạn có thể hủy bất cứ lúc nào trong tài khoản của mình.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 text-lg">⚠️</span>
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (                    <div className="flex items-center justify-center space-x-2">
                      <span className="animate-spin text-lg">⟳</span>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Thanh toán ngay'
                  )}
                </button>
              </div>
            </>
          )}          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="text-pink-500 text-6xl animate-spin mx-auto mb-4">⟳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý thanh toán</h3>
              <p className="text-gray-600">Vui lòng không đóng cửa sổ này...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-600 mb-6">Gói {planName} đã được kích hoạt cho tài khoản của bạn.</p>
              <button
                onClick={() => {
                  onPaymentSuccess();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Tiếp tục
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thanh toán thất bại</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
