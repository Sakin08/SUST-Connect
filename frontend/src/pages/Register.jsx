import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { parseRegistrationNumber, parseStudentEmail, getDepartmentList } from '../utils/sustParser.js';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    registrationNumber: '',
    department: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState('');
  const [autoDetectedDept, setAutoDetectedDept] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Auto-detect department and batch from email or registration number
  useEffect(() => {
    if (formData.role !== 'student') return;

    let parsed = null;

    // Try registration number first
    if (formData.registrationNumber && formData.registrationNumber.length === 10) {
      parsed = parseRegistrationNumber(formData.registrationNumber);
    }
    // Try email if registration number didn't work
    else if (formData.email) {
      parsed = parseStudentEmail(formData.email);
    }

    if (parsed && parsed.isValid) {
      setBatch(parsed.batch);
      setAutoDetectedDept(parsed.department);
      // Auto-fill department if not manually set
      if (!formData.department || formData.department === autoDetectedDept) {
        setFormData(prev => ({ ...prev, department: parsed.department }));
      }
    }
  }, [formData.email, formData.registrationNumber, formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    // For students, validate email format (should contain registration number)
    if (formData.role === 'student') {
      const parsed = parseStudentEmail(formData.email);
      if (!parsed || !parsed.isValid) {
        setError('Please use your SUST student email (e.g., 2019331008@student.sust.edu)');
        return;
      }
      // Auto-set registration number and department from email
      formData.registrationNumber = parsed.fullRegNumber;
      formData.department = parsed.department;
    }

    // For teachers, department is required
    if (formData.role === 'teacher' && !formData.department) {
      setError('Department is required for teachers');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registrationNumber: formData.role === 'student' ? formData.registrationNumber : undefined,
        department: formData.department,
        phone: formData.phone
      });

      setBatch(res.data.batch);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      });

      // Check if user needs admin approval
      if (res.data.requiresApproval) {
        alert('✅ Registration successful!\n\nYour account is pending admin approval. You will receive an email once approved.\n\nPlease login after approval.');
        navigate('/login');
      } else {
        // Auto-approved users get tokens and can login
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
        }
        setUser(res.data);
        localStorage.setItem('hasAuth', 'true');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registrationNumber: formData.role === 'student' ? formData.registrationNumber : undefined,
        department: formData.department,
        phone: formData.phone
      });

      startResendTimer();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-2xl ring-4 ring-white/50 hover:scale-110 transition-transform">
            <span className="text-3xl sm:text-4xl">🎓</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Join SUST Connect
          </h2>
          <p className="text-sm sm:text-base text-gray-600">SUST Student Community Platform</p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-110' : 'bg-gray-300'}`}></div>
            <div className={`w-12 sm:w-16 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-110' : 'bg-gray-300'}`}></div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-2">
            {step === 1 ? '📝 Step 1: Enter Details' : '✉️ Step 2: Verify OTP'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm mb-6 animate-fadeIn">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  placeholder="MD Sakin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <option value="student">🎓 Student</option>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="other">👤 Other</option>
                </select>
              </div>

              {/* Auto-detected info display for students */}
              {formData.role === 'student' && batch && autoDetectedDept && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-900 mb-2">Auto-Detected from Email</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-green-700 font-semibold">Registration:</p>
                          <p className="text-green-900 font-bold">{formData.registrationNumber || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-green-700 font-semibold">Batch:</p>
                          <p className="text-green-900 font-bold">{batch}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-green-700 font-semibold">Department:</p>
                          <p className="text-green-900 font-bold">{autoDetectedDept}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Department selector for teachers only */}
              {formData.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Chemical">Chemical Engineering</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Economics">Economics</option>
                    <option value="English">English</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  placeholder={formData.role === 'student' ? '2019331008@student.sust.edu' : 'your@email.com'}
                />
                {formData.role === 'student' && !batch && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Use your SUST student email - we'll auto-detect your department and batch
                  </p>
                )}
                {/* <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">📧 Email Requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ <strong>@student.sust.edu</strong> - Auto-approved after OTP</li>
                    <li>✓ <strong>@teacher.sust.edu</strong> - Auto-approved after OTP</li>
                    <li>⏳ <strong>Other emails</strong> - Requires admin approval after OTP</li>
                  </ul>
                </div> */}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  placeholder="01XXXXXXXXX"
                  pattern="[0-9]{11}"
                />
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  11 digit Bangladeshi phone number
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 sm:py-3.5 rounded-2xl font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      We've sent a 6-digit OTP to
                    </p>
                    <p className="text-sm font-bold text-indigo-700 mt-0.5">{formData.email}</p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Check your inbox and spam folder
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  className="w-full px-4 py-4 bg-white/50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-center text-2xl sm:text-3xl font-bold tracking-[0.5em] shadow-sm hover:shadow-md"
                  placeholder="000000"
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Valid for 10 minutes
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold disabled:text-gray-400 disabled:cursor-not-allowed hover:underline transition-colors"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : '🔄 Resend OTP'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 sm:py-3.5 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 sm:py-3.5 rounded-2xl font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Complete Registration
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-900 mb-1">Security Notice</p>
              <p className="text-xs text-yellow-800">
                Never share your OTP with anyone. SUST Connect will never ask for your OTP via phone or other means.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
