import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

// Password strength calculator
function getPasswordStrength(pwd, labels = { 0: '', 1: 'Yếu', 2: 'Trung bình', 3: 'Khá', 4: 'Mạnh', 5: 'Rất mạnh' }) {
  if (!pwd) return { score: 0, label: labels[0], color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 1, label: labels[1], color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: labels[2], color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: labels[3], color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: labels[4], color: 'bg-green-500' };
  return { score: 5, label: labels[5], color: 'bg-emerald-500' };
}

export default function RegisterPage() {
  const { systemLang, tSystem } = useLanguage();
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
    nativeLanguage: 'vi', learningLanguages: ['en'], agreeTerms: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'
  const debounceRef = useRef(null);

  const { register, checkUsername } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [texts, setTexts] = useState({
    title: 'Tạo tài khoản',
    subtitle: 'Bắt đầu hành trình khám phá ngôn ngữ!',
    fullName: 'Họ và tên',
    username: 'Tên đăng nhập',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    nativeLang: 'Ngôn ngữ mẹ đẻ',
    wantToLearn: 'Muốn học',
    agreeTo: 'Tôi đồng ý với',
    terms: 'Điều khoản sử dụng',
    and: 'và',
    privacy: 'Chính sách bảo mật',
    registerBtn: 'TẠO TÀI KHOẢN',
    creating: 'Đang tạo tài khoản...',
    hasAccount: 'Đã có tài khoản?',
    login: 'Đăng nhập',
    usernameAvailable: 'Tên đăng nhập khả dụng',
    usernameTaken: 'Tên đăng nhập đã tồn tại',
    checking: 'Đang kiểm tra...',
    strengthLabel: 'Độ mạnh:',
    match: 'Mật khẩu khớp',
    placeholderName: 'Nguyễn Văn A',
    placeholderPwd: 'Ít nhất 6 ký tự, gồm chữ và số',
    placeholderConfirm: 'Nhập lại mật khẩu',
    strength: { 0: '', 1: 'Yếu', 2: 'Trung bình', 3: 'Khá', 4: 'Mạnh', 5: 'Rất mạnh' },
    errNameReq: 'Vui lòng nhập họ tên',
    errNameMin: 'Họ tên phải có ít nhất 2 ký tự',
    errNameMax: 'Họ tên không được quá 50 ký tự',
    errUserReq: 'Vui lòng nhập tên đăng nhập',
    errUserRange: 'Tên đăng nhập phải từ 3-20 ký tự',
    errUserChars: 'Chỉ chứa chữ thường, số và dấu _',
    errUserExists: 'Tên đăng nhập đã tồn tại',
    errEmailReq: 'Vui lòng nhập email',
    errEmailInvalid: 'Email không hợp lệ',
    errPwdReq: 'Vui lòng nhập mật khẩu',
    errPwdMin: 'Mật khẩu phải có ít nhất 6 ký tự',
    errPwdComplex: 'Phải chứa ít nhất 1 chữ cái và 1 số',
    errConfirmReq: 'Vui lòng xác nhận mật khẩu',
    errConfirmMatch: 'Mật khẩu xác nhận không khớp',
    errTerms: 'Bạn phải đồng ý điều khoản sử dụng',
    regSuccess: 'Đăng ký thành công! Chào mừng đến LingoVoyage! 🎉',
    regFailed: 'Đăng ký thất bại'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        title: await tSystem('Tạo tài khoản'),
        subtitle: await tSystem('Bắt đầu hành trình khám phá ngôn ngữ!'),
        fullName: await tSystem('Họ và tên'),
        username: await tSystem('Tên đăng nhập'),
        email: await tSystem('Email'),
        password: await tSystem('Mật khẩu'),
        confirmPassword: await tSystem('Xác nhận mật khẩu'),
        nativeLang: await tSystem('Ngôn ngữ mẹ đẻ'),
        wantToLearn: await tSystem('Muốn học'),
        agreeTo: await tSystem('Tôi đồng ý với'),
        terms: await tSystem('Điều khoản sử dụng'),
        and: await tSystem('và'),
        privacy: await tSystem('Chính sách bảo mật'),
        registerBtn: await tSystem('TẠO TÀI KHOẢN'),
        creating: await tSystem('Đang tạo tài khoản...'),
        hasAccount: await tSystem('Đã có tài khoản?'),
        login: await tSystem('Đăng nhập'),
        usernameAvailable: await tSystem('Tên đăng nhập khả dụng'),
        usernameTaken: await tSystem('Tên đăng nhập đã tồn tại'),
        checking: await tSystem('Đang kiểm tra...'),
        strengthLabel: await tSystem('Độ mạnh:'),
        match: await tSystem('Mật khẩu khớp'),
        placeholderName: await tSystem('Nguyễn Văn A'),
        placeholderPwd: await tSystem('Ít nhất 6 ký tự, gồm chữ và số'),
        placeholderConfirm: await tSystem('Nhập lại mật khẩu'),
        strength: {
          0: '',
          1: await tSystem('Yếu'),
          2: await tSystem('Trung bình'),
          3: await tSystem('Khá'),
          4: await tSystem('Mạnh'),
          5: await tSystem('Rất mạnh')
        },
        errNameReq: await tSystem('Vui lòng nhập họ tên'),
        errNameMin: await tSystem('Họ tên phải có ít nhất 2 ký tự'),
        errNameMax: await tSystem('Họ tên không được quá 50 ký tự'),
        errUserReq: await tSystem('Vui lòng nhập tên đăng nhập'),
        errUserRange: await tSystem('Tên đăng nhập phải từ 3-20 ký tự'),
        errUserChars: await tSystem('Chỉ chứa chữ thường, số và dấu _'),
        errUserExists: await tSystem('Tên đăng nhập đã tồn tại'),
        errEmailReq: await tSystem('Vui lòng nhập email'),
        errEmailInvalid: await tSystem('Email không hợp lệ'),
        errPwdReq: await tSystem('Vui lòng nhập mật khẩu'),
        errPwdMin: await tSystem('Mật khẩu phải có ít nhất 6 ký tự'),
        errPwdComplex: await tSystem('Phải chứa ít nhất 1 chữ cái và 1 số'),
        errConfirmReq: await tSystem('Vui lòng xác nhận mật khẩu'),
        errConfirmMatch: await tSystem('Mật khẩu xác nhận không khớp'),
        errTerms: await tSystem('Bạn phải đồng ý điều khoản sử dụng'),
        regSuccess: await tSystem('Đăng ký thành công! Chào mừng đến LingoVoyage! 🎉'),
        regFailed: await tSystem('Đăng ký thất bại')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  const strength = getPasswordStrength(form.password, texts.strength);

  // Real-time username check with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const username = form.username.trim().toLowerCase();
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const available = await checkUsername(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);
  }, [form.username, checkUsername]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleLanguage = (lang) => {
    setForm(prev => {
      const langs = prev.learningLanguages.includes(lang)
        ? prev.learningLanguages.filter(l => l !== lang)
        : [...prev.learningLanguages, lang];
      return { ...prev, learningLanguages: langs };
    });
  };

  // Full validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = texts.errNameReq;
    else if (form.name.trim().length < 2) errs.name = texts.errNameMin;
    else if (form.name.trim().length > 50) errs.name = texts.errNameMax;

    if (!form.username.trim()) errs.username = texts.errUserReq;
    else if (form.username.length < 3 || form.username.length > 20) errs.username = texts.errUserRange;
    else if (!/^[a-z0-9_]+$/.test(form.username.toLowerCase())) errs.username = texts.errUserChars;
    else if (usernameStatus === 'taken') errs.username = texts.errUserExists;

    if (!form.email.trim()) errs.email = texts.errEmailReq;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = texts.errEmailInvalid;

    if (!form.password) errs.password = texts.errPwdReq;
    else if (form.password.length < 6) errs.password = texts.errPwdMin;
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) errs.password = texts.errPwdComplex;

    if (!form.confirmPassword) errs.confirmPassword = texts.errConfirmReq;
    else if (form.password !== form.confirmPassword) errs.confirmPassword = texts.errConfirmMatch;

    if (!form.agreeTerms) errs.agreeTerms = texts.errTerms;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      await register({
        name: form.name.trim(),
        username: form.username.toLowerCase().trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        nativeLanguage: form.nativeLanguage,
        learningLanguages: form.learningLanguages,
      });
      toast.success(texts.regSuccess);
      navigate('/user/notebook');
    } catch (err) {
      const msg = err.message || texts.regFailed;
      if (err.field) {
        setErrors({ [err.field]: msg });
      } else {
        setErrors({ general: msg });
      }
      toast.error(msg);
    }
    setIsSubmitting(false);
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${errors[field] ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-gray-200 focus:border-primary'
    }`;

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h3 className="text-2xl font-heading font-bold text-gray-800">{texts.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{texts.subtitle}</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-fade-in">
          <span>⚠️</span> {errors.general}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.fullName} <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
            <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)}
              className={inputClass('name')} placeholder={texts.placeholderName} autoComplete="name" />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.name}</p>}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.username} <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input type="text" value={form.username} onChange={e => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className={`${inputClass('username')} ${usernameStatus === 'available' ? '!border-green-400 !bg-green-50/30' : ''} ${usernameStatus === 'taken' ? '!border-red-400 !bg-red-50/30' : ''}`}
              placeholder="username_123" maxLength={20} autoComplete="username" />
            {usernameStatus === 'checking' && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></span>}
            {usernameStatus === 'available' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✅</span>}
            {usernameStatus === 'taken' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">❌</span>}
          </div>
          {form.username && !errors.username && usernameStatus === 'available' && <p className="mt-1 text-xs text-green-600">{texts.usernameAvailable}</p>}
          {usernameStatus === 'taken' && !errors.username && <p className="mt-1 text-xs text-red-500">{texts.usernameTaken}</p>}
          {errors.username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.email} <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
            <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
              className={inputClass('email')} placeholder="example@email.com" autoComplete="email" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.password} <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => updateField('password', e.target.value)}
              className={`${inputClass('password')} !pr-12`} placeholder={texts.placeholderPwd} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showPwd ? '👁️' : '🙈'}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-gray-200'}`}></div>
                ))}
              </div>
              <p className={`text-xs font-medium ${strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                {texts.strengthLabel} {strength.label}
              </p>
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.confirmPassword} <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔐</span>
            <input type={showConfirmPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)}
              className={`${inputClass('confirmPassword')} !pr-12`} placeholder={texts.placeholderConfirm} autoComplete="new-password" />
            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showConfirmPwd ? '👁️' : '🙈'}
            </button>
          </div>
          {form.confirmPassword && form.password === form.confirmPassword && <p className="mt-1 text-xs text-green-600 flex items-center gap-1">✅ {texts.match}</p>}
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠️</span>{errors.confirmPassword}</p>}
        </div>

        {/* Language Selection */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.nativeLang}</label>
            <select value={form.nativeLanguage} onChange={e => updateField('nativeLanguage', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white">
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{texts.wantToLearn}</label>
            <div className="flex flex-wrap gap-2">
              {[{ code: 'en', label: '🇬🇧 English' }, { code: 'zh', label: '🇨🇳 中文' }, { code: 'ko', label: '🇰🇷 한국어' }].map(lang => (
                <label key={lang.code} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${form.learningLanguages.includes(lang.code) ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>
                  <input type="checkbox" className="hidden" checked={form.learningLanguages.includes(lang.code)} onChange={() => toggleLanguage(lang.code)} />
                  {lang.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="pt-1">
          <label className={`flex items-start gap-2.5 cursor-pointer ${errors.agreeTerms ? 'text-red-500' : ''}`}>
            <input type="checkbox" checked={form.agreeTerms} onChange={e => updateField('agreeTerms', e.target.checked)}
              className={`mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer ${errors.agreeTerms ? 'border-red-400' : ''}`} />
            <span className="text-xs text-gray-600 leading-relaxed">
              {texts.agreeTo} <a href="#" className="text-primary font-medium hover:underline">{texts.terms}</a> {texts.and} <a href="#" className="text-primary font-medium hover:underline">{texts.privacy}</a> của LingoVoyage
            </span>
          </label>
          {errors.agreeTerms && <p className="mt-1 text-xs text-red-500 ml-6">{errors.agreeTerms}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {texts.creating}
            </>
          ) : texts.registerBtn}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {texts.hasAccount}{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            {texts.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
