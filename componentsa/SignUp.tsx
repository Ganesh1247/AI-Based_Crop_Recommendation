import { useState } from "react";
import { ArrowLeft, Phone, User, Leaf, MessageCircle } from "lucide-react";
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
  const { login, isLoading } = useAuth();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (name.length >= 2 && phone.length >= 10) {
      setStep('verify');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      try {
        await login(phone, name);
        onBack();
      } catch (error) {
        setError('Verification failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={step === 'verify' ? () => setStep('signup') : onBack}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {step === 'verify' ? 'Back to Form' : t('auth.backToHome')}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">{t('header.cropPredict')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'signup' ? <Leaf className="w-8 h-8 text-primary-foreground" /> : <MessageCircle className="w-8 h-8 text-primary-foreground" />}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {step === 'signup' ? t('auth.createAccount') : 'Verify Your Phone'}
            </h2>
            <p className="text-muted-foreground">
              {step === 'signup' 
                ? t('auth.enterDetails')
                : `Enter the 6-digit code sent to ${phone}`
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Demo Code Display */}
          {step === 'verify' && (
            <div className="bg-accent border border-border rounded-lg p-4">
              <p className="text-accent-foreground text-center">
                <strong>Demo Code:</strong> 123456
              </p>
              <p className="text-muted-foreground text-sm text-center mt-1">
                (In production, this would be sent via SMS)
              </p>
            </div>
          )}

          {/* Sign Up Form */}
          {step === 'signup' && (
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-xl text-foreground">
                  {t('auth.signUp')}
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  {t('auth.enterDetails')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center space-x-2 text-foreground">
                      <User className="w-4 h-4 text-primary" />
                      <span>{t('auth.name')}</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('auth.name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center space-x-2 text-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{t('auth.phone')}</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      We'll send you a verification code via SMS
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSendOtp}
                    className="w-full py-3"
                    disabled={!name.trim() || !phone.trim()}
                  >
                    {t('auth.sendOtp')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Code Form */}
          {step === 'verify' && (
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-xl text-foreground">
                  Enter Verification Code
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Check your messages for the 6-digit code
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Verification Code Field */}
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center justify-center space-x-2 text-foreground">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span>{t('auth.otp')}</span>
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleVerifyOtp}
                    className="w-full py-3"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      t('auth.verifyOtp')
                    )}
                  </Button>

                  {/* Resend Code */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep('signup')}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sign In Link */}
          {step === 'signup' && (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-accent to-background text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={onSignInClick}
              >
                {t('auth.switchToSignIn')}
              </Button>
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-center">
              Why Choose CropPredict?
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">95% accurate crop yield predictions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Real-time weather integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">AI-powered farming assistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Trusted by 10,000+ farmers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}