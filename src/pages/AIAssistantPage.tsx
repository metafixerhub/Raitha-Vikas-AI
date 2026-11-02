import React, { useState, useEffect, useRef } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { apiService } from '../services/apiService';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Droplets, 
  Beaker, 
  Thermometer, 
  Sprout, 
  HelpCircle, 
  AlertCircle,
  RefreshCw,
  Globe,
  ShieldAlert
} from 'lucide-react';
import { AppLanguage } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const { 
    sensors, 
    activeField, 
    farmProfile, 
    language, 
    setLanguage 
  } = useFarmStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'kn'
        ? `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ನಿಮ್ಮ ರೈತ ವಿಕಾಸ AI ಸಹಾಯಕ. ನಿಮ್ಮ ${activeField.name} ಜಮೀನಿನ ತೇವಾಂಶ (${sensors.soilMoisture}%) ಮತ್ತು ಮಣ್ಣಿನ ಪಿಎಚ್ (${sensors.soilPh}) ಆಧರಿಸಿ ನಾನು ನಿಮಗೆ ಸಲಹೆ ನೀಡಬಲ್ಲೆ. ನೀವು ಯಾವುದೇ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.`
        : language === 'hi'
        ? `नमस्ते किसान भाई! मैं आपका रैथ विकास AI सहायक हूँ। आपके खेत की वर्तमान नमी (${sensors.soilMoisture}%) और पीएच (${sensors.soilPh}) के आधार पर मैं आपकी सहायता कर सकता हूँ। आप फसल से जुड़ा कोई भी प्रश्न पूछ सकते हैं।`
        : `Hello Farmer! I am your Raitha Vikas AI assistant. I have live access to your current soil moisture (${sensors.soilMoisture}%), soil pH (${sensors.soilPh}), and polyhouse temperature (${sensors.temperature}°C). How can I assist your crop care today?`,
      timestamp: 'Just now'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: 'Irrigation Advice',
      text: `Based on my current soil moisture (${sensors.soilMoisture}%) and pH (${sensors.soilPh}), should I run a drip cycle today?`
    },
    {
      label: 'Organic Pest Control',
      text: 'What is the most effective organic remedy (Neem/Jeevamrutha) for early blight on tomato leaves?'
    },
    {
      label: 'Paddy Nutrition',
      text: 'My paddy is at day 47 (active tillering). What bio-fertilizer top dressing should I apply?'
    },
    {
      label: 'Soil Acidity Care',
      text: `My soil pH is currently ${sensors.soilPh}. Is this suitable for ${activeField.cropType} or do I need agricultural lime?`
    }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
    setErrorMessage(null);

    const farmContext = {
      soilMoisture: sensors.soilMoisture,
      soilPh: sensors.soilPh,
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      pumpStatus: sensors.pumpStatus,
      cropType: activeField.cropType,
      location: farmProfile.location
    };

    try {
      const response = await apiService.askAssistant(query, farmContext, 'farm-session-1', language);
      const aiMessage: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackAdvice = `🌱 **Raitha Vikas AI Precision Advisory:**
Live Telemetry for **${activeField.cropType}**:
- Volumetric Soil Moisture: **${sensors.soilMoisture}%** | Soil pH: **${sensors.soilPh}** | Temp: **${sensors.temperature}°C**

${language === 'kn'
  ? 'ನಿಮ್ಮ ಜಮೀನಿನ ತೇವಾಂಶ ಮತ್ತು ಪಿಎಚ್ ಮಟ್ಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಹನಿ ನೀರಾವರಿ ಹಾಗೂ ಸಾವಯವ ಜೀವಾಮೃತ ಬಳಸುವುದು ಸೂಕ್ತ.'
  : language === 'hi'
  ? 'मिट्टी की वर्तमान नमी और पीएच स्तर के अनुसार समय पर ड्रिप सिंचाई और जीवामृत का प्रयोग करें।'
  : 'Recommended to maintain root-zone soil moisture between 35-65% with calibrated drip irrigation cycles.'}`;

      const fallbackMsg: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: fallbackAdvice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Header with Live Telemetry Context Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aiBlue-600 to-forest-800 text-white flex items-center justify-center shadow-md shadow-aiBlue-900/20">
            <Bot className="w-5 h-5 text-harvest-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Farming Assistant</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-aiBlue-100 text-aiBlue-800 dark:bg-aiBlue-950 dark:text-aiBlue-300 border border-aiBlue-300 dark:border-aiBlue-800">
                Gemini Powered ✨
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Context-aware agronomist answering with live farm sensor telemetry
            </p>
          </div>
        </div>

        {/* Live Telemetry Pill Snapshot */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5" /> {sensors.soilMoisture}% Moisture
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
            <Beaker className="w-3.5 h-3.5" /> pH {sensors.soilPh}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5" /> {sensors.temperature}°C
          </span>
        </div>
      </div>

      {/* Main Chat Messages Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.sender === 'user'
                ? 'bg-forest-900 text-white'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-forest-900 text-white rounded-tr-xs shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span className={`block text-[10px] mt-2 font-medium ${
                msg.sender === 'user' ? 'text-emerald-200/80' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Analyzing agronomic telemetry with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-500" /> Suggested:
        </span>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q.text)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition shrink-0"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={
            language === 'kn'
              ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
              : language === 'hi'
              ? 'अपना कृषि प्रश्न यहाँ लिखें...'
              : 'Ask anything about crop care, soil moisture, pH, pest remedies, or fertilizers...'
          }
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-3 rounded-xl bg-gradient-to-r from-aiBlue-600 to-forest-700 hover:from-aiBlue-500 hover:to-forest-600 text-white font-bold transition disabled:opacity-40 shrink-0 shadow-sm"
          title="Send Query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
