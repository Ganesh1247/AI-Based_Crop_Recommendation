import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Send, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '../lib/context/LanguageContext';

interface VoiceAssistantProps {
  onBack?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
}

export function VoiceAssistant({ onBack }: VoiceAssistantProps) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0
  });
  const [error, setError] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // Set language based on current language context
      const speechLang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true }));
        setError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        setVoiceState(prev => ({ 
          ...prev, 
          transcript,
          confidence,
          isProcessing: !event.results[0].isFinal
        }));

        if (event.results[0].isFinal) {
          handleVoiceInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false, 
          isProcessing: false 
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false,
          isProcessing: false
        }));
      };
    }

    // Load voices and welcome message
    const loadVoicesAndWelcome = () => {
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: t('voice.greeting'),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Speak welcome message if audio is enabled
      if (audioEnabled) {
        // Delay to ensure voices are loaded
        setTimeout(() => {
          speakText(t('voice.greeting'));
        }, 500);
      }
    };

    // Check if voices are already loaded
    if (speechSynthesis.getVoices().length > 0) {
      loadVoicesAndWelcome();
    } else {
      // Listen for voices to be loaded
      speechSynthesis.addEventListener('voiceschanged', loadVoicesAndWelcome);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
      speechSynthesis.removeEventListener('voiceschanged', loadVoicesAndWelcome);
    };
  }, [language, t]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && audioEnabled) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Set voice language based on current language
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      
      if (language === 'hi') {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('hi') || 
          voice.lang.includes('hi-IN') ||
          voice.name.toLowerCase().includes('hindi')
        ) || voices.find(voice => voice.lang.includes('en-IN')) || voices[0];
        utterance.lang = 'hi-IN';
      } else if (language === 'te') {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('te') || 
          voice.lang.includes('te-IN') ||
          voice.name.toLowerCase().includes('telugu')
        ) || voices.find(voice => voice.lang.includes('en-IN')) || voices[0];
        utterance.lang = 'te-IN';
      } else {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('en-US') ||
          voice.lang.includes('en-GB')
        ) || voices[0];
        utterance.lang = 'en-US';
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      }

      utterance.onstart = () => {
        console.log('Speech started');
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        console.log('Speech ended');
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
        setError('Speech synthesis failed. Please check audio settings.');
      };

      synthesisRef.current = utterance;
      
      // Add a small delay to ensure voices are ready
      setTimeout(() => {
        console.log('Starting speech synthesis...');
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    if (!transcript.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: transcript,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(transcript);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if audio is enabled
      if (audioEnabled) {
        speakText(aiResponse);
      }
    }, 1000);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Get responses in user's language
    const getLocalizedResponse = (key: 'disease' | 'weather' | 'soil' | 'general') => {
      const responses: Record<string, Record<string, string[]>> = {
        en: {
          disease: [
            "For plant diseases, I recommend first identifying the specific pathogen. Common signs include yellowing leaves, spots, or wilting. Try copper-based fungicides for fungal issues, and ensure proper air circulation. Would you like me to help identify a specific disease?",
            "Plant diseases can be prevented through crop rotation, proper spacing, and avoiding overhead watering. If you see symptoms, remove affected parts immediately and apply appropriate treatments. What symptoms are you observing?",
            "Integrated pest management is key. Use beneficial insects, neem oil for organic control, and maintain healthy soil. Early detection is crucial - inspect your plants regularly. Can you describe the specific pest problem you're facing?"
          ],
          weather: [
            "Weather monitoring is crucial for farming success. I recommend checking 7-day forecasts regularly and adjusting irrigation accordingly. During rainy periods, ensure good drainage to prevent root rot. What's your current weather concern?",
            "For drought conditions, consider drip irrigation, mulching to retain moisture, and selecting drought-resistant varieties. Monitor soil moisture levels and water deeply but less frequently. How has the weather been affecting your crops?",
            "Heavy rains can cause nutrient leaching and fungal diseases. Ensure proper drainage, avoid working wet soil, and apply preventive fungicides if needed. Would you like specific advice for your crop type?"
          ],
          soil: [
            "Soil health is fundamental to successful farming. I recommend getting a soil test to determine pH and nutrient levels. Most crops prefer pH between 6.0-7.0. Add organic matter like compost to improve soil structure. What's your soil concern?",
            "For nutrient management, follow the NPK requirements for your specific crop. Nitrogen promotes leaf growth, phosphorus supports root development, and potassium enhances disease resistance. Are you seeing any nutrient deficiency symptoms?",
            "Organic matter is key to soil health. Add compost, cover crops, or well-rotted manure. This improves water retention, nutrient availability, and beneficial microbial activity. How would you describe your current soil condition?"
          ],
          general: [
            "That's an interesting farming question! Successful agriculture depends on understanding your local conditions, soil health, weather patterns, and crop requirements. Could you provide more specific details about your situation?",
            "Farming involves many interconnected factors. Consider soil preparation, seed quality, proper timing, water management, and pest control. What aspect of farming would you like to focus on?",
            "Modern farming combines traditional knowledge with new technologies. Precision agriculture, soil testing, and weather monitoring can significantly improve yields. What farming challenge are you currently facing?"
          ]
        },
        hi: {
          disease: [
            "पौधों की बीमारियों के लिए, मैं पहले विशिष्ट रोगजनक की पहचान करने की सलाह देता हूं। सामान्य लक्षणों में पत्तियों का पीला होना, धब्बे या मुरझाना शामिल है। फंगल समस्याओं के लिए तांबा-आधारित कवकनाशी का प्रयास करें। क्या आप चाहते हैं कि मैं किसी विशिष्ट बीमारी की पहचान में मदद करूं?",
            "पौधों की बीमारियों को फसल चक्र, उचित अंतराल और ऊपरी सिंचाई से बचने के माध्यम से रोका जा सकता है। यदि आप लक्षण देखते हैं, तो प्रभावित भागों को तुरंत हटा दें। आप क्या लक्षण देख रहे हैं?",
            "एकीकृत कीट प्रबंधन महत्वपूर्ण है। लाभकारी कीड़ों का उपयोग करें, जैविक नियंत्रण के लिए नीम का तेल, और स्वस्थ मिट्टी बनाए रखें। क्या आप अपनी विशिष्ट कीट समस्या का वर्णन कर सकते हैं?"
          ],
          weather: [
            "मौसम की निगरानी खेती की सफलता के लिए महत्वपूर्ण है। मैं नियमित रूप से 7-दिन के पूर्वानुमान की जांच करने और सिंचाई को समायोजित करने की सलाह देता हूं। आपकी वर्तमान मौसम चिंता क्या है?",
            "सूखे की स्थिति के लिए, ड्रिप सिंचाई, नमी बनाए रखने के लिए मल्चिंग, और सूखा प्रतिरोधी किस्मों का चयन करने पर विचार करें। मौसम आपकी फसलों को कैसे प्रभावित कर रहा है?",
            "भारी बारिश पोषक तत्वों की हानि और फंगल रोगों का कारण बन सकती है। उचित जल निकासी सुनिश्चित करें। क्या आपको अपनी फसल के प्रकार के लिए विशिष्ट सलाह चाहिए?"
          ],
          soil: [
            "मिट्टी का स्वास्थ्य सफल खेती का आधार है। pH और पोषक तत्वों के स्तर को निर्धारित करने के लिए मिट्टी परीक्षण कराने की सलाह देता हूं। आपकी मिट्टी की चिंता क्या है?",
            "पोषक तत्व प्रबंधन के लिए, अपनी विशिष्ट फसल के लिए NPK आवश्यकताओं का पालन करें। क्या आप कोई पोषक तत्व की कमी के लक्षण देख रहे हैं?",
            "जैविक पदार्थ मिट्टी के स्वास्थ्य की कुंजी है। कंपोस्ट, कवर फसलें, या अच्छी तरह से सड़ी हुई खाद जोड़ें। आप अपनी वर्तमान मिट्टी की स्थिति का वर्णन कैसे करेंगे?"
          ],
          general: [
            "यह एक दिलचस्प कृषि प्रश्न है! सफल कृषि आपकी स्थानीय स्थितियों, मिट्टी के स्वास्थ्य, मौसम के पैटर्न और फसल की आवश्यकताओं को समझने पर निर्भर करती है। क्या आप अपनी स्थिति के बारे में अधिक विशिष्ट विवरण प्रदान कर सकते हैं?",
            "खेती में कई परस्पर जुड़े कारक शामिल हैं। मिट्टी की तैयारी, बीज की गुणवत्ता, उचित समय, पानी प्रबंधन और कीट नियंत्रण पर विचार करें। आप खेती के किस पहलू पर ध्यान देना चाहते हैं?",
            "आधुनिक खेती पारंपरिक ज्ञान को नई तकनीकों के साथ जोड़ती है। आप वर्तमान में किस खेती की चुनौती का सामना कर रहे हैं?"
          ]
        },
        te: {
          disease: [
            "మొక్కల వ్యాధుల కోసం, నేను మొదట నిర్దిష్ట రోగకారకాన్ని గుర్తించాలని సిఫార్సు చేస్తాను. సాధారణ సంకేతాలలో ఆకుల పసుపు రంగు, మచ్చలు లేదా వాడিపోవడం ఉన్నాయి. ఫంగల్ సమస్యలకు రాగి ఆధారిత శిలీంద్రనాశకాలను ప్రయత్నించండి. నేను నిర్దిష్ట వ్యాధిని గుర్తించడంలో సహాయం చేయాలని అనుకుంటున్నారా?",
            "మొక్కల వ్యాధులను పంట భ్రమణ, సరైన అంతరం మరియు ఓవర్‌హెడ్ నీటిపారుదల నివారణ ద్వారా నిరోధించవచ్చు. మీరు లక్షణాలను చూస్తే, ప్రభావిత భాగాలను వెంటనే తొలగించండి. మీరు ఏ లక్షణాలను గమనిస్తున్నారు?",
            "సమగ్ర కీటకాల నిర్వహణ కీలకం. ప్రయోజనకరమైన కీటకాలను, సేంద్రీయ నియంత్రణ కోసం వేప నూనెను ఉపయోగించండి మరియు ఆరోగ్యకరమైన మట్టిని నిర్వహించండి. మీరు మీ నిర్దిష్ట కీటకాల సమస్యను వివరించగలరా?"
          ],
          weather: [
            "వాతావరణ పర్యవేక్షణ వ్యవసాయ విజయానికి కీలకం. నేను 7-రోజుల అంచనాలను క్రమం తప్పకుండా తనిఖీ చేయాలని మరియు నీటిపారుదలను తదనుగుణంగా సర్దుబాటు చేయాలని సిఫార్సు చేస్తాను. మీ ప్రస్తుత వాతావరణ ఆందోళన ఏమిటి?",
            "కరువు పరిస్థితుల కోసం, డ్రిప్ నీటిపారుదల, తేమను నిలుపుకోవడానికి మల్చింగ్ మరియు కరువు నిరోధక రకాలను ఎంచుకోవడాన్ని పరిగణించండి. వాతావరణం మీ పంటలను ఎలా ప్రభావితం చేస్తోంది?",
            "భారీ వర్షాలు పోషకాల లీచింగ్ మరియు ఫంగల్ వ్యాధులకు కారణమవుతాయి. సరైన డ్రైనేజీని నిర్ధారించండి. మీ పంట రకానికి నిర్దిష్ట సలహా కావాలా?"
          ],
          soil: [
            "మట్టి ఆరోగ్యం విజయవంతమైన వ్యవసాయానికి ప్రాథమికం. pH మరియు పోషకాల స్థాయిలను నిర్ణయించడానికి మట్టి పరీక్షను పొందాలని నేను సిఫార్సు చేస్తాను. మీ మట్టి ఆందోళన ఏమిటి?",
            "పోషకాల నిర్వహణ కోసం, మీ నిర్దిష్ట పంట కోసం NPK అవసరాలను అనుసరించండి. మీరు ఏవైనా పోషకాల లోపం లక్షణాలను చూస్తున్నారా?",
            "సేంద్రీయ పదార్థం మట్టి ఆరోగ్యానికి కీలకం. కంపోస్ట్, కవర్ పంటలు లేదా బాగా కుళ్ళిన ఎరువును జోడించండి. మీరు మీ ప్రస్తుత మట్టి పరిస్థితిని ఎలా వర్ణిస్తారు?"
          ],
          general: [
            "అది ఆసక్తికరమైన వ్యవసాయ ప్రశ్న! విజయవంతమైన వ్యవసాయం మీ స్థానిక పరిస్థితులు, మట్టి ఆరోగ్యం, వాతావరణ నమూనాలు మరియు పంట అవసరాలను అర్థం చేసుకోవడంపై ఆధారపడి ఉంటుంది. మీరు మీ పరిస్థితి గురించి మరింత నిర్దిష్ట వివరాలను అందించగలరా?",
            "వ్యవసాయంలో అనేక పరస్పర అనుసంధాన కారకాలు ఉంటాయి. మట్టి తయారీ, విత్తన నాణ్యత, సరైన సమయం, నీటి నిర్వహణ మరియు కీటకాల నియంత్రణను పరిగణించండి. మీరు వ్యవసాయంలో ఏ అంశంపై దృష్టి పెట్టాలని అనుకుంటున్నారు?",
            "ఆధునిక వ్యవసాయం సంప్రదాయ జ్ఞానాన్ని కొత్త సాంకేతికతలతో మిళితం చేస్తుంది. మీరు ప్రస్తుతం ఏ వ్యవసాయ సవాలును ఎదుర్కొంటున్నారు?"
          ]
        }
      };
      
      return responses[language]?.[key] || responses.en[key];
    };

    // Disease-related responses
    if (lowerInput.includes('disease') || lowerInput.includes('fungus') || lowerInput.includes('pest') ||
        lowerInput.includes('बीमारी') || lowerInput.includes('रोग') || 
        lowerInput.includes('వ్యాధి') || lowerInput.includes('రోగం')) {
      const responses = getLocalizedResponse('disease');
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Weather-related responses
    if (lowerInput.includes('weather') || lowerInput.includes('rain') || lowerInput.includes('drought') ||
        lowerInput.includes('मौसम') || lowerInput.includes('बारिश') ||
        lowerInput.includes('వాతావరణం') || lowerInput.includes('వర్షం')) {
      const responses = getLocalizedResponse('weather');
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Soil-related responses
    if (lowerInput.includes('soil') || lowerInput.includes('fertilizer') || lowerInput.includes('nutrient') ||
        lowerInput.includes('मिट्टी') || lowerInput.includes('खाद') ||
        lowerInput.includes('మట్టి') || lowerInput.includes('ఎరువు')) {
      const responses = getLocalizedResponse('soil');
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // General farming responses
    const responses = getLocalizedResponse('general');
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const startListening = () => {
    if (recognitionRef.current && !voiceState.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    handleVoiceInput(inputMessage);
    setInputMessage('');
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: t('voice.greeting'),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xl font-semibold text-gray-900">{t('voice.title')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    {t('voice.audioEnabled')}
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    {t('voice.audioDisabled')}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('voice.clearChat')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('voice.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('voice.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Voice Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('voice.title')}</CardTitle>
                <CardDescription>
                  {t('voice.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voice Status */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  {voiceState.isListening && (
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">{t('voice.listening')}</span>
                    </div>
                  )}
                  
                  {voiceState.isProcessing && (
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">{t('voice.processing')}</span>
                    </div>
                  )}
                  
                  {voiceState.isSpeaking && (
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">{t('voice.speaking')}</span>
                    </div>
                  )}
                  
                  {voiceState.transcript && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border">
                      {voiceState.transcript}
                    </div>
                  )}
                </div>

                {/* Voice Button */}
                <Button
                  onClick={voiceState.isListening ? stopListening : startListening}
                  disabled={voiceState.isProcessing}
                  className={`w-full h-16 text-lg ${
                    voiceState.isListening 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {voiceState.isListening ? (
                    <>
                      <MicOff className="w-6 h-6 mr-2" />
                      {t('voice.stopListening')}
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 mr-2" />
                      {t('voice.startVoiceChat')}
                    </>
                  )}
                </Button>

                {error && (
                  <Alert>
                    <AlertDescription className="text-red-600">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>{t('voice.conversation')}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.type === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Text Input */}
                <form onSubmit={handleTextSubmit} className="flex space-x-2 mt-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('voice.placeholder')}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}