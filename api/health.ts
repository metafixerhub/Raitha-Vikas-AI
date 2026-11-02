export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    app: 'Raitha Vikas AI (Vercel Serverless)',
    timestamp: new Date().toISOString(),
    gemini: {
      configured: !!process.env.GEMINI_API_KEY,
      model: 'gemini-1.5-flash'
    },
    esp32Configured: !!process.env.ESP32_BASE_URL,
    environment: 'production'
  });
}
