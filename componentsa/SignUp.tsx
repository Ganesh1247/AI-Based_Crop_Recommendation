import { useState } from "react";
import { ArrowLeft, Phone, User, Lock, Leaf, UserPlus, AtSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useLanguage } from "../lib/context/LanguageContext";
import { useAuth } from "../lib/context/AuthContext";

interface SignUpProps {
  onBack: () => void;
  onSignInClick: () => void;
}

export function SignUp({ onBack, onSignInClick }: SignUpProps) {
  const { t } = useLanguage();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (name.length >= 2 && username.length >= 3 && phone.length >= 10 && password.length >= 6) {
      try {
        await signup(name, phone, username, password);
        onBack();
      } catch (error) {
        setError(t('auth.signupFailed') || 'Signup failed. Please try again.');
      }
    } else {
      setError(t('auth.invalidForm') || 'Please fill out all fields correctly (Password min 6 chars, Username min 3).');
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
              <UserPlus className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              {t('auth.signup.title') || 'Join CropPredict'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('auth.signup.subtitle') || 'Create your account to start predicting'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 animate-fade-in">
              <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <Card className="glass-card shadow-xl border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 pt-8 bg-white/50 dark:bg-slate-800/50">
              <CardTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
                {t('auth.signup') || 'Sign Up'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSignUp} className="space-y-6">
                {/* Full Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>{t('auth.name') || 'Full Name'}</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.name') || 'Full Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Username Field */}
                <div className="space-y-3">
                  <Label htmlFor="username" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <AtSign className="w-4 h-4 text-emerald-500" />
                    <span>{t('auth.username') || 'Username'}</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

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
                  <Label htmlFor="password" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>{t('auth.password') || 'Password'}</span>
                  </Label>
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
                  disabled={isLoading || !name.trim() || !username.trim() || !phone.trim() || !password.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common.loading') || 'Creating account...'}</span>
                    </div>
                  ) : (
                    t('auth.signup') || 'Sign Up'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                  {t('auth.hasAccount') || 'Already have an account?'}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full py-6 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onSignInClick}
            >
              Sign In
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
                <span>AI-powered farming assistant</span>
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