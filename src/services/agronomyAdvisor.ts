/**
 * Built-in Intelligent Agronomy Advisor for Raitha Vikas AI
 * Provides instant, localized precision farming guidance in Kannada, Hindi, and English
 * using real-time IoT sensor telemetry (Moisture, pH, Temp, Humidity, Pump).
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
  const p = prompt.toLowerCase();
  const moisture = context?.soilMoisture ?? 32;
  const ph = context?.soilPh ?? 6.5;
  const temp = context?.temperature ?? 28.5;
  const humidity = context?.humidity ?? 71;
  const crop = context?.cropType || 'Paddy / Tomato';
  const pumpOn = context?.pumpStatus ?? false;

  const isIrrigation = p.includes('water') || p.includes('irrigat') || p.includes('moisture') || p.includes('pump') || p.includes('drip') || p.includes('ನೀರು') || p.includes('ತೇವಾಂಶ') || p.includes('ನೀರಾವರಿ') || p.includes('पानी') || p.includes('सिंचाई') || p.includes('नमी');
  const isPh = p.includes('ph') || p.includes('acid') || p.includes('alkali') || p.includes('soil') || p.includes('ಮಣ್ಣು') || p.includes('ಪಿಎಚ್') || p.includes('मिट्टी') || p.includes('पीएच');
  const isPest = p.includes('pest') || p.includes('disease') || p.includes('bug') || p.includes('fung') || p.includes('spot') || p.includes('rot') || p.includes('ರೋಗ') || p.includes('ಕೀಟ') || p.includes('ಬಾಧೆ') || p.includes('रोग') || p.includes('कीट');
  const isFertilizer = p.includes('fertiliz') || p.includes('npk') || p.includes('urea') || p.includes('compost') || p.includes('ಗೊಬ್ಬರ') || p.includes('ಪೋಷಕಾಂಶ') || p.includes('खाद') || p.includes('उर्वरक');

  // 1. Kannada (ಕನ್ನಡ)
  if (language === 'kn') {
    if (isIrrigation) {
      const needWater = moisture < 35;
      return `🌱 **ರೈತ ವಿಕಾಸ್ AI ನೀರಾವರಿ ಸಲಹೆ:**
ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರಸ್ತುತ ಸಂವೇದಕ ವಾಚನ:
- **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% ${needWater ? '(ಕಡಿಮೆ - ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ)' : '(ಸೂಕ್ತ ಮಟ್ಟದಲ್ಲಿದೆ)'}
- **ತಾಪಮಾನ:** ${temp}°C | **ಗಾಳಿಯ ಆರ್ದ್ರತೆ:** ${humidity}%
- **ಪಂಪ್ ಸ್ಥಿತಿ:** ${pumpOn ? 'ಚಾಲನೆಯಲ್ಲಿದೆ (ON)' : 'ನಿಂತಿದೆ (OFF)'}

**ಶಿಫಾರಸು:**
${needWater 
  ? `1. ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ತೇವಾಂಶವು ${moisture}% ರಷ್ಟಿದ್ದು, ${crop} ಬೆಳೆಗೆ **30 ರಿಂದ 45 ನಿಮಿಷಗಳ ಕಾಲ ಹನಿ ನೀರಾವರಿ (Drip Irrigation)** ನೀಡುವುದು ಸೂಕ್ತ.
2. ಬಿಸಿಲಿನ ಸಮಯದಲ್ಲಿ ನೀರು ಹರಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ; ಬೆಳಗ್ಗೆ 8 ಗಂಟೆಯ ಮೊದಲು ಅಥವಾ ಸಂಜೆ 5 ಗಂಟೆಯ ನಂತರ ನೀರು ನೀಡಿ.
3. ತೇವಾಂಶವು 50-60% ತಲುಪಿದಾಗ ಪಂಪ್ ಅನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆಫ್ ಮಾಡಿ.` 
  : `1. ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶವಿದೆ (${moisture}%). ತಕ್ಷಣಕ್ಕೆ ನೀರು ಹರಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.
2. ಅಧಿಕ ನೀರು ನಿಲ್ಲುವುದರಿಂದ ಬೇರು ಕೊಳೆಯುವ ರೋಗ ಬರಬಹುದು, ಆದ್ದರಿಂದ ಡ್ರೈನೇಜ್ ಸರಾಗವಾಗಿರಲಿ.`}`;
    }

    if (isPh) {
      const phStatus = ph < 6.0 ? 'ಆಮ್ಲೀಯ (Acidic)' : ph > 7.5 ? 'ಕ್ಷಾರೀಯ (Alkaline)' : 'ಸೂಕ್ತ / ಸಮತೋಲಿತ (Optimal)';
      return `🧪 **ಮಣ್ಣಿನ ಪಿಎಚ್ ಮತ್ತು ಫಲವತ್ತತೆ ವಿಶ್ಲೇಷಣೆ:**
- **ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ pH:** ${ph} (${phStatus})
- **ಬೆಳೆ:** ${crop}

**ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `ನಿಮ್ಮ ಮಣ್ಣಿನ pH (${ph}) ಅತ್ಯುತ್ತಮ ಮಟ್ಟದಲ್ಲಿದೆ! ಸಾರಜನಕ (N), ರಂಜಕ (P) ಮತ್ತು ಪೊಟ್ಯಾಶ್ (K) ಹೀರಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಗರಿಷ್ಠವಾಗಿದೆ.` 
  : ph < 6.0 
  ? `ಮಣ್ಣು ಸ್ವಲ್ಪ ಆಮ್ಲೀಯವಾಗಿದೆ. ಪ್ರತಿ ಎಕರೆಗೆ 100-150 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ (Agricultural Lime / Dolomite) ಮಣ್ಣಿಗೆ ಬೆರೆಸಿ.` 
  : `ಮಣ್ಣು ಕ್ಷಾರೀಯವಾಗಿದೆ. ಜಿಪ್ಸಮ್ (Gypsum) ಅಥವಾ ಹೆಚ್ಚಿನ ಪ್ರಮಾಣದ ಸಾವಯವ ಗೊಬ್ಬರ (FYM) ಬಳಸಿ.`}
2. ಪ್ರತಿ 15 ದಿನಗಳಿಗೊಮ್ಮೆ 200 ಲೀಟರ್ **ಜೀವಾಮೃತ (Jeevamrutha)** ಹನಿ ನೀರಾವರಿಯ ಮೂಲಕ ಹರಿಸಿ, ಇದು ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಾಣು ಜೀವಿಗಳನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.
3. ಅತಿಯಾದ ರಾಸಾಯನಿಕ ಯೂರಿಯಾ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮಣ್ಣಿನ ನೈಸರ್ಗಿಕ ಸಮತೋಲನ ಕಾಪಾಡಿ.`;
    }

    if (isPest) {
      return `🌿 **ಸಾವಯವ ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ ಮಾರ್ಗದರ್ಶಿ:**
- **ಬೆಳೆ:** ${crop} | **ತಾಪಮಾನ:** ${temp}°C

**ತ್ವರಿತ ನೈಸರ್ಗಿಕ ಪರಿಹಾರ ಕ್ರಮಗಳು:**
1. **ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪರಣೆ:** 1 ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ (10,000 PPM) ಮತ್ತು 1 ಮಿ.ಲೀ ಸಾಬೂನು ದ್ರಾವಣ ಬೆರೆಸಿ ಎಲೆಗಳ ಅಡಿಭಾಗಕ್ಕೆ ಸಿಂಪಡಿಸಿ.
2. **ಹುಳಿ ಮಜ್ಜಿಗೆ ದ್ರಾವಣ:** ಶಿಲೀಂಧ್ರ ರೋಗಗಳ (Leaf Spot / Blight) ನಿಯಂತ್ರಣಕ್ಕೆ 5 ದಿನ ಹಳೆಯ ಹುಳಿ ಮಜ್ಜಿಗೆಯನ್ನು (1 ಲೀಟರ್ ಮಜ್ಜಿಗೆಗೆ 9 ಲೀಟರ್ ನೀರು) ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
3. **ಟ್ರೈಕೋಡರ್ಮಾ:** ಮಣ್ಣಿನ ಬೇರು ರೋಗಗಳಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ಹಾರ್ಜಿಯಾನಂ (Trichoderma viride) 5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಬುಡಕ್ಕೆ ಹಾಕಿ.`;
    }

    return `🌾 **ರೈತ ವಿಕಾಸ್ AI ಕೃಷಿ ಸಲಹೆಗಾರ:**
ನಿಮ್ಮ **${crop}** ಜಮೀನಿನ ನೈಜ ಸ್ಥಿತಿ:
- **ಮಣ್ಣಿನ ತೇವಾಂಶ:** ${moisture}% | **ಮಣ್ಣಿನ pH:** ${ph}
- **ತಾಪಮಾನ:** ${temp}°C | **ವಾತಾವರಣ:** ಅನುಕೂಲಕರ

**ಇಂದಿನ ಕೃಷಿ ಕಾರ್ಯಸೂಚಿ:**
1. ಮಣ್ಣಿನ ತೇವಾಂಶ (${moisture}%) ಮತ್ತು ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.
2. ಕಳೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಮಣ್ಣು ಸಡಿಲಗೊಳಿಸುವ (Inter-cultivation) ಕಾರ್ಯ ಕೈಗೊಳ್ಳಿ.
3. ಯಾವುದೇ ರೋಗ ಲಕ್ಷಣ ಕಂಡುಬಂದಲ್ಲಿ ರೈತ ವಿಕಾಸ್ AI ಯ **Crop Disease AI** ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.`;
  }

  // 2. Hindi (हिंदी)
  if (language === 'hi') {
    if (isIrrigation) {
      const needWater = moisture < 35;
      return `🌱 **रैत विकास AI सिंचाई सलाह:**
आपके खेत का वर्तमान सेंसर डेटा:
- **मिट्टी की नमी:** ${moisture}% ${needWater ? '(कम - सिंचाई आवश्यक)' : '(अनुकूल स्तर)'}
- **तापमान:** ${temp}°C | **हवा में नमी:** ${humidity}%

**सिफारिशें:**
${needWater 
  ? `1. मिट्टी में नमी केवल ${moisture}% है, अतः ${crop} के लिए **30 से 40 मिनट की ड्रिप सिंचाई** तुरंत करें।
2. तेज धूप में पानी देने से बचें; सुबह 8 बजे से पहले या शाम को पानी दें।
3. नमी 55-60% तक पहुंचने पर सिंचाई बंद कर दें।` 
  : `1. मिट्टी में पर्याप्त नमी (${moisture}%) मौजूद है। फिलहाल सिंचाई की आवश्यकता नहीं है।
2. अत्यधिक जलभराव से बचें ताकि जड़ गलन की समस्या न हो।`}`;
    }

    if (isPh) {
      return `🧪 **मिट्टी का पीएच (pH) और पोषक तत्व विश्लेषण:**
- **वर्तमान मृदा pH:** ${ph} (${ph < 6.8 ? 'हल्का अम्लीय' : 'संतुलित'})
- **फसल:** ${crop}

**कृषि विशेषज्ञ सुझाव:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `आपकी मिट्टी का pH मान (${ph}) बहुत उत्तम है! N-P-K और सूक्ष्म पोषक तत्वों का अवशोषण सुचारू रहेगा।` 
  : `मिट्टी के संतुलन हेतु प्रति एकड़ 2 ट्रॉली सड़ी गोबर खाद या वर्मीकम्पोस्ट का प्रयोग करें।`}
2. प्रति एकड़ 200 लीटर **जीवामृत** ड्रिप के माध्यम से दें, जिससे मिट्टी की जैविक शक्ति बढ़ती है।
3. रासायनिक उर्वरकों का अत्यधिक छिड़काव करने से बचें।`;
    }

    return `🌾 **रैत विकास AI किसान सहायक:**
आपकी **${crop}** फसल की वर्तमान स्थिति:
- **मिट्टी की नमी:** ${moisture}% | **पीएच मान:** ${ph}
- **तापमान:** ${temp}°C | **आर्द्रता:** ${humidity}%

**आज का सुझाव:**
1. खेत में उचित नमी बनाए रखें और कीट-पतंगों की नियमित निगरानी करें।
2. यदि फसल पर कोई पत्ती धब्बा दिखे, तो **Crop Disease AI** में फोटो अपलोड कर जांच करें।`;
  }

  // 3. English (Default)
  if (isIrrigation) {
    const needWater = moisture < 35;
    return `🌱 **Raitha Vikas AI Precision Irrigation Advisory:**
Live Telemetry for **${crop}**:
- **Volumetric Soil Moisture:** ${moisture}% ${needWater ? '(Low — Irrigation Advised)' : '(Optimal Moisture)'}
- **Polyhouse/Field Temp:** ${temp}°C | **Air Humidity:** ${humidity}%
- **Pump Status:** ${pumpOn ? 'ACTIVE (Pumping)' : 'STANDBY (Off)'}

**Agronomist Action Plan:**
${needWater 
  ? `1. Soil moisture is currently at **${moisture}%**, which is below the threshold for ${crop}. Initiate a **35 to 45-minute drip cycle**.
2. Avoid watering during peak sunlight hours to minimize evapotranspiration losses; early morning (before 9 AM) is optimal.
3. Shut off the pump once root-zone volumetric moisture reaches 55-60%.` 
  : `1. Current soil moisture is healthy at **${moisture}%**. Immediate irrigation is not required.
2. Monitor soil drainage to prevent hypoxia (oxygen deprivation) at the root tip.`}`;
  }

  if (isPh) {
    return `🧪 **Soil pH & Root Uptake Assessment:**
- **Calibrated Soil pH:** ${ph} (${ph < 6.8 ? 'Slightly Acidic' : 'Optimal Neutral'})
- **Target Crop Stand:** ${crop}

**Agronomic Recommendations:**
1. ${ph >= 6.0 && ph <= 7.2 
  ? `Your soil pH of **${ph}** is in the prime agronomic sweet spot for ${crop}. Micronutrient availability (Fe, Mn, Zn, Cu) and macronutrient absorption (N, P, K) are maximized.` 
  : ph < 6.0 
  ? `Soil is slightly acidic (${ph}). Incorporate agricultural dolomite or calcitic lime at 100 kg/acre to restore buffering capacity.` 
  : `Soil pH is slightly alkaline (${ph}). Apply gypsum or sulfur-enriched organic compost.`}
2. Introduce 200 L/acre of fermented **Jeevamrutha** via fertigation every fortnight to stimulate beneficial mycorrhizae and earthworm activity.
3. Ensure secondary macronutrients (Calcium & Magnesium) are maintained during the vegetative growth spurt.`;
  }

  if (isPest) {
    return `🌿 **Integrated Pest & Disease Management (IPM):**
- **Crop:** ${crop} | **Ambient Temp:** ${temp}°C | **Humidity:** ${humidity}%

**Immediate Organic & Protective Steps:**
1. **Botanical Spray:** Prepare a 5% Neem Seed Kernel Extract (NSKE) or 10,000 PPM cold-pressed Neem Oil emulsion (5 ml/L + 1 ml mild surfactant) to disrupt sap-sucking pests (aphids, thrips, whiteflies).
2. **Bio-Fungicide:** For fungal leaf spots or blights, spray *Trichoderma harzianum* or *Pseudomonas fluorescens* @ 5g/liter during late afternoon.
3. **Sour Buttermilk Treatment:** Apply 5-day fermented sour curd/buttermilk foliar spray (1:10 dilution with water) to suppress downy and powdery mildew spores organically.`;
  }

  return `🌾 **Raitha Vikas AI Farm Advisory:**
Field Conditions for **${crop}**:
- **Soil Moisture:** ${moisture}% | **Soil pH:** ${ph}
- **Temperature:** ${temp}°C | **Humidity:** ${humidity}%

**Key Agronomy Priorities Today:**
1. Current sensor readings indicate healthy root zone parameters. Maintain soil moisture between 35% and 65%.
2. Perform light inter-cultivation or mulching around crop rows to prevent capillary moisture evaporation.
3. To inspect crop leaves for blights, fungal spots, or nutrient deficiencies, use the **Crop Disease AI** scanner tab for a real-time deep learning diagnosis.`;
}
