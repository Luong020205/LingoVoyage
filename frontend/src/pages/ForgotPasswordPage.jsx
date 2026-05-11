import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  // Step: 1 = nhập email, 2 = nhập OTP + mật khẩu mới, 3 = thành công
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [devOtp, setDevOtp] = useState(''); // Chỉ cho dev, production bỏ

  const { forgotPassword, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // STEP 1: Gửi email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setErrors({ email: 'Vui lòng nhập email' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: 'Email không hợp lệ' }); return; }

    setIsSubmitting(true);
    setErrors({});
    try {
      const data = await forgotPassword(email);
      toast.success('Mã xác nhận đã được gửi!');
      if (data._devOtp) setDevOtp(data._devOtp); // Chỉ cho dev
      setStep(2);
    } catch (err) {
      setErrors({ email: err.message || 'Không thể gửi mã xác nhận' });
      toast.error(err.message || 'Lỗi');
    }
    setIsSubmitting(false);
  };

  // STEP 2: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!otp.trim()) errs.otp = 'Vui lòng nhập mã xác nhận';
    if (!newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 6) errs.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) errs.newPassword = 'Phải chứa ít nhất 1 chữ cái và 1 số';
    if (newPassword !== confirmNewPassword) errs.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    setErrors({});
    try {
      await resetPassword({ email, otp: otp.trim(), newPassword, confirmNewPassword });
      toast.success('Đặt lại mật khẩu thành công! 🎉');
      setStep(3);
    } catch (err) {
      const msg = err.message || 'Đặt lại mật khẩu thất bại';
      if (err.field) setErrors({ [err.field]: msg });
      else setErrors({ general: msg });
      toast.error(msg);
    }
    setIsSubmitting(false);
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${errors[field] ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-gray-200 focus:border-primary'
    }`;

  // ========== STEP 3: Success ==========
  if (step === 3) {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-2xl font-heading font-bold text-gray-800 mb-2">Thành công!</h3>
        <p className="text-gray-500 text-sm mb-8">Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới.</p>
        <button onClick={() => navigate('/login')}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/25 transition-all">
          ĐĂNG NHẬP NGAY
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">{step === 1 ? '🔑' : '🔐'}</span>
        </div>
        <h3 className="text-2xl font-heading font-bold text-gray-800">
          {step === 1 ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {step === 1
            ? 'Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận.'
            : `Nhập mã 6 số đã gửi đến ${email}`
          }
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6 justify-center">
        <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-fade-in">
          <span>⚠️</span> {errors.general}
        </div>
      )}

      {/* ========== STEP 1: Email ========== */}
      {step === 1 && (
        <form className="space-y-5" onSubmit={handleSendOtp} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email đã đăng ký</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }}
                className={inputClass('email')} placeholder="example@email.com" autoComplete="email" autoFocus />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/login"
              className="flex items-center justify-center py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ← Quay lại
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/25 transition-all disabled:opacity-60">
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'GỬI MÃ'}
            </button>
          </div>
        </form>
      )}

      {/* ========== STEP 2: OTP + New Password ========== */}
      {step === 2 && (
        <form className="space-y-4" onSubmit={handleResetPassword} noValidate>
          {/* Dev OTP hint */}
          {devOtp && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
              <span>🔧</span> <strong>DEV:</strong> Mã OTP là <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">{devOtp}</span>
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã xác nhận (6 số)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔢</span>
              <input type="text" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors(prev => ({ ...prev, otp: '' })); }}
                className={`${inputClass('otp')} font-mono text-center text-lg tracking-[0.5em]`} placeholder="000000" maxLength={6} autoFocus />
            </div>
            {errors.otp && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.otp}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
              <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: '' })); }}
                className={`${inputClass('newPassword')} !pr-12`} placeholder="Ít nhất 6 ký tự, gồm chữ và số" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPwd ? '👁️' : '🙈'}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.newPassword}</p>}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔐</span>
              <input type="password" value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setErrors(prev => ({ ...prev, confirmNewPassword: '' })); }}
                className={inputClass('confirmNewPassword')} placeholder="Nhập lại mật khẩu mới" />
            </div>
            {errors.confirmNewPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.confirmNewPassword}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={() => { setStep(1); setErrors({}); }}
              className="py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ← Đổi email
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/25 transition-all disabled:opacity-60">
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'ĐẶT LẠI'}
            </button>
          </div>

          {/* Resend OTP */}
          <div className="text-center pt-2">
            <button type="button" onClick={async () => {
              setIsSubmitting(true);
              try {
                const data = await forgotPassword(email);
                if (data._devOtp) setDevOtp(data._devOtp);
                toast.success('Đã gửi lại mã xác nhận!');
              } catch (err) { toast.error('Không thể gửi lại mã'); }
              setIsSubmitting(false);
            }} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
              Gửi lại mã xác nhận
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
