import React, { useState, useCallback } from 'react';
import { FoodInput, InputType, AnalysisResult } from './types';
import CameraModal from './components/CameraModal';
import AnalysisResultComponent from './components/AnalysisResult';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<FoodInput[]>([]);
  const [activityGoal, setActivityGoal] = useState<string>('');
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [portionValue, setPortionValue] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---

  const addTextInput = () => {
    if (!textInputValue.trim()) return;
    const newInput: FoodInput = {
      id: Date.now().toString(),
      type: 'text',
      value: textInputValue,
      portion: portionValue || undefined
    };
    setInputs(prev => [...prev, newInput]);
    setTextInputValue('');
    setPortionValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newInput: FoodInput = {
          id: Date.now().toString(),
          type: 'image',
          value: base64String
        };
        setInputs(prev => [...prev, newInput]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64Image: string) => {
    const newInput: FoodInput = {
      id: Date.now().toString(),
      type: 'camera',
      value: base64Image
    };
    setInputs(prev => [...prev, newInput]);
  };

  const removeInput = (id: string) => {
    setInputs(prev => prev.filter(i => i.id !== id));
  };

  const handleAnalyze = async () => {
    if (inputs.length === 0) {
      setError("Please add at least one food input.");
      return;
    }
    if (!activityGoal.trim()) {
      setError("Please specify your activity/lifestyle goal.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/geminiService', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs, activityGoal }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed');
      }
      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Analysis failed. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">API Tracker</h1>
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest hidden sm:block">
            Antioxidant Protection Index
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Input Section */}
        <section className="space-y-6">
          
          {/* Activity Goal Input */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="block text-sm font-semibold text-slate-700 mb-2">
                Step 1: Activity & Lifestyle Context
             </label>
             <input
                type="text"
                value={activityGoal}
                onChange={(e) => setActivityGoal(e.target.value)}
                placeholder="e.g., 'Recovering from flu', 'Running a marathon', 'Sedentary office work'"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
             />
          </div>

          {/* Food Input Tabs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="block text-sm font-semibold text-slate-700 mb-4">
                Step 2: Add Food Inputs
             </label>
             
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Text Entry */}
                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={textInputValue}
                            onChange={(e) => setTextInputValue(e.target.value)}
                            placeholder="Food Name (e.g. Blueberries)"
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                        <input
                            type="text"
                            value={portionValue}
                            onChange={(e) => setPortionValue(e.target.value)}
                            placeholder="Portion (g)"
                            className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>
                    <button 
                        onClick={addTextInput}
                        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-sm transition-colors"
                    >
                        Add Text Entry
                    </button>
                </div>

                <div className="hidden md:block w-px bg-slate-100 mx-2"></div>

                {/* Media Entry */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-400 transition-all group">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-xs font-medium text-slate-500">Upload Photo</span>
                    </label>

                    <button 
                        onClick={() => setIsCameraOpen(true)}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-400 transition-all group"
                    >
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className="text-xs font-medium text-slate-500">Scan Label</span>
                    </button>
                </div>
             </div>

             {/* Input List */}
             {inputs.length > 0 && (
                <div className="space-y-2 mt-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Current Inputs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {inputs.map((input) => (
                            <div key={input.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                {input.type === 'text' ? (
                                    <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                        T
                                    </div>
                                ) : (
                                    <img src={input.value} alt="Input" className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">
                                        {input.type === 'text' ? input.value : 'Image Input'}
                                    </p>
                                    {input.portion && <p className="text-xs text-slate-500">{input.portion}g</p>}
                                </div>
                                <button 
                                    onClick={() => removeInput(input.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>
        </section>

        {/* Analyze Action */}
        <div className="sticky bottom-6 z-20">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-pulse">
                    {error}
                </div>
            )}
            
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl shadow-xl shadow-emerald-500/20 text-white font-bold text-lg tracking-wide transition-all transform hover:-translate-y-1 ${
                    isLoading ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30'
                }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing Bio-Data...
                    </span>
                ) : (
                    "Calculate Total API Score"
                )}
            </button>
        </div>

        {/* Results Section */}
        {result && (
            <div id="results">
                <AnalysisResultComponent result={result} />
            </div>
        )}

        <CameraModal 
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCameraCapture}
        />

      </main>
    </div>
  );
};

export default App;