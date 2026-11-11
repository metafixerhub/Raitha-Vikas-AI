export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { prompt, farmContext, sessionId = 'default-session', language = 'en' } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim()) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Raitha Vikas AI (ರೈತ ವಿಕಾಸ AI), an expert agronomic assistant for Indian agriculture.
Language: ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Live Farm Telemetry:
- Crop Stand: ${farmContext?.cropType || 'Paddy (Rice) & Tomato'}
- Soil Moisture: ${farmContext?.soilMoisture ?? 32}% (${farmContext?.moistureStatus || (Number(farmContext?.soilMoisture ?? 32) < 35 ? 'Dry' : Number(farmContext?.soilMoisture ?? 32) > 65 ? 'Wet' : 'Normal')})
- Soil pH: ${farmContext?.soilPh ?? 6.5}
- Temperature: ${farmContext?.temperature ?? 28.5}°C (DHT22)
- Air Humidity: ${farmContext?.humidity ?? 71}% (DHT22)
- Irrigation Pump: ${farmContext?.pumpStatus ? 'ON (Water flowing via 5V Relay)' : 'OFF (Standby)'}
- Controller Battery: ${farmContext?.controllerBatteryPercent ?? 84}% (MAX17048 Fuel Gauge)
- Safety System: Autonomous local hysteresis & 3-minute runaway watchdog active on ESP32

Farmer Question: ${prompt}

Provide practical, clear, and actionable precision farming advice incorporating the sensor telemetry above.
Safety Guardrails: Always respect the ESP32 controller's local safety rules. The pump is isolated via a 5V relay module with a dedicated DC battery and local hardware watchdog.`
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          return res.status(200).json({
            answer,
            sessionId,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.warn('Vercel Gemini serverless call error:', err);
    }
  }

  // Fallback dynamic precision agronomy engine if GEMINI_API_KEY is not set on Vercel
  const p = (prompt || '').toLowerCase().trim();
  const moisture = Number(farmContext?.soilMoisture ?? 32);
  const ph = Number(farmContext?.soilPh ?? 6.5);
  const temp = Number(farmContext?.temperature ?? 28.5);
  const humidity = Number(farmContext?.humidity ?? 71);
  const crop = farmContext?.cropType || 'Paddy / Tomato';
  const pumpOn = Boolean(farmContext?.pumpStatus);

  const isHighMoisture = moisture >= 65;
  const isOptimalMoisture = moisture >= 38 && moisture < 65;
  const isLowMoisture = moisture < 38;

  const isIrrigation = /water|irrigat|moisture|pump|drip|dry|flood|ನೀರು|ತೇವಾಂಶ|ನೀರಾವರಿ|ಪಂಪ್|ಹನಿ|पानी|सिंचाई|नमी/i.test(p);
  const isPhTopic = /ph|acid|alkali|lime|gypsum|buffer|ಪಿಎಚ್|ಆಮ್ಲ|ಕ್ಷಾರ|ಸುಣ್ಣ|ಜಿಪ್ಸಮ್|ಮಣ್ಣು|मिट्टी|पीएच/i.test(p);
  const isPestTopic = /pest|disease|bug|fung|spot|rot|blast|blight|worm|borer|aphid|thrips|whitefly|wilt|curling|ರೋಗ|ಕೀಟ|ಹುಳು|ಬೆಂಕಿ|ಒಣಗು|ಕೊಳೆ|ಸೊರಗು|रोग|कीट|ब्लाइट|ब्लास्ट/i.test(p);
  const isFertilizerTopic = /fertiliz|npk|urea|dap|potash|mop|zinc|boron|compost|manure|jeevamrutha|ಗೊಬ್ಬರ|ಯೂರಿಯಾ|ರಂಜಕ|ಪೊಟ್ಯಾಶ್|ಜೀವಾಮೃತ|खाद|उर्वरक|यूरिया/i.test(p);
  const isMarketTopic = /mandi|price|rate|market|apmc|cost|sell|ಬೆಲೆ|ಧಾರಣೆ|ದರ|ಮಾರುಕಟ್ಟೆ|ಭಾವ|दाम|मंडी/i.test(p);

  let defaultAnswer = '';

  if (language === 'kn') {
    if (isIrrigation) {
      if (isHighMoisture) {
        defaultAnswer = `💧 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ:**
- **ಬೆಳೆ:** ${crop} | **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% (ಹೆಚ್ಚಿನ ತೇವಾಂಶ / ಅಧಿಕ ನೀರು)
- **ಪಂಪ್ ಸ್ಥಿತಿ:** ${pumpOn ? 'ಚಾಲನೆಯಲ್ಲಿದೆ (ತಕ್ಷಣ ಆಫ್ ಮಾಡಿ!)' : 'ನಿಂತಿದೆ (OFF)'}

**ಶಿಫಾರಸು:**
1. **ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ:** ಮಣ್ಣಿನಲ್ಲಿ ಈಗಾಗಲೇ **${moisture}%** ಅಧಿಕ ತೇವಾಂಶವಿದೆ. ಈಗ ನೀರು ಹರಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ.
2. **ಬೇರು ಕೊಳೆತ ತಡೆಗಟ್ಟಿ:** ಅಧಿಕ ನೀರಿನಿಂದ ಬೇರುಗಳಿಗೆ ಗಾಳಿ ಸಿಗದೆ ಬೇರು ಕೊಳೆತ (Root Rot) ಬರಬಹುದು. ಗದ್ದೆಯ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.
3. ತೇವಾಂಶವು 45% ಕ್ಕೆ ಇಳಿಯುವವರೆಗೂ ನೀರು ಹರಿಸಬೇಡಿ.`;
      } else {
        defaultAnswer = `💧 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ವಿಶ್ಲೇಷಣೆ:**
- **ಬೆಳೆ:** ${crop} | **ತೇವಾಂಶ:** ${moisture}% (${isOptimalMoisture ? 'ಸೂಕ್ತ ಮಟ್ಟ' : 'ಕಡಿಮೆ ತೇವಾಂಶ'})

**ಶಿಫಾರಸು:**
${isOptimalMoisture 
  ? '1. ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶವಿದೆ. ತಕ್ಷಣಕ್ಕೆ ನೀರು ಹರಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.' 
  : '1. ಮಣ್ಣು ಒಣಗಿದ್ದು, 35-40 ನಿಮಿಷಗಳ ಕಾಲ ಹನಿ ನೀರಾವರಿ ನೀಡುವುದು ಸೂಕ್ತ.'}
2. ಬಿಸಿಲಿನ ಸಮಯದಲ್ಲಿ ನೀರು ಹರಿಸದೆ ಬೆಳಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ನೀಡಿ.`;
      }
    } else if (isPhTopic) {
      defaultAnswer = `🧪 **ಮಣ್ಣಿನ pH ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ:**
- **ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ pH:** ${ph} (${ph < 6.0 ? 'ಆಮ್ಲೀಯ' : ph > 7.5 ? 'ಕ್ಷಾರೀಯ' : 'ಸಮತೋಲಿತ ಸೂಕ್ತ ಮಟ್ಟ'})
- **ಬೆಳೆ:** ${crop}

**ಶಿಫಾರಸು:**
1. ${ph >= 6.0 && ph <= 7.2 ? `ಮಣ್ಣಿನ pH (${ph}) ಅತ್ಯುತ್ತಮವಾಗಿದೆ. N-P-K ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಗರಿಷ್ಠವಾಗಿದೆ.` : 'ಎಕರೆಗೆ 150 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಜಿಪ್ಸಮ್ ಬೆರೆಸಿ ಮಣ್ಣನ್ನು ಸರಿಪಡಿಸಿ.'}
2. ಪ್ರತಿ 15 ದಿನಗಳಿಗೊಮ್ಮೆ 200 ಲೀಟರ್ ಜೀವಾಮೃತ ಹರಿಸಿ ಮಣ್ಣಿನ ಜೈವಿಕ ಶಕ್ತಿ ಹೆಚ್ಚಿಸಿ.`;
    } else if (isPestTopic) {
      defaultAnswer = `🌿 **ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣಾ ಮಾರ್ಗದರ್ಶಿ:**
- **ಬೆಳೆ:** ${crop} | **ತಾಪಮಾನ:** ${temp}°C | **ಆರ್ದ್ರತೆ:** ${humidity}%

**ಪರಿಹಾರ:**
1. 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆ (ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ) ಸಿಂಪಡಿಸಿ ರಸಹೀರುವ ಕೀಟಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.
2. ಎಲೆ ಚುಕ್ಕೆ ಅಥವಾ ಬೆಂಕಿ ರೋಗಕ್ಕೆ 5 ದಿನ ಹಳೆಯ ಹುಳಿ ಮಜ್ಜಿಗೆ ದ್ರಾವಣ (1:10 ಪ್ರಮಾಣ) ಸಿಂಪಡಿಸಿ.
3. ಬೇರು ಕೊಳೆತಕ್ಕೆ ಟ್ರೈಕೋಡರ್ಮಾ ಹಾರ್ಜಿಯಾನಂ 5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಬುಡಕ್ಕೆ ಹಾಕಿ.`;
    } else {
      defaultAnswer = `🌾 **ರೈತ ವಿಕಾಸ್ AI ಕೃಷಿ ಸಹಾಯಕ:**
- **ಬೆಳೆ:** ${crop} | **ತೇವಾಂಶ:** ${moisture}% | **pH:** ${ph} | **ತಾಪಮಾನ:** ${temp}°C

**ಇಂದಿನ ಕೃಷಿ ನಿರ್ವಹಣೆ:**
1. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}% ರಷ್ಟಿದ್ದು, ${isHighMoisture ? 'ನೀರು ಹೆಚ್ಚಾಗಿದೆ, ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.' : isOptimalMoisture ? 'ಸಮತೋಲಿತವಾಗಿದೆ.' : 'ನೀರು ಕಡಿಮೆಯಾಗಿದೆ, ಹನಿ ನೀರಾವರಿ ನೀಡಿ.'}
2. ಎಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಲ್ಲಿ **Crop Disease AI** ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿ ಎಲೆಯ ಹೆಸರು ನಮೂದಿಸಿ ಪರೀಕ್ಷಿಸಿ.`;
    }
  } else {
    // English
    if (isIrrigation) {
      if (isHighMoisture) {
        defaultAnswer = `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (SATURATED / HIGH WATER CONTENT)
- **Soil pH:** ${ph} | **Ambient Temp:** ${temp}°C
- **Pump Status:** ${pumpOn ? 'RUNNING (TURN OFF IMMEDIATELY!)' : 'STANDBY (OFF)'}

**Agronomic Directive:**
1. **Hold Irrigation:** Root-zone soil moisture is elevated at **${moisture}%**. Do **NOT** run drip or flood cycles.
2. **Prevent Root Rot:** Waterlogging starves root tips of oxygen. Clear field furrows to discharge standing surface runoff.
3. Resume irrigation only after moisture declines below 40%.`;
      } else if (isOptimalMoisture) {
        defaultAnswer = `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (OPTIMAL HYDRATION)
- **Temperature:** ${temp}°C | **Humidity:** ${humidity}%

**Recommendations:**
1. Root-zone moisture is balanced at **${moisture}%**. Root respiration and nutrient mobility are optimal.
2. No immediate irrigation needed today.
3. Plan your next 35-minute drip cycle when moisture falls below 38%.`;
      } else {
        defaultAnswer = `💧 **Raitha Vikas AI Precision Irrigation Assessment:**
Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** **${moisture}%** (DRY / IRRIGATION NEEDED)

**Action Plan:**
1. Moisture has dropped to **${moisture}%**. Initiate a **35 to 45-minute drip irrigation cycle**.
2. Irrigate during early morning or late afternoon to prevent evaporation losses.`;
      }
    } else if (isPhTopic) {
      defaultAnswer = `🧪 **Soil pH & Nutrient Bio-availability:**
- **Calibrated Soil pH:** **${ph}** (${ph < 6.0 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Optimal Buffer Range'})
- **Target Stand:** ${crop}

**Agronomic Analysis:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `Soil pH of **${ph}** is ideal for ${crop}. Major macro-nutrients (N, P, K) and micro-nutrients are fully bio-available.` 
  : ph < 6.0 
  ? `Soil is acidic (${ph}). Broadcast 100-150 kg/acre Agricultural Lime or Dolomite to raise buffering capacity.` 
  : `Soil is alkaline (${ph}). Apply Gypsum @ 200 kg/acre with well-cured compost.`}
2. Apply 200 L/acre of fermented Jeevamrutha every fortnight to sustain soil microbes.`;
    } else if (isPestTopic) {
      defaultAnswer = `🌿 **Integrated Pest & Disease Management (IPM):**
Target Crop: **${crop}** | Temp: **${temp}°C** | Humidity: **${humidity}%**

**Remedies:**
1. **Botanical Spray:** Emulsify 10,000 PPM Neem Oil (5 ml/L + 1 ml liquid soap) against sucking pests (thrips, aphids, whiteflies).
2. **Bio-Fungicide:** Spray *Trichoderma harzianum* or *Pseudomonas fluorescens* @ 5g/L during late afternoon.
3. **Sour Buttermilk:** Apply 5-day fermented sour buttermilk spray (1:10 dilution with water) to suppress fungal powdery mildew and blights.
4. **Chemical Spray:** For severe outbreaks, apply Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride @ 3.0 g/L.`;
    } else {
      defaultAnswer = `🌾 **Raitha Vikas AI Precision Farm Advisor:**
Live Field Conditions for **${crop}**:
- **Soil Moisture:** **${moisture}%** (${isHighMoisture ? 'High / Saturated' : isOptimalMoisture ? 'Healthy Optimal' : 'Dry / Low'})
- **Soil pH:** **${ph}** | **Ambient Temp:** **${temp}°C**

**Agronomy Action Points:**
1. **Water Management:** ${isHighMoisture ? 'Hold irrigation; soil moisture is high at ' + moisture + '%. Ensure field drainage.' : isOptimalMoisture ? 'Soil moisture (' + moisture + '%) is optimal. No watering required.' : 'Moisture is low (' + moisture + '%). A 35-minute drip cycle is recommended.'}
2. **Crop Leaf Health:** Use the **Crop Disease AI** scanner to upload or select any crop leaf for instant diagnosis and remedies.
3. **Nutrition:** Soil pH of ${ph} provides good buffer stability for nutrient uptake.`;
    }
  }

  res.status(200).json({
    answer: defaultAnswer,
    sessionId,
    timestamp: new Date().toISOString()
  });
}
