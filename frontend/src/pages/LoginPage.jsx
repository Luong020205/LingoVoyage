import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { systemLang, tSystem } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [texts, setTexts] = useState({
    title: 'Đăng nhập',
    subtitle: 'Chào mừng trở lại! Tiếp tục hành trình học tập.',
    emailLabel: 'Email',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    loginBtn: 'ĐĂNG NHẬP',
    processing: 'Đang xử lý...',
    orLoginWith: 'hoặc đăng nhập bằng',
    noAccount: 'Chưa có tài khoản?',
    registerFree: 'Đăng ký miễn phí',
    savedAccounts: 'Tài khoản đã lưu',
    loginSuccess: 'Đăng nhập thành công! 🎉',
    loginFailed: 'Đăng nhập thất bại',
    emailRequired: 'Vui lòng nhập email',
    emailInvalid: 'Email không hợp lệ',
    passwordRequired: 'Vui lòng nhập mật khẩu'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        title: await tSystem('Đăng nhập'),
        subtitle: await tSystem('Chào mừng trở lại! Tiếp tục hành trình học tập.'),
        emailLabel: await tSystem('Email'),
        passwordLabel: await tSystem('Mật khẩu'),
        passwordPlaceholder: await tSystem('Nhập mật khẩu'),
        rememberMe: await tSystem('Ghi nhớ đăng nhập'),
        forgotPassword: await tSystem('Quên mật khẩu?'),
        loginBtn: await tSystem('ĐĂNG NHẬP'),
        processing: await tSystem('Đang xử lý...'),
        orLoginWith: await tSystem('hoặc đăng nhập bằng'),
        noAccount: await tSystem('Chưa có tài khoản?'),
        registerFree: await tSystem('Đăng ký miễn phí'),
        savedAccounts: await tSystem('Tài khoản đã lưu'),
        loginSuccess: await tSystem('Đăng nhập thành công! 🎉'),
        loginFailed: await tSystem('Đăng nhập thất bại'),
        emailRequired: await tSystem('Vui lòng nhập email'),
        emailInvalid: await tSystem('Email không hợp lệ'),
        passwordRequired: await tSystem('Vui lòng nhập mật khẩu')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem('lv_saved_accounts') || '[]');
    setSavedAccounts(accounts);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleLoginSuccess = async (response) => {
    setIsSubmitting(true);
    setErrors({});
    try {
      await loginWithGoogle(response.credential);
      toast.success(texts.loginSuccess);
      navigate('/user/notebook');
    } catch (err) {
      const msg = err.message || texts.loginFailed;
      setErrors({ general: msg });
      toast.error(msg);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER') {
          console.warn('⚠️ VITE_GOOGLE_CLIENT_ID is not configured in frontend/.env');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLoginSuccess,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%', // full width
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    if (window.google) {
      initGoogleSignIn();
    } else {
      const timer = setTimeout(initGoogleSignIn, 500);
      return () => clearTimeout(timer);
    }
  }, [loginWithGoogle, texts.loginSuccess, texts.loginFailed]);

  const selectAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setRememberMe(true);
    setShowDropdown(false);
  };

  const removeAccount = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(acc => acc.email !== emailToRemove);
    setSavedAccounts(updated);
    localStorage.setItem('lv_saved_accounts', JSON.stringify(updated));
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = texts.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = texts.emailInvalid;
    if (!password) errs.password = texts.passwordRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      await login({ email, password, rememberMe });

      if (rememberMe) {
        const accounts = JSON.parse(localStorage.getItem('lv_saved_accounts') || '[]');
        const filtered = accounts.filter(acc => acc.email !== email);
        const updated = [{ email, password }, ...filtered].slice(0, 5);
        localStorage.setItem('lv_saved_accounts', JSON.stringify(updated));
      }

      toast.success(texts.loginSuccess);
      navigate('/user/notebook');
    } catch (err) {
      const msg = err.message || texts.loginFailed;
      if (err.field) {
        setErrors({ [err.field]: msg });
      } else {
        setErrors({ general: msg });
      }
      toast.error(msg);
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔐</span>
        </div>
        <h3 className="text-2xl font-heading font-bold text-gray-800">{texts.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{texts.subtitle}</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-fade-in">
          <span>⚠️</span> {errors.general}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.emailLabel}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
            <input
              type="email"
              value={email}
              onFocus={() => savedAccounts.length > 0 && setShowDropdown(true)}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-gray-200 focus:border-primary'
                }`}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.email}</p>}

          {/* Account Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">{texts.savedAccounts}</span>
                <button type="button" onClick={() => setShowDropdown(false)} className="text-gray-400 hover:text-gray-600 text-xs p-1">✕</button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {savedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectAccount(acc)}
                    className="flex items-center justify-between p-3 hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {acc.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{acc.email}</span>
                        <span className="text-[10px] text-gray-400">••••••••</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeAccount(e, acc.email)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.passwordLabel}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${errors.password ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-gray-200 focus:border-primary'
                }`}
              placeholder={texts.passwordPlaceholder}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPwd ? '👁️' : '🙈'}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.password}</p>}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{texts.rememberMe}</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            {texts.forgotPassword}
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {texts.processing}
            </>
          ) : texts.loginBtn}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400 uppercase tracking-wider">{texts.orLoginWith}</span></div>
      </div>

      {/* Social Login */}
      <div className="mt-6 flex justify-center w-full">
        <div id="googleSignInBtn" className="w-full flex justify-center rounded-xl overflow-hidden shadow-sm"></div>
      </div>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {texts.noAccount}{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            {texts.registerFree}
          </Link>
        </p>
      </div>
    </div>
  );
}
