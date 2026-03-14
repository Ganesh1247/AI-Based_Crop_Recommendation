import { useState } from "react";
import { ArrowLeft, Phone, Lock, Leaf, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useLanguage } from "../lib/context/LanguageContext";
import { useAuth } from "../lib/context/AuthContext";

interface SignInProps {
  onBack: () => void;
  onSignUpClick: () => void;
}

export function SignIn({ onBack, onSignUpClick }: SignInProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { login, isLoading } = useAuth();

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    
    if (phone.length >= 10 && password.length >= 6) {
      try {
        await login(phone, password);
        onBack();
      } catch (error) {
        setError(t('auth.loginFailed') || 'Sign In failed. Please try again.');
      }
    } else {
      setError(t('auth.invalidCredentials') || 'Please enter a valid phone number and password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl shadow-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 tracking-tight">{t('header.cropPredict') || 'CropPredict'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Welcome Section */}
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-emerald-200 dark:border-emerald-800">
              <LogIn className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              {t('auth.signin.title') || 'Welcome Back'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('auth.signin.subtitle') || 'Sign in to access your crop prediction dashboard'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 animate-fade-in">
              <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <Card className="glass-card shadow-xl border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 pt-8 bg-white/50 dark:bg-slate-800/50">
              <CardTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
                {t('auth.signin') || 'Sign In'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSignIn} className="space-y-6">
                {/* Phone Number Field */}
                <div className="space-y-3">
                  <Label htmlFor="phone" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{t('auth.phone') || 'Phone Number'}</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span>{t('auth.password') || 'Password'}</span>
                    </Label>
                    <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                      {t('auth.forgotPassword') || 'Forgot Password?'}
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  disabled={isLoading || !phone.trim() || !password.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common.loading') || 'Loading...'}</span>
                    </div>
                  ) : (
                     t('auth.signin') || 'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                  {t('auth.noAccount') || 'New to CropPredict?'}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full py-6 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onSignUpClick}
            >
              Sign Up
            </Button>
          </div>

          {/* Benefits Section */}
          <div className="glass-card rounded-2xl p-6 space-y-5 border-emerald-100 dark:border-emerald-900/30">
            <h3 className="font-bold text-slate-900 dark:text-white text-center text-lg">
              Why Choose CropPredict?
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm font-medium">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span>95% accurate crop yield predictions</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span>Real-time weather integration</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span>Trusted by 10,000+ farmers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}