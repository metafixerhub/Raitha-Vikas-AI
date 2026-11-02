import React, { useState, useRef } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { SAMPLE_DISEASES } from '../data/mockData';
import { DiseaseDetectionResult } from '../types';
import { apiService } from '../services/apiService';
import { 
  ScanLine, 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Leaf, 
  Info, 
  RefreshCw, 
  Layers, 
  FileText, 
  Beaker, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Bot
} from 'lucide-react';

export const CropDisease: React.FC = () => {
  const { 
    activeDisease, 
    selectDiseaseFromHistory,
    triggerVoiceAnnouncement 
  } = useFarmStore();

  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [previewImage, setPreviewImage] = useState<string>(activeDisease?.imageUrl || SAMPLE_DISEASES[0].imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(activeDisease || SAMPLE_DISEASES[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload a smaller leaf photo.');
      return;
    }

    // Validate MIME type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    triggerVoiceAnnouncement(
      `Analyzing leaf specimen with Gemini AI computer vision.`,
      'crop',
      'info'
    );

    try {
      if (selectedFile) {
        // Send actual uploaded image to secure Gemini backend endpoint
        const result = await apiService.analyzeCropLeaf(selectedFile, selectedCrop);
        setAnalysisResult({
          ...result,
          imageUrl: previewImage,
          analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDemoSample: false
        });

        triggerVoiceAnnouncement(
          `Analysis complete. Possible issue: ${result.possibleIssue || result.possibleDisease}.`,
          'crop',
          'warning'
        );
      } else {
        // For pre-loaded exhibition specimen without a custom file
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const matched = SAMPLE_DISEASES.find(s => s.imageUrl === previewImage) || SAMPLE_DISEASES[0];
        setAnalysisResult({
          ...matched,
          analyzedAt: 'Just now (Specimen Library)'
        });
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'Failed to analyze crop leaf image with Gemini AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: DiseaseDetectionResult) => {
    setSelectedFile(null);
    setPreviewImage(sample.imageUrl);
    setSelectedCrop(sample.cropName.split(' ')[0]);
    setAnalysisResult(sample);
    selectDiseaseFromHistory(sample);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Agricultural AI Diagnostic Notice: </span>
            This tool provides <strong>automated estimates for guidance only</strong> and is not a guaranteed diagnosis. Field inspection by an agricultural officer (KVK) is recommended before applying chemical sprays.
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0 flex items-center gap-1">
          <Bot className="w-3.5 h-3.5" />
          <span>Gemini Vision</span>
        </span>
      </div>

      {/* Error Alert Box if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Diagnostic Warning: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Upload & Scanner (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-emerald-600 dark:text-fresh-400" />
                  Crop Leaf Diagnostic Scanner
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload an image or select a specimen to begin deep learning inspection
                </p>
              </div>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                Select Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                <option value="Paddy / Rice">Paddy / Rice (Oryza sativa)</option>
                <option value="Corn / Maize">Corn / Maize (Zea mays)</option>
                <option value="Cotton">Cotton (Gossypium hirsutum)</option>
                <option value="Sugarcane">Sugarcane (Saccharum officinarum)</option>
                <option value="Chili / Pepper">Chili / Pepper (Capsicum annuum)</option>
              </select>
            </div>

            {/* Leaf Image Preview Area with Scanner Animation */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-950 aspect-video sm:aspect-square flex items-center justify-center group">
              <img 
                src={previewImage} 
                alt="Selected crop leaf" 
                className="w-full h-full object-cover filter contrast-105"
              />

              <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e15_1px,transparent_1px),linear-gradient(to_bottom,#22c55e15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Laser Scanning Animation Bar when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-fresh-400 to-transparent shadow-[0_0_15px_#22c55e] animate-scan pointer-events-none z-20" />
              )}

              {/* Processing badge overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-forest-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-white space-y-3 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-fresh-500/20 border border-fresh-400 text-fresh-400 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-fresh-300">
                      Analyzing with Gemini Multimodal Vision...
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Identifying foliar lesions, chlorosis & pathogens
                    </p>
                  </div>
                </div>
              )}

              {!isAnalyzing && (
                <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-emerald-400/50 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono bg-forest-900/80 text-fresh-300 px-1.5 py-0.5 rounded backdrop-blur-sm border border-forest-500/40">
                      {selectedFile ? 'UPLOADED_LEAF: 1024x1024' : 'SPECIMEN: 256x256'}
                    </span>
                    <span className="w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Upload or Choose file buttons */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{selectedFile ? 'Change Photo' : 'Upload Leaf Photo'}</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-700 hover:to-forest-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-forest-950/20 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-harvest-400" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
              </button>
            </div>

            {selectedFile && (
              <p className="text-[11px] text-emerald-600 font-semibold text-center truncate">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}

            {/* Specimen Library for Instant Exhibition Testing */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Science Fair Specimen Library:</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to test instantly</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_DISEASES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-1.5 rounded-xl border text-left transition flex flex-col items-center gap-1.5 group ${
                      analysisResult?.id === sample.id
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-full h-12 rounded-lg overflow-hidden bg-slate-200 relative">
                      <img 
                        src={sample.imageUrl} 
                        alt={sample.cropName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {sample.cropName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: AI Diagnosis Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {analysisResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
              
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Possible Issue / Condition (Estimate)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      Crop: {analysisResult.cropName}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {analysisResult.possibleIssue || analysisResult.possibleDisease}
                  </h2>
                  {analysisResult.scientificName && (
                    <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-0.5">
                      Taxon / Pathogen: {analysisResult.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-[90px]">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Confidence
                    </span>
                    <span className="text-xl font-black text-emerald-700 dark:text-fresh-400">
                      {analysisResult.confidence}%
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border text-center min-w-[90px] ${
                    analysisResult.severity === 'Severe' || analysisResult.confidenceLevel === 'High'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                  }`}>
                    <span className="text-[10px] font-bold opacity-80 block uppercase">
                      Severity
                    </span>
                    <span className="text-sm font-black uppercase">
                      {analysisResult.severity || analysisResult.confidenceLevel || 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600 dark:text-fresh-400" />
                  Key Observed Symptoms
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {(analysisResult.symptoms || []).map((symptom: string, idx: number) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-fresh-400 shrink-0 mt-1.5" />
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remedies Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Beaker className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Recommended Treatment & Cultural Practices
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Organic Remedies */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                    <span className="text-xs font-bold text-forest-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-fresh-500" />
                      Organic & Biological Remedies
                    </span>
                    <ul className="text-xs text-emerald-900 dark:text-emerald-200/90 space-y-1.5 list-disc pl-4 leading-relaxed">
                      {(analysisResult.organicRemedies || []).map((remedy: string, i: number) => (
                        <li key={i}>{remedy}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Remedies */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Beaker className="w-3.5 h-3.5 text-slate-500" />
                      Approved Chemical Management (If Outbreak Spreads)
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                      {(analysisResult.chemicalRemedies || []).map((chem: string, i: number) => (
                        <li key={i}>{chem}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prevention & KVK Expert Advice */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Agronomist Consultation Guidance
                </span>
                <p className="text-xs text-blue-950 dark:text-blue-200/90 leading-relaxed">
                  {analysisResult.expertAdvice || 'If symptoms persist or spread across more than 15% of the plant canopy, collect a fresh leaf sample in a sealed plastic bag and consult the nearest Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra.'}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Analyzed at: {analysisResult.analyzedAt || 'Just now'}</span>
                <span>Inference: Gemini Vision API (Google GenAI SDK)</span>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <ScanLine className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Leaf Specimen Analyzed Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a photo on the left or select a pre-loaded sample to run the AI diagnosis.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
