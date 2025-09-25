import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Camera, Upload, Scan, AlertTriangle, CheckCircle, X, RotateCcw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '../lib/context/LanguageContext';

interface DiseaseDetectionProps {
  onBack?: () => void;
}

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: string;
  description: string;
  treatment: string[];
  prevention: string[];
  imageUrl: string;
}

export function DiseaseDetection({ onBack }: DiseaseDetectionProps) {
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions or use file upload.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
        analyzeImage(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          setCapturedImage(imageDataUrl);
          analyzeImage(imageDataUrl);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file (JPG, PNG, etc.)');
      }
    }
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setError('');
    setResult(null);

    try {
      // Simulate AI analysis with realistic data
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock disease detection results - in a real app, this would call an ML model API
      const mockResults: DetectionResult[] = [
        {
          disease: 'Leaf Blight',
          confidence: 87.5,
          severity: 'Moderate',
          description: 'Fungal infection causing brown spots and yellowing of leaves. Common in humid conditions.',
          treatment: [
            'Apply copper-based fungicide spray',
            'Remove affected leaves immediately',
            'Improve air circulation around plants',
            'Reduce overhead watering'
          ],
          prevention: [
            'Maintain proper plant spacing',
            'Ensure good drainage',
            'Apply preventive fungicide during humid weather',
            'Avoid watering leaves directly'
          ],
          imageUrl: imageDataUrl
        },
        {
          disease: 'Powdery Mildew',
          confidence: 92.3,
          severity: 'Mild',
          description: 'White powdery coating on leaves caused by fungal infection. Thrives in warm, dry conditions.',
          treatment: [
            'Spray with neem oil solution',
            'Apply baking soda spray (1 tsp per quart water)',
            'Use sulfur-based fungicide',
            'Increase air circulation'
          ],
          prevention: [
            'Plant in full sun locations',
            'Avoid overcrowding plants',
            'Water at soil level, not on leaves',
            'Choose resistant varieties'
          ],
          imageUrl: imageDataUrl
        },
        {
          disease: 'Bacterial Wilt',
          confidence: 78.9,
          severity: 'Severe',
          description: 'Bacterial infection causing rapid wilting and yellowing. Spreads through soil and insects.',
          treatment: [
            'Remove infected plants immediately',
            'Apply copper bactericide',
            'Improve soil drainage',
            'Control insect vectors'
          ],
          prevention: [
            'Use certified disease-free seeds',
            'Rotate crops regularly',
            'Maintain soil pH 6.0-7.0',
            'Control cucumber beetles and aphids'
          ],
          imageUrl: imageDataUrl
        },
        {
          disease: 'Healthy Plant',
          confidence: 95.2,
          severity: 'None',
          description: 'The plant appears healthy with no visible signs of disease. Continue current care practices.',
          treatment: [
            'Continue regular watering schedule',
            'Maintain current fertilization',
            'Monitor for any changes',
            'Ensure adequate sunlight'
          ],
          prevention: [
            'Regular inspection for early detection',
            'Maintain proper plant nutrition',
            'Ensure good air circulation',
            'Practice crop rotation'
          ],
          imageUrl: imageDataUrl
        }
      ];

      // Randomly select a result for demonstration
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDetection = () => {
    setResult(null);
    setCapturedImage(null);
    setError('');
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'none':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      {onBack && (
        <header className="bg-white border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-green-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('common.back')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Scan className="w-8 h-8 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">{t('disease.title')}</span>
              </div>

              <div className="w-20"></div>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('disease.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('disease.subtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Camera View */}
        {showCamera && (
          <Card className="mb-6 border-green-200">
            <CardContent className="p-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <Button
                    onClick={captureImage}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {t('disease.capturePhoto')}
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    size="lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Options */}
        {!showCamera && !result && !isAnalyzing && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={startCamera}>
              <CardContent className="p-8 text-center">
                <Camera className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('disease.useCamera')}</h3>
                <p className="text-gray-600">{t('disease.cameraDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <CardContent className="p-8 text-center">
                <Upload className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('disease.uploadImage')}</h3>
                <p className="text-gray-600">{t('disease.uploadDesc')}</p>
              </CardContent>
            </Card>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Analysis in Progress */}
        {isAnalyzing && (
          <Card className="border-green-200">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900">{t('disease.analyzing')}</h3>
                <p className="text-gray-600">{t('disease.analyzingDesc')}</p>
                <Progress value={65} className="w-full max-w-md" />
              </div>
              {capturedImage && (
                <div className="mt-6">
                  <img 
                    src={capturedImage} 
                    alt="Captured plant" 
                    className="max-w-sm mx-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detection Results */}
        {result && (
          <div className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {result.disease === 'Healthy Plant' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    )}
                    <span>{t('disease.results')}</span>
                  </CardTitle>
                  <Button onClick={resetDetection} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('disease.analyzeAnother')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={result.imageUrl} 
                      alt="Analyzed plant" 
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.disease}</h3>
                      <p className="text-gray-600 mb-4">{result.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{t('disease.confidence')}</div>
                        <div className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{t('disease.severity')}</div>
                        <Badge className={getSeverityColor(result.severity)}>
                          {t(`disease.severity.${result.severity.toLowerCase()}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Recommendations */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{t('disease.treatment')}</span>
                  </CardTitle>
                  <CardDescription>{t('disease.treatmentDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.treatment.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('disease.prevention')}</span>
                  </CardTitle>
                  <CardDescription>{t('disease.preventionDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.prevention.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}