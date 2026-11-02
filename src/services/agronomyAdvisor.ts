/**
 * Advanced Precision Agronomy Knowledge Engine for Raitha Vikas AI
 * Dynamically answers farmer questions with accurate physical principles,
 * exact sensor thresholds (Moisture, pH, Temp, Crop), and full multi-lingual support
 * (Kannada, Hindi, English).
 */

export interface FarmTelemetryContext {
  soilMoisture?: number;
  soilPh?: number;
  temperature?: number;
  humidity?: number;
  pumpStatus?: boolean;
  cropType?: string;
  location?: string;
}

export function generateAgronomyAdvice(
  prompt: string,
  context?: FarmTelemetryContext,
  language: 'en' | 'kn' | 'hi' = 'en'
): string {
  const p = prompt.toLowerCase().trim();
  const moisture = Number(context?.soilMoisture ?? 32);
  const ph = Number(context?.soilPh ?? 6.5);
  const temp = Number(context?.temperature ?? 28.5);
  const humidity = Number(context?.humidity ?? 71);
  const crop = context?.cropType || 'Paddy (Rice) & Tomato';
  const pumpOn = Boolean(context?.pumpStatus);

  // Moisture state physics
  const isHighMoisture = moisture >= 65;
  const isOptimalMoisture = moisture >= 38 && moisture < 65;
  const isLowMoisture = moisture < 38;

  // Topic detection
  const isIrrigation = /water|irrigat|moisture|pump|drip|dry|flood|ನೀರು|ತೇವಾಂಶ|ನೀರಾವರಿ|ಪಂಪ್|ಹನಿ|ಬರ|पानी|सिंचाई|नमी|पंप/i.test(p);
  const isPhTopic = /ph|acid|alkali|lime|gypsum|buffer|ಪಿಎಚ್|ಆಮ್ಲ|ಕ್ಷಾರ|ಸುಣ್ಣ|ಜಿಪ್ಸಮ್|ಮಣ್ಣು|मिट्टी|पीएच|अम्ल|क्षार/i.test(p);
  const isPestTopic = /pest|disease|bug|fung|spot|rot|blast|blight|worm|borer|aphid|thrips|whitefly|wilt|curling|ರೋಗ|ಕೀಟ|ಹುಳು|ಬೆಂಕಿ|ಒಣಗು|ಕೊಳೆ|ಸೊರಗು|ನುಸಿ|ಸಸ್ಯಹೇನು|रोग|कीट|ब्लाइट|ब्लास्ट|इल्ली/i.test(p);
  const isFertilizerTopic = /fertiliz|npk|urea|dap|potash|mop|zinc|boron|compost|manure|jeevamrutha|ಗೊಬ್ಬರ|ಯೂರಿಯಾ|ರಂಜಕ|ಪೊಟ್ಯಾಶ್|ಜೀವಾಮೃತ|ಕಾಂಪೋಸ್ಟ್|ಖಾದ್|खाद|उर्वरक|यूरिया|डीएपी|जीवामृत/i.test(p);
  const isHarvestOrSow = /harvest|sow|seed|planting|yield|season|ಕೊಯ್ಲು|ಬಿತ್ತನೆ|ನಾಟಿ|ಬೀಜ|ಇಳುವರಿ|ಬುಡ|ಬುಟ್ಟೆ|ಬುಕ್ಕಿ|कटाई|बुवाई|बीज|पैदावार/i.test(p);
  const isMarketTopic = /mandi|price|rate|market|apmc|cost|sell|ಬೆಲೆ|ಧಾರಣೆ|ದರ|ಮಾರುಕಟ್ಟೆ|ಮಾರಾಟ|ಮಂಡಿ|भाव|दाम|मंडी|बिक्री/i.test(p);

  // -------------------------------------------------------------
  // 1. KANNADA (ಕನ್ನಡ)
  // -------------------------------------------------------------
  if (language === 'kn') {
    if (isIrrigation) {
      if (isHighMoisture) {
        return `💧 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ:**
- **ಬೆಳೆ:** ${crop}
- **ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% (ಹೆಚ್ಚಿನ ತೇವಾಂಶ / ಅಧಿಕ ನೀರು)
- **ಪಂಪ್ ಸ್ಥಿತಿ:** ${pumpOn ? 'ಚಾಲನೆಯಲ್ಲಿದೆ (ತಕ್ಷಣ ಆಫ್ ಮಾಡಿ!)' : 'ನಿಂತಿದೆ (OFF)'}

**ಕೃಷಿ ತಜ್ಞರ ನಿರ್ಣಾಯಕ ಶಿಫಾರಸು:**
1. **ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ:** ಮಣ್ಣಿನಲ್ಲಿ ಈಗಾಗಲೇ **${moisture}%** ಅಧಿಕ ತೇವಾಂಶವಿದೆ. ಈಗ ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಕಾಲುವೆ ನೀರು ಹರಿಸುವುದನ್ನು **ಕಡ್ಡಾಯವಾಗಿ ನಿಲ್ಲಿಸಿ**.
2. **ಬೇರು ಕೊಳೆತ ತಡೆಗಟ್ಟಿ:** ಅಧಿಕ ನೀರಿನಿಂದ ಬೇರುಗಳಿಗೆ ಆಮ್ಲಜನಕ ಸಿಗದೆ ಬೇರು ಕೊಳೆತ (Root Rot) ಮತ್ತು ಶಿಲೀಂಧ್ರ ರೋಗಗಳು ಬರಬಹುದು.
3. **ಬಸಿಗಾಲುವೆ (Drainage):** ಗದ್ದೆ ಅಥವಾ ಜಮೀನಿನ ಅಂಚಿನಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ಹೊರಹಾಕಲು ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.
4. ಮಣ್ಣಿನ ತೇವಾಂಶ 45-50% ಗೆ ಇಳಿಯುವವರೆಗೂ ಮುಂದಿನ ನೀರಾವರಿ ಮಾಡಬೇಡಿ.`;
      } else if (isOptimalMoisture) {
        return `💧 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ:**
- **ಬೆಳೆ:** ${crop}
- **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% (ಸಮತೋಲಿತ / ಸೂಕ್ತ ಮಟ್ಟ)
- **ತಾಪಮಾನ:** ${temp}°C | **ಆರ್ದ್ರತೆ:** ${humidity}%

**ಶಿಫಾರಸು:**
1. ಮಣ್ಣಿನಲ್ಲಿ ಸಸ್ಯ ಬೆಳವಣಿಗೆಗೆ ಬೇಕಾದ ಅತ್ಯುತ್ತಮ ತೇವಾಂಶ (${moisture}%) ಇದೆ.
2. ತಕ್ಷಣಕ್ಕೆ ನೀರು ಹರಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ಬೆಳೆಯ ಬೇರುಗಳು ಆಮ್ಲಜನಕ ಮತ್ತು ಪೋಷಕಾಂಶಗಳನ್ನು ಸರಾಗವಾಗಿ ಹೀರಿಕೊಳ್ಳುತ್ತಿವೆ.
3. ತೇವಾಂಶವು 35% ಕ್ಕಿಂತ ಕೆಳಗೆ ಇಳಿದರೆ ಮಾತ್ರ ಮುಂದಿನ ಹನಿ ನೀರಾವರಿ ಚಕ್ರವನ್ನು ಆರಂಭಿಸಿ.`;
      } else {
        return `💧 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ:**
- **ಬೆಳೆ:** ${crop}
- **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% (ಕಡಿಮೆ / ಒಣಗಿದ ಸ್ಥಿತಿ)

**ಶಿಫಾರಸು:**
1. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}% ಗೆ ಇಳಿದಿದ್ದು, **35 ರಿಂದ 45 ನಿಮಿಷಗಳ ಹನಿ ನೀರಾವರಿ (Drip Cycle)** ನೀಡುವುದು ಅವಶ್ಯಕ.
2. ಬಿಸಿಲಿನ ಸಮಯದಲ್ಲಿ ನೀರು ಹರಿಸಬೇಡಿ; ಬೆಳಗ್ಗೆ 9 ಗಂಟೆಯ ಮೊದಲು ಅಥವಾ ಸಂಜೆ 5 ಗಂಟೆಯ ನಂತರ ನೀರು ನೀಡಿ.
3. ತೇವಾಂಶ 55-60% ತಲುಪಿದಾಗ ಪಂಪ್ ಆಫ್ ಮಾಡಿ.`;
      }
    }

    if (isPhTopic) {
      return `🧪 **ಮಣ್ಣಿನ pH ಮತ್ತು ಪೋಷಕಾಂಶ ಹೀರಿಕೊಳ್ಳುವಿಕೆ:**
- **ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ pH:** ${ph} (${ph < 6.0 ? 'ಆಮ್ಲೀಯ ಮಣ್ಣು' : ph > 7.5 ? 'ಕ್ಷಾರೀಯ ಮಣ್ಣು' : 'ಸಮತೋಲಿತ ಸೂಕ್ತ ಮಟ್ಟ'})
- **ಬೆಳೆ:** ${crop}

**ಪರಿಹಾರ ಮತ್ತು ನಿರ್ವಹಣೆ:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `ನಿಮ್ಮ ಮಣ್ಣಿನ pH (${ph}) ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ಸಾರಜನಕ (N), ರಂಜಕ (P) ಮತ್ತು ಪೊಟ್ಯಾಶ್ (K) ಗೊಬ್ಬರಗಳು ಬೆಳೆಗೆ ಸಮರ್ಪಕವಾಗಿ ತಲುಪುತ್ತವೆ.` 
  : ph < 6.0 
  ? `ಮಣ್ಣು ಆಮ್ಲೀಯವಾಗಿದೆ (${ph}). ರಂಜಕ ಗಟ್ಟಿಯಾಗುತ್ತದೆ. ಎಕರೆಗೆ 100-150 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ (Agricultural Lime) ಅಥವಾ ಡಾಲಮೈಟ್ ಬೆರೆಸಿ.` 
  : `ಮಣ್ಣು ಕ್ಷಾರೀಯವಾಗಿದೆ (${ph}). ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ ಬರಬಹುದು. ಎಕರೆಗೆ 200 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಅಥವಾ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಬಳಸಿ.`}
2. ಪ್ರತಿ 15 ದಿನಗಳಿಗೊಮ್ಮೆ 200 ಲೀಟರ್ **ಜೀವಾಮೃತ** ಹರಿಸಿ ಮಣ್ಣಿನ ಜೈವಿಕ ಇಂಗಾಲ (Organic Carbon) ಹೆಚ್ಚಿಸಿ.`;
    }

    if (isPestTopic) {
      return `🌿 **ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣಾ ಮಾರ್ಗದರ್ಶಿ:**
- **ಬೆಳೆ:** ${crop} | **ತಾಪಮಾನ:** ${temp}°C | **ಆರ್ದ್ರತೆ:** ${humidity}%

**ತ್ವರಿತ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:**
1. **ಬೇವಿನ ಎಣ್ಣೆ (Neem Oil):** 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆ (1 ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ + 1 ಮಿ.ಲೀ ಸಾಬೂನು) ಸಿಂಪಡಿಸಿ ರಸಹೀರುವ ಕೀಟಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.
2. **ಹುಳಿ ಮಜ್ಜಿಗೆ ದ್ರಾವಣ:** ಎಲೆ ಚುಕ್ಕೆ, ಬೆಂಕಿ ರೋಗ (Blast/Blight) ನಿಯಂತ್ರಣಕ್ಕೆ 5 ದಿನ ಹಳೆಯ ಹುಳಿ ಮಜ್ಜಿಗೆ (1 ಲೀಟರ್ ಮಜ್ಜಿಗೆಗೆ 10 ಲೀಟರ್ ನೀರು) ಸಿಂಪಡಿಸಿ.
3. **ಟ್ರೈಕೋಡರ್ಮಾ:** ಬೇರು ಕೊಳೆತ ಮತ್ತು ಸೊರಗು ರೋಗಕ್ಕೆ ಟ್ರೈಕೋಡರ್ಮಾ ಹಾರ್ಜಿಯಾನಂ 5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಬುಡಕ್ಕೆ ಸುರಿಯಿರಿ.
4. ತೀವ್ರ ಬಾಧೆಯಿದ್ದಲ್ಲಿ ಮ್ಯಾಂಕೋಜೆಬ್ (2.5 ಗ್ರಾಂ/ಲೀ) ಅಥವಾ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (3 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.`;
    }

    if (isFertilizerTopic) {
      return `🌱 **ಪೋಷಕಾಂಶ ಮತ್ತು ಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ:**
- **ಬೆಳೆ:** ${crop} | **ಮಣ್ಣಿನ pH:** ${ph}

**ಶಿಫಾರಸು:**
1. ಬೆಳೆಯ ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ ಯೂರಿಯಾ ಜೊತೆಗೆ ಸಮ ಪ್ರಮಾಣದಲ್ಲಿ ಮ್ಯೂರಿಯೇಟ್ ಆಫ್ ಪೊಟ್ಯಾಶ್ (MOP) ನೀಡಿ.
2. ಜಿಂಕ್ (Zinc Sulfate 21%) ಎಕರೆಗೆ 10 ಕೆಜಿ ಬಳಸುವುದರಿಂದ ಎಲೆಗಳ ಹಳದಿ ರೋಗ ತಡೆಯಬಹುದು.
3. ನೀರಿನಲ್ಲಿ ಕರಗುವ ಗೊಬ್ಬರಗಳಾದ 19:19:19 (ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ) ಹನಿ ನೀರಾವರಿಯ ಮೂಲಕ ನೀಡುವುದು ಅತಿ ಹೆಚ್ಚು ಫಲಕಾರಿ.`;
    }

    if (isMarketTopic) {
      return `📈 **ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಮತ್ತು ಮಾರಾಟ ಸಲಹೆ:**
1. ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ **${crop}** ದರಗಳು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿವೆ.
2. ನಿಮ್ಮ ಸಮೀಪದ ಮಾರುಕಟ್ಟೆ ದರಗಳ ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗಾಗಿ ನಮ್ಮ **Mandi Market Prices** ಟ್ಯಾಬ್ ಪರಿಶೀಲಿಸಿ (ಕೋಲಾರ, ಮಂಡ್ಯ, ಯಶವಂತಪುರ, ಶಿವಮೊಗ್ಗ ಇತ್ಯಾದಿ).
3. ಗುಣಮಟ್ಟದ ಗ್ರೇಡಿಂಗ್ (A-Grade & B-Grade) ಮಾಡಿ ಮಾರಾಟ ಮಾಡುವುದರಿಂದ ಶೇಕಡಾ 15-20 ರಷ್ಟು ಹೆಚ್ಚು ಲಾಭ ಗಳಿಸಬಹುದು.`;
    }

    return `🌾 **ರೈತ ವಿಕಾಸ್ AI ಕೃಷಿ ಸಹಾಯಕ:**
- **ಬೆಳೆ:** ${crop} | **ತೇವಾಂಶ:** ${moisture}% | **pH:** ${ph} | **ತಾಪಮಾನ:** ${temp}°C

**ಇಂದಿನ ಕೃಷಿ ನಿರ್ವಹಣೆ:**
1. ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರಸ್ತುತ ತೇವಾಂಶವು ${moisture}% ರಷ್ಟಿದ್ದು, ${isHighMoisture ? 'ನೀರು ಹೆಚ್ಚಾಗಿದೆ, ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.' : isOptimalMoisture ? 'ಸಮತೋಲಿತವಾಗಿದೆ.' : 'ನೀರು ಕಡಿಮೆಯಾಗಿದೆ, ಹನಿ ನೀರಾವರಿ ನೀಡಿ.'}
2. ಬೆಳೆಯ ಎಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ಕಪ್ಪು ಚುಕ್ಕೆ ಅಥವಾ ರೋಗ ಲಕ್ಷಣಗಳಿದ್ದರೆ **Crop Disease AI** ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿ ಎಲೆಯ ಹೆಸರು ನಮೂದಿಸಿ ಪರೀಕ್ಷಿಸಿ.
3. ಹೆಚ್ಚಿನ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ (ಉದಾ: ಗೊಬ್ಬರ, ಕೀಟ ಬಾಧೆ, ನೀರಾವರಿ) ನೇರವಾಗಿ ಕೇಳಿ.`;
  }

  // -------------------------------------------------------------
  // 2. HINDI (हिंदी)
  // -------------------------------------------------------------
  if (language === 'hi') {
    if (isIrrigation) {
      if (isHighMoisture) {
        return `💧 **रैत विकास AI सिंचाई सलाह:**
- **फसल:** ${crop} | **मिट्टी की नमी:** ${moisture}% (अत्यधिक नमी)

**सलाह:**
1. खेत में नमी **${moisture}%** है, अतः **सिंचाई तुरंत बंद रखें**।
2. अत्यधिक पानी से जड़ों में सड़न और फफूंद रोग फैल सकता है। खेत से अतिरिक्त पानी निकालने हेतु जल निकासी नालियों को साफ करें।`;
      } else {
        return `💧 **रैत विकास AI सिंचाई सलाह:**
- **फसल:** ${crop} | **नमी:** ${moisture}% (${isOptimalMoisture ? 'संतुलित' : 'कम'})

**सलाह:**
${isOptimalMoisture 
  ? '1. मिट्टी में नमी अनुकूल है। अभी पानी देने की आवश्यकता नहीं है।' 
  : '1. मिट्टी सूख रही है। सुबह या शाम के समय 35-40 मिनट ड्रिप सिंचाई करें।'}
2. तापमान ${temp}°C है, तेज धूप में पानी न दें।`;
      }
    }

    if (isPhTopic) {
      return `🧪 **मृदा pH और पोषण प्रबंधन:**
- **वर्तमान मृदा pH:** ${ph} (${ph < 6.8 ? 'हल्का अम्लीय' : 'संतुलित'})
- **फसल:** ${crop}

**सुझाव:**
1. ${ph >= 6.0 && ph <= 7.2 ? `pH मान (${ph}) बहुत उत्तम है। N-P-K का अवशोषण पूर्ण रहेगा।` : `मिट्टी सुधार हेतु 200 किग्रा जिप्सम या कम्पोस्ट खाद डालें।`}
2. 15 दिन के अंतराल पर 200 लीटर **जीवामृत** ड्रिप से दें।`;
    }

    return `🌾 **रैत विकास AI कृषि सहायक:**
- **फसल:** ${crop} | **नमी:** ${moisture}% | **पीएच:** ${ph}

**आज की कार्ययोजना:**
1. मिट्टी की नमी ${moisture}% है। ${isHighMoisture ? 'सिंचाई रोकें।' : 'नियमित निगरानी रखें।'}
2. कीट या रोग की पहचान हेतु **Crop Disease AI** में पत्ती की फोटो जांचें।`;
  }

  // -------------------------------------------------------------
  // 3. ENGLISH (Default)
  // -------------------------------------------------------------
  if (isIrrigation) {
    if (isHighMoisture) {
      return `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (SATURATED / HIGH MOISTURE)
- **Soil pH:** ${ph} | **Ambient Temp:** ${temp}°C
- **Irrigation Pump Status:** ${pumpOn ? 'RUNNING (SHUT OFF IMMEDIATELY!)' : 'STANDBY (OFF)'}

**Crucial Agronomic Action:**
1. **Hold All Irrigation:** Root-zone soil moisture is elevated at **${moisture}%**. Do **NOT** run drip or flood cycles.
2. **Prevent Root Hypoxia & Collar Rot:** Excess water displaces air from soil micropores, causing root asphyxiation and encouraging soil-borne water molds (*Pythium*, *Phytophthora*).
3. **Open Field Drainage:** Clear boundary furrows to let standing surface runoff drain out freely.
4. Re-evaluate irrigation only when soil moisture drops below 40%.`;
    } else if (isOptimalMoisture) {
      return `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (OPTIMAL RANGE)
- **Temperature:** ${temp}°C | **Air Humidity:** ${humidity}%

**Recommendations:**
1. Root-zone moisture is balanced between field capacity and wilting point (**${moisture}%**). Root aeration and water uptake are optimal.
2. No immediate irrigation cycle is needed today.
3. Plan your next 30-minute drip fertigation run once moisture dips toward 35-38%.`;
    } else {
      return `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (DRY / STRESSED)
- **Polyhouse/Field Temp:** ${temp}°C

**Action Plan:**
1. Soil moisture has fallen to **${moisture}%**. Initiate a **35 to 45-minute drip irrigation cycle**.
2. Irrigate early in the morning before 9:30 AM or late in the afternoon to minimize evapotranspiration loss.
3. Shut off the pump once root sensors reach 55-60%.`;
    }
  }

  if (isPhTopic) {
    return `🧪 **Soil pH & Nutrient Bio-availability Report:**
- **Calibrated Soil pH:** **${ph}** (${ph < 6.0 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Optimal Buffer Sweet Spot'})
- **Target Stand:** ${crop}

**Agronomic Analysis:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `Your soil pH of **${ph}** is ideal for ${crop}. Major macro-nutrients (N, P, K) and micro-nutrients (Fe, Mn, Zn, B) are in their most bio-available ionic form.` 
  : ph < 6.0 
  ? `Soil is acidic (${ph}). Free phosphorus gets fixed with iron and aluminum. Broadcast 120-150 kg/acre Agricultural Lime or Dolomite to raise the buffering capacity.` 
  : `Soil is alkaline (${ph}). Micronutrient deficiencies (Zinc/Iron chlorosis) may occur. Incorporate Gypsum @ 200 kg/acre and well-cured FYM compost.`}
2. Apply 200 L/acre of fermented **Jeevamrutha** via drip lines every 15 days to enrich beneficial mycorrhizal fungi and earthworm activity.`;
  }

  if (isPestTopic) {
    return `🌿 **Integrated Pest & Disease Management (IPM):**
Target Crop: **${crop}** | Ambient Temp: **${temp}°C** | Humidity: **${humidity}%**

**Recommended Action Steps:**
1. **Botanical Sucking Pest Spray:** Emulsify cold-pressed 10,000 PPM Neem Oil (5 ml/L + 1 ml liquid soap) against thrips, aphids, and whiteflies.
2. **Biological Disease Control:** For leaf spots, blast, or blights, spray *Trichoderma harzianum* or *Pseudomonas fluorescens* @ 5g/liter during late afternoon.
3. **Sour Buttermilk Treatment:** Apply a 5-day fermented sour buttermilk spray (1:10 dilution with water) to suppress fungal powdery mildew and blights.
4. **Targeted Chemical Spray:** For severe outbreaks, use Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride 50% WP @ 3.0 g/L.`;
  }

  if (isFertilizerTopic) {
    return `🌱 **Crop Nutrition & Fertilizer Schedule:**
Crop: **${crop}** | Soil pH: **${ph}**

**Recommendations:**
1. Avoid excessive single-dose urea. Split nitrogen into 3 equal splits (Basal, Tillering/Vegetative, Panicle/Flowering initiation).
2. Zinc Deficiency Prevention: Apply 10 kg/acre Zinc Sulfate heptahydrate (21%) with compost.
3. Water-soluble fertigation with 19:19:19 (5g/L) or 0:52:34 during flowering gives superior nutrient uptake efficiency over soil broadcasting.`;
  }

  if (isMarketTopic) {
    return `📈 **Agmarknet Mandi Commodity Guidance:**
1. Daily modal prices for **${crop}** are actively tracked in Karnataka APMCs (Mandya, Kolar, Yeshwanthpur, Shimoga, Davangere).
2. Visit the **Mandi Market Prices** tab in Raitha Vikas AI for real-time modal rates, daily gain/loss trends, and min/max ranges.
3. Ensure proper crop cleaning, drying, and grading into A/B grades to realize 15-20% higher market realizations.`;
  }

  // General Context-Aware Agronomy
  return `🌾 **Raitha Vikas AI Precision Farm Advisor:**
Live Field Conditions for **${crop}**:
- **Soil Moisture:** **${moisture}%** (${isHighMoisture ? 'High / Saturated' : isOptimalMoisture ? 'Healthy Optimal' : 'Dry / Low'})
- **Soil pH:** **${ph}** | **Ambient Temp:** **${temp}°C** | **Air Humidity:** **${humidity}%**

**Agronomy Priorities:**
1. **Water Management:** ${isHighMoisture ? 'Hold irrigation; soil moisture is high at ' + moisture + '%. Ensure field drainage.' : isOptimalMoisture ? 'Current soil moisture (' + moisture + '%) is optimal. No watering required.' : 'Moisture is low (' + moisture + '%). A 35-minute drip cycle is recommended.'}
2. **Crop Protection:** Check leaf undersides regularly for early pests or blights. Use the **Crop Disease AI** scanner to upload or select any crop leaf.
3. **Soil Health:** Soil pH of ${ph} provides good buffer stability for nutrient uptake.`;
}
