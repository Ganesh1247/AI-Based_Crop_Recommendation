import { useState, Suspense, lazy } from "react";
import { LanguageProvider } from "./lib/context/LanguageContext";
import { AuthProvider } from "./lib/context/AuthContext";
import { Button } from "./componentsa/ui/button";
import { MessageCircle } from "lucide-react";

// Lazy load components to prevent timeout
const Header = lazy(() => import("./componentsa/Header").then(module => ({ default: module.Header })));
const Hero = lazy(() => import("./componentsa/Hero").then(module => ({ default: module.Hero })));
const FeatureTiles = lazy(() => import("./componentsa/FeatureTiles").then(module => ({ default: module.FeatureTiles })));
const Footer = lazy(() => import("./componentsa/Footer").then(module => ({ default: module.Footer })));
const SignIn = lazy(() => import("./componentsa/SignIn").then(module => ({ default: module.SignIn })));
const SignUp = lazy(() => import("./componentsa/SignUp").then(module => ({ default: module.SignUp })));
const CropPredict = lazy(() => import("./componentsa/CropPredict").then(module => ({ default: module.CropPredict })));
const Weather = lazy(() => import("./componentsa/Weather").then(module => ({ default: module.Weather })));
const SoilAnalysis = lazy(() => import("./componentsa/SoilAnalysis").then(module => ({ default: module.SoilAnalysis })));
const MarketTrends = lazy(() => import("./componentsa/MarketTrends").then(module => ({ default: module.MarketTrends })));
const DiseaseDetection = lazy(() => import("./componentsa/DiseaseDetection").then(module => ({ default: module.DiseaseDetection })));
const VoiceAssistant = lazy(() => import("./componentsa/VoiceAssistant").then(module => ({ default: module.VoiceAssistant })));
const Profile = lazy(() => import("./componentsa/Profile").then(module => ({ default: module.Profile })));
const Chatbot = lazy(() => import("./componentsa/Chatbot").then(module => ({ default: module.Chatbot })));

type PageType = "home" | "signin" | "signup" | "predict" | "weather" | "soil" | "market" | "chat" | "disease" | "voice" | "profile";

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const navigateToSignIn = () => setCurrentPage("signin");
  const navigateToSignUp = () => setCurrentPage("signup");
  const navigateToPredict = () => setCurrentPage("predict");
  const navigateToWeather = () => setCurrentPage("weather");
  const navigateToSoil = () => setCurrentPage("soil");
  const navigateToChat = () => setCurrentPage("chat");
  const navigateToMarket = () => setCurrentPage("market");
  const navigateToDisease = () => setCurrentPage("disease");
  const navigateToVoice = () => setCurrentPage("voice");
  const navigateToProfile = () => setCurrentPage("profile");
  const navigateToHome = () => setCurrentPage("home");

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        {currentPage === "signin" && (
          <SignIn 
            onBack={navigateToHome} 
            onSignUpClick={navigateToSignUp}
          />
        )}

        {currentPage === "signup" && (
          <SignUp 
            onBack={navigateToHome} 
            onSignInClick={navigateToSignIn}
          />
        )}

        {currentPage === "predict" && (
          <CropPredict onBack={navigateToHome} />
        )}

        {currentPage === "weather" && (
          <Weather onBack={navigateToHome} />
        )}

        {currentPage === "soil" && (
          <SoilAnalysis onBack={navigateToHome} />
        )}

        {currentPage === "market" && (
          <MarketTrends onBack={navigateToHome} />
        )}

        {currentPage === "disease" && (
          <DiseaseDetection onBack={navigateToHome} />
        )}

        {currentPage === "voice" && (
          <VoiceAssistant onBack={navigateToHome} />
        )}

        {currentPage === "profile" && (
          <Profile onBack={navigateToHome} />
        )}

        {currentPage === "chat" && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-white relative">
            <div className="absolute top-4 left-4">
              <Button 
                onClick={navigateToHome}
                variant="outline"
                size="sm"
              >
                Back to Home
              </Button>
            </div>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Assistant</h1>
                <p className="text-lg text-gray-600 mb-8">Your intelligent farming assistant is available through the floating chat button</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === "home" && (
          <>
            <div id="home">
              <Header 
                onSignInClick={navigateToSignIn}
                onSignUpClick={navigateToSignUp}
                onProfileClick={navigateToProfile}
                onFeaturesClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              />
              <Hero 
                onPredictClick={navigateToPredict}
                onDiseaseClick={navigateToDisease}
              />
            </div>
            <div id="features">
              <FeatureTiles 
                onPredictClick={navigateToPredict}
                onWeatherClick={navigateToWeather}
                onSoilClick={navigateToSoil}
                onMarketClick={navigateToMarket}
                onChatClick={navigateToChat}
                onDiseaseClick={navigateToDisease}
                onVoiceClick={navigateToVoice}
              />
            </div>
            <Footer />
          </>
        )}

        {/* Chatbot - Available on all pages except chat and profile pages */}
        {currentPage !== "chat" && currentPage !== "profile" && <Chatbot />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}