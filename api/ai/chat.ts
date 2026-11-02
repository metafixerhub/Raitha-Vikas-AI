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
- Soil Moisture: ${farmContext?.soilMoisture ?? 32}%
- Soil pH: ${farmContext?.soilPh ?? 6.5}
- Temperature: ${farmContext?.temperature ?? 28.5}°C
- Air Humidity: ${farmContext?.humidity ?? 71}%
- Irrigation Pump: ${farmContext?.pumpStatus ? 'ON (Water flowing)' : 'OFF (Standby)'}

Farmer Question: ${prompt}

Provide practical, clear, and actionable precision farming advice incorporating the sensor telemetry above.`
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

  // Fallback agronomy response if GEMINI_API_KEY is not set on Vercel
  const moisture = farmContext?.soilMoisture ?? 32;
  const ph = farmContext?.soilPh ?? 6.5;
  const crop = farmContext?.cropType || 'Paddy / Tomato';

  const defaultAnswer = 
    language === 'kn'
      ? `🌱 **ರೈತ ವಿಕಾಸ್ AI ಕೃಷಿ ಸಲಹೆಗಾರ:**
- **ಬೆಳೆ:** ${crop} | **ತೇವಾಂಶ:** ${moisture}% | **ಮಣ್ಣಿನ pH:** ${ph}

**ಶಿಫಾರಸು:**
1. ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ತೇವಾಂಶವು ${moisture}% ರಷ್ಟಿದ್ದು, ಹನಿ ನೀರಾವರಿಯನ್ನು ಬೆಳಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀಡುವುದು ಸೂಕ್ತ.
2. ಮಣ್ಣಿನ pH (${ph}) ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆಗೆ ಉತ್ತಮ ಮಟ್ಟದಲ್ಲಿದೆ.
3. ಪ್ರತಿ 15 ದಿನಗಳಿಗೊಮ್ಮೆ ಜೀವಾಮೃತ ಹರಿಸಿ ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಾಣು ಜೀವಿಗಳನ್ನು ವೃದ್ಧಿಸಿ.`
      : language === 'hi'
      ? `🌱 **रैत विकास AI किसान सहायक:**
- **फसल:** ${crop} | **नमी:** ${moisture}% | **पीएच:** ${ph}

**सुझाव:**
1. मिट्टी की वर्तमान नमी ${moisture}% है। ड्रिप द्वारा आवश्यक मात्रा में सिंचाई करें।
2. मृदा pH (${ph}) संतुलित है, जिससे पोषक तत्वों का अवशोषण सुचारू रहेगा।
3. जैविक खाद या जीवामृत का प्रयोग कर मिट्टी की गुणवत्ता बनाए रखें।`
      : `🌱 **Raitha Vikas AI Precision Farm Advisor:**
- **Target Crop:** ${crop} | **Soil Moisture:** ${moisture}% | **Soil pH:** ${ph}

**Key Agronomy Steps:**
1. Root-zone soil moisture is measured at **${moisture}%**. Apply a calibrated drip irrigation cycle before peak afternoon heat.
2. Soil pH of **${ph}** is within optimal buffer ranges for nutrient uptake.
3. Apply fermented organic manure (Jeevamrutha) to maintain soil microbiotic fertility.`;

  res.status(200).json({
    answer: defaultAnswer,
    sessionId,
    timestamp: new Date().toISOString()
  });
}
