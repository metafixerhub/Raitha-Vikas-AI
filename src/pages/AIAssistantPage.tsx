import React, { useState, useEffect, useRef } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { apiService } from '../services/apiService';
import { speechService } from '../services/speechService';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Droplets, 
  Thermometer, 
  Sprout, 
  HelpCircle, 
  Globe, 
  ShieldCheck, 
  Check, 
  Copy, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  ChevronRight, 
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { AppLanguage } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  helpful?: boolean | null;
}

export const AIAssistantPage: React.FC = () => {
  const { 
    sensors, 
    activeField, 
    farmProfile, 
    language, 
    setLanguage,
    irrigationMode
  } = useFarmStore();

  const getWelcomeText = (lang: string) => {
    if (lang === 'kn') {
      return `### ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! 🌾
ನಾನು ನಿಮ್ಮ **ರೈತ ವಿಕಾಸ AI (Raitha Vikas AI)** - ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಂಶೋಧನಾ ಸಹಾಯಕ.

**ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರಸ್ತುತ ನೇರ ಸೆನ್ಸಾರ್ ಸ್ಥಿತಿ:**
* **ಬೆಳೆ:** ${activeField.cropType} (${activeField.name})
* **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${sensors.soilMoisture}% (${sensors.moistureStatus || 'ಸಾಮಾನ್ಯ'})
* **ತಾಪಮಾನ:** ${sensors.temperature}°C | **ಆರ್ದ್ರತೆ:** ${sensors.humidity}%
* **ನೀರಾವರಿ ಪಂಪ್:** ${sensors.pumpStatus ? 'ಚಾಲನೆಯಲ್ಲಿದೆ (ON)' : 'ನಿಂತಿದೆ (OFF)'}

ನೀವು ಹನಿ ನೀರಾವರಿ, ಸಾವಯವ ಜೀವಾಮೃತ, ಕೀಟ ನಿರ್ವಹಣೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು!`;
    } else if (lang === 'hi') {
      return `### नमस्ते किसान भाई! 🌾
मैं आपका **रैथ विकास AI (Raitha Vikas AI)** - स्मार्ट कृषि सलाहकार प्रणाली हूँ।

**आपके खेत की वास्तविक स्थिति:**
* **फसल:** ${activeField.cropType} (${activeField.name})
* **मिट्टी की नमी:** ${sensors.soilMoisture}% (${sensors.moistureStatus || 'सामान्य'})
* **तापमान:** ${sensors.temperature}°C | **हवा में नमी:** ${sensors.humidity}%
* **सिंचाई पंप:** ${sensors.pumpStatus ? 'चालू है (ON)' : 'बंद है (OFF)'}

आप ड्रिप सिंचाई, जैविक खाद, कीट नियंत्रण या मंडी भाव के बारे में कोई भी प्रश्न पूछ सकते हैं!`;
    } else {
      return `### Hello Farmer! Welcome to Raitha Vikas AI 🌾
I am your smart precision agriculture assistant developed for rural farming innovation.

**Live Field Telemetry Snapshot:**
* **Crop Stand:** ${activeField.cropType} (${activeField.name})
* **Soil Moisture:** ${sensors.soilMoisture}% (${sensors.moistureStatus || 'Normal'})
* **Ambient Climate:** ${sensors.temperature}°C with ${sensors.humidity}% relative humidity
* **Irrigation Relay:** ${sensors.pumpStatus ? 'ACTIVE (Water flowing)' : 'STANDBY (Idle)'}

Ask me anything regarding drip schedules, organic pest remedies, bio-fertilizers, or APMC mandi trends!`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: getWelcomeText(language),
      timestamp: 'Just now',
      helpful: null
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const isInitialMount = useRef(true);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested Prompts tailored for student demonstration & real farmer questions
  const quickPrompts = [
    {
      label: '💧 Drip Irrigation Timing',
      category: 'Irrigation',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
      text: `Based on my current soil moisture (${sensors.soilMoisture}%) and ambient temperature (${sensors.temperature}°C), should I run a drip cycle today?`
    },
    {
      label: '🌿 Organic Pest Management',
      category: 'Crop Health',
      color: 'from-forest-500/10 to-emerald-500/10 border-forest-200 dark:border-forest-800 text-forest-700 dark:text-forest-300',
      text: `What is the most effective organic remedy (Neem Oil / Sour Buttermilk / Jeevamrutha) for leaf spots and blight on ${activeField.cropType.split(' ')[0]}?`
    },
    {
      label: '🌾 Crop Stage Nutrition',
      category: 'Nutrition',
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
      text: `My ${activeField.cropType.split(' ')[0]} is in active vegetative stage. What bio-fertilizer or organic compost top dressing should I apply?`
    },
    {
      label: '📈 Mandi Price Advice',
      category: 'Market',
      color: 'from-sky-500/10 to-blue-500/10 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
      text: `What are the current mandi APMC price trends for ${activeField.cropType.split(' ')[0]} across Karnataka markets today?`
    }
  ];

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputPrompt(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Prevent auto-scrolling on initial page load / tab opening
  // The page and chat stay firmly at the top so the user can review the overview first
  useEffect(() => {
    // Reset page view to top when opening this tab
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  // Smoothly scroll ONLY the internal chat container when a user sends or receives messages
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const toggleVoiceListen = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice listening error:', err);
        setIsListening(false);
      }
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: getWelcomeText(language),
        timestamp: 'Just now',
        helpful: null
      }
    ]);
    speechService.stop();
    setSpeakingMessageId(null);
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (speakingMessageId === id) {
      speechService.stop();
      setSpeakingMessageId(null);
    } else {
      speechService.stop();
      setSpeakingMessageId(id);
      speechService.speak(
        text,
        () => setSpeakingMessageId(id),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleFeedback = (id: string, isHelpful: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, helpful: isHelpful } : m))
    );
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    const farmContext = {
      soilMoisture: sensors.soilMoisture,
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      pumpStatus: sensors.pumpStatus,
      cropType: activeField.cropType,
      location: farmProfile.location,
      irrigationMode: irrigationMode
    };

    try {
      const response = await apiService.askAssistant(query, farmContext, 'farm-session-1', language);
      const aiMessage: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        helpful: null
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackAdvice = `### Raitha Vikas AI Precision Advisory 🌾
Live Farm Telemetry for **${activeField.cropType}**:
* Volumetric Soil Moisture: **${sensors.soilMoisture}%**
* Ambient Temperature: **${sensors.temperature}°C** with **${sensors.humidity}%** Humidity
* Irrigation Actuator: **${sensors.pumpStatus ? 'ON' : 'OFF'}**

${language === 'kn'
  ? 'ನಿಮ್ಮ ಜಮೀನಿನ ತೇವಾಂಶ ಮಟ್ಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಹನಿ ನೀರಾವರಿ ಹಾಗೂ ಸಾವಯವ ಜೀವಾಮೃತ ಬಳಸುವುದು ಸೂಕ್ತ.'
  : language === 'hi'
  ? 'मिट्टी की वर्तमान नमी और तापमान के अनुसार समय पर ड्रिप सिंचाई और जीवामृत का प्रयोग करें।'
  : 'Maintain root-zone soil moisture between 35% and 65% with calibrated drip irrigation.'}`;

      const fallbackMsg: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: fallbackAdvice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        helpful: null
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col">
      
      {/* 1. Header: School Demonstration Project Identity & Live Sensor Telemetry */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs shrink-0 overflow-hidden">
        
        {/* Elegant Green Agricultural Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-forest-700" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          
          {/* Left: Raitha Vikas Official Emblem & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 p-1.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              <img src="/logo.png" alt="Raitha Vikas" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Raitha Vikas AI
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                  🌾 Smart Farmer Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                School Science & Innovation Project • Precision Agronomy Model
              </p>
            </div>
          </div>

          {/* Right: Real-time Field Sensor Telemetry */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold self-start md:self-auto">
            
            {/* Soil Moisture */}
            <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{sensors.soilMoisture}% Moisture</span>
            </span>

            {/* Temperature */}
            <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>{sensors.temperature}°C</span>
            </span>

            {/* Pump State */}
            <span className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
              sensors.pumpStatus
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <Zap className={`w-3.5 h-3.5 ${sensors.pumpStatus ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{sensors.pumpStatus ? 'Pump Running' : 'Pump Standby'}</span>
            </span>

            {/* Reset Chat Session */}
            <button
              onClick={handleResetChat}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 font-bold"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Query</span>
            </button>

          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout: Desktop 2-Column Grid vs Mobile Full-Width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Context Rail (Desktop / Laptop: 4 Cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          
          {/* Card A: Active Stand Health & Live Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Field Telemetry Context
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Live Sensor Link
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                {activeField.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Current Stand: <strong className="text-slate-800 dark:text-slate-200">{activeField.cropType}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold">SOIL MOISTURE</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{sensors.soilMoisture}%</span>
                <span className="text-[10px] text-slate-500 block">Status: {sensors.moistureStatus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold">TEMPERATURE</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{sensors.temperature}°C</span>
                <span className="text-[10px] text-slate-500 block">Humidity: {sensors.humidity}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI recommendations adapt directly to this live sensor telemetry.</span>
            </div>
          </div>

          {/* Card B: Quick Explore Prompts */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Consultations
                </h4>
              </div>
              
              <div className="space-y-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      <span>{p.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      {p.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher pill in rail */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Language:
              </span>
              <div className="flex gap-1">
                {(['en', 'kn', 'hi'] as AppLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-black transition ${
                      language === l
                        ? 'bg-forest-800 dark:bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Main Conversational Workspace (8 Cols on Desktop / 12 on Mobile) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-[560px] sm:h-[620px] lg:h-[680px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Chat Messages Stream */}
          <div 
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar with Raitha Vikas image for AI and User icon for farmer */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-forest-900 text-white dark:bg-emerald-700'
                    : 'bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <img src="/logo.png" alt="Raitha Vikas" className="w-full h-full object-contain" />
                  )}
                </div>

                {/* Message Bubble Card */}
                <div className={`max-w-[88%] sm:max-w-[82%] rounded-3xl p-4 sm:p-5 transition-all ${
                  msg.sender === 'user'
                    ? 'bg-forest-900 text-white dark:bg-emerald-800 rounded-tr-xs shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                }`}>
                  
                  {/* Clean Markdown Rendering (NO raw ** or *) */}
                  {msg.sender === 'user' ? (
                    <div className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}

                  {/* Action Footer for AI Messages */}
                  {msg.sender === 'ai' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      
                      <div className="flex items-center gap-1.5">
                        
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition flex items-center gap-1 text-[11px]"
                          title="Copy clean answer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Read Aloud Voice Button */}
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className={`px-2 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                            speakingMessageId === msg.id
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
                          }`}
                          title="Listen in voice"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Feedback */}
                        <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 dark:border-slate-700 pl-1.5">
                          <button
                            onClick={() => handleFeedback(msg.id, true)}
                            className={`p-1 rounded-md transition ${
                              msg.helpful === true
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, false)}
                            className={`p-1 rounded-md transition ${
                              msg.helpful === false
                                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {msg.sender === 'user' && (
                    <span className="block text-[10px] mt-1 text-slate-200/80 font-medium text-right">
                      {msg.timestamp}
                    </span>
                  )}

                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <img src="/logo.png" alt="Raitha Vikas" className="w-full h-full object-contain" />
                </div>
                <div className="p-4 sm:p-5 rounded-3xl rounded-tl-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 max-w-[85%] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Raitha Vikas AI is analyzing sensor telemetry & agronomic models...</span>
                  </div>
                  <div className="w-48 sm:w-64 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-forest-600 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestion Chips (Mobile & Tablet) */}
          <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Ask:
            </span>
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition shrink-0 shadow-2xs whitespace-nowrap"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Floating Input Dock */}
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-300/80 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 transition-all shadow-inner px-2 py-1.5"
            >
              {/* Voice Speech Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceListen}
                className={`p-2 sm:p-2.5 rounded-full transition shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                title={isListening ? 'Listening... Tap to stop' : 'Tap to speak question'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input Field */}
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to your voice... Speak now'
                    : language === 'kn'
                    ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ...'
                    : language === 'hi'
                    ? 'अपना कृषि प्रश्न यहाँ लिखें या बोलें...'
                    : 'Ask anything on soil moisture, irrigation, pests, bio-fertilizers...'
                }
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="p-2.5 sm:p-3 rounded-full bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md shadow-forest-950/20 shrink-0"
                title="Send agricultural question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-2 font-medium">
              <span>Supports Kannada, Hindi, and English • Physical Sensors Synchronized</span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
