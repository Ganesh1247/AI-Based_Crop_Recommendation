import { supabase } from '../supabase';

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Store OTPs with expiration times and attempt tracking
const otpStore = new Map<string, { 
  code: string; 
  expires: number; 
  attempts: number; 
  name: string;
  createdAt: number;
}>();

// Generate a 6-digit verification code with enhanced randomness
const generateVerificationCode = (): string => {
  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (100000 + (array[0] % 900000)).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean up expired OTPs
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expires < now) {
      otpStore.delete(phone);
      console.log(`🧹 Cleaned up expired OTP for ${phone}`);
    }
  }
};

// Get OTP status for debugging
export const getOTPStatus = (phone: string) => {
  const otp = otpStore.get(phone);
  if (!otp) return null;
  
  return {
    hasOTP: true,
    isExpired: otp.expires < Date.now(),
    attempts: otp.attempts,
    expiresIn: Math.max(0, otp.expires - Date.now()),
    createdAt: new Date(otp.createdAt).toLocaleString()
  };
};

// Send SMS verification code (simulate for demo)
export const sendVerificationCode = async (phone: string, name: string): Promise<AuthResponse> => {
  try {
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Try to store verification code in database
    try {
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          phone,
          code,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });

      if (insertError) {
        console.warn('Database storage failed, using local storage for demo:', insertError.message);
      }
    } catch (dbError) {
      console.warn('Database unavailable, using local storage for demo:', dbError);
      // Store in localStorage for demo purposes
      const verificationData = {
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        is_used: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(`verification_${phone}`, JSON.stringify(verificationData));
    }

    // Store OTP with enhanced tracking
    const now = Date.now();
    otpStore.set(phone, {
      code,
      expires: now + (5 * 60 * 1000), // 5 minutes
      attempts: 0,
      name,
      createdAt: now
    });

    // Clean up old OTPs
    cleanupExpiredOTPs();

    // In a real application, you would send SMS here using services like:
    // - Twilio SMS API
    // - AWS SNS
    // - Firebase Cloud Messaging
    // For demo purposes, we'll log the code with timestamp
    console.log(`🚀 Real-time SMS sent to ${phone}`);
    console.log(`📱 Your verification code: ${code}`);
    console.log(`⏰ Expires at: ${new Date(now + (5 * 60 * 1000)).toLocaleTimeString()}`);
    console.log(`🔍 OTP Status:`, getOTPStatus(phone));

    // Simulate realistic SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      data: { 
        code, // Remove this in production!
        expiresAt: expiresAt.toISOString()
      }
    };

  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: 'Failed to send verification code'
    };
  }
};

// Verify SMS code and create/login user
export const verifyCodeAndLogin = async (phone: string, code: string, name: string): Promise<AuthResponse> => {
  try {
    let verificationData = null;

    // Try to check verification code from database first
    try {
      const { data, error: verifyError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!verifyError && data) {
        verificationData = data;
        // Mark verification code as used
        await supabase
          .from('verification_codes')
          .update({ is_used: true })
          .eq('id', verificationData.id);
      }
    } catch (dbError) {
      console.warn('Database verification failed, checking localStorage:', dbError);
    }

    // Check real-time OTP store first
    if (!verificationData) {
      const otpData = otpStore.get(phone);
      if (otpData) {
        otpData.attempts++;
        
        // Check if too many attempts
        if (otpData.attempts > 3) {
          otpStore.delete(phone);
          return {
            success: false,
            message: 'Too many failed attempts. Please request a new code.'
          };
        }

        // Check if expired
        if (otpData.expires < Date.now()) {
          otpStore.delete(phone);
          return {
            success: false,
            message: 'Verification code has expired. Please request a new one.'
          };
        }

        // Check if code matches
        if (otpData.code === code) {
          otpStore.delete(phone); // Remove OTP after successful verification
          verificationData = {
            code,
            phone,
            expires_at: new Date(otpData.expires).toISOString(),
            is_used: false
          };
          console.log(`✅ Real-time OTP verified successfully for ${phone}`);
        } else {
          console.log(`❌ Invalid OTP attempt ${otpData.attempts}/3 for ${phone}`);
        }
      }
    }

    // Fallback to localStorage for demo
    if (!verificationData) {
      const storedData = localStorage.getItem(`verification_${phone}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.code === code && !parsed.is_used && new Date(parsed.expires_at) > new Date()) {
          verificationData = parsed;
          // Mark as used in localStorage
          parsed.is_used = true;
          localStorage.setItem(`verification_${phone}`, JSON.stringify(parsed));
        }
      }
    }

    if (!verificationData) {
      return {
        success: false,
        message: 'Invalid or expired verification code'
      };
    }

    // Try to manage user in database
    let user = null;
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            name, 
            is_verified: true 
          })
          .eq('phone', phone)
          .select()
          .single();

        if (!updateError) {
          user = updatedUser;
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name,
            phone,
            is_verified: true
          })
          .select()
          .single();

        if (!createError) {
          user = newUser;
        }
      }
    } catch (dbError) {
      console.warn('Database user management failed, using local user data:', dbError);
    }

    // Fallback user data for demo
    if (!user) {
      user = {
        id: `demo_${Date.now()}`,
        name,
        phone,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(`user_${phone}`, JSON.stringify(user));
    }

    return {
      success: true,
      message: 'Successfully verified and logged in',
      data: { user }
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      message: 'Verification failed'
    };
  }
};

// SignUp with email and additional user data
export const signUpUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    // Check if user already exists
    const existingUserCheck = await getUserByPhone(userData.phone);
    if (existingUserCheck.success) {
      return {
        success: false,
        message: 'User already exists with this phone number'
      };
    }

    // For demo purposes, we'll store the signup data in localStorage
    // In production, you'd hash the password and store in database
    const signupData = {
      ...userData,
      id: `user_${Date.now()}`,
      is_verified: false,
      created_at: new Date().toISOString(),
      signup_type: 'email_phone'
    };

    // Store in localStorage for demo
    localStorage.setItem(`signup_${userData.phone}`, JSON.stringify(signupData));

    return {
      success: true,
      message: 'Account created successfully',
      data: { user: signupData }
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'Failed to create account'
    };
  }
};

// Get user by phone number
export const getUserByPhone = async (phone: string): Promise<AuthResponse> => {
  try {
    let user = null;

    // Try database first
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('is_verified', true)
        .single();

      if (!error && data) {
        user = data;
      }
    } catch (dbError) {
      console.warn('Database query failed, checking localStorage:', dbError);
    }

    // Fallback to localStorage
    if (!user) {
      const storedUser = localStorage.getItem(`user_${phone}`);
      const signupUser = localStorage.getItem(`signup_${phone}`);
      
      if (storedUser) {
        user = JSON.parse(storedUser);
      } else if (signupUser) {
        const signup = JSON.parse(signupUser);
        if (signup.is_verified) {
          user = signup;
        }
      }
    }

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      message: 'User found',
      data: { user }
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      message: 'Failed to retrieve user'
    };
  }
};