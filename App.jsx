import React, { useState } from 'react';

const schedule = [
  { time: '17:00 - 18:00', task: '🧬 Bio / 🧪 Chem / ⚛️ Phys / 📐 Math Theory', type: 'theory' },
  { time: '18:00 - 19:30', task: '🍽️ Dinner & Zero Screen Time', type: 'break' },
  { time: '19:30 - 20:30', task: '📝 ESSLCE Past Paper Questions', type: 'practice' },
  { time: '20:30 - 21:15', task: '🧠 SAT Quant / Verbal & English', type: 'sat' },
  { time: '21:15 - 22:00', task: '🛌 Pack Bag & Sleep Routine', type: 'sleep' }
];

export default function App() {
  const [completedTasks, setCompletedTasks] = useState({});
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleTask = (index) => {
    setCompletedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAiAnalysis = () => {
    if (!aiInput) return;
    setIsAnalyzing(true);
    
    // This is the placeholder for the Gemini API connection.
    // When you get your free API key, it plugs in right here!
    setTimeout(() => {
      setAiResult("✅ AI Analysis Complete:\n\nChapter 1 Breakdown:\n- Core Concept: Thermodynamics (Gr 11)\n- Suggested Block: Physics Theory (Wednesday 17:00)\n- Key Formulas: Q = mcΔT");
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center pb-6 border-b border-gray-700">
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wider">🚀 ESSLCE MASTER DASHBOARD</h1>
          <p className="text-gray-400 mt-2">Grades 9-12 Natural Science Tracker | Target: 22:00 Sleep</p>
        </header>

        {/* AI Analyzer Section */}
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">🤖 AI Document Analyzer</h2>
          <p className="text-sm text-gray-400 mb-4">Paste your .txt notes here. The AI will break them down into chapters based on concept similarity.</p>
          <textarea 
            className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 mb-4"
            placeholder="Paste your Grade 11/12 text here..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          ></textarea>
          <button 
            onClick={handleAiAnalysis}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {isAnalyzing ? "Analyzing Concepts..." : "Analyze with Gemini AI"}
          </button>
          
          {aiResult && (
            <div className="mt-4 p-4 bg-gray-900 border border-purple-500 rounded-lg whitespace-pre-line text-green-300">
              {aiResult}
            </div>
          )}
        </section>

        {/* Daily Tracker Section */}
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">📅 Today's Action Plan (15:35 Onward)</h2>
          <div className="space-y-4">
            {schedule.map((slot, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  completedTasks[index] ? 'bg-green-900/30 border-green-500 opacity-75' : 'bg-gray-900 border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-cyan-300 min-w-[120px]">{slot.time}</span>
                  <span className={`text-lg ${completedTasks[index] ? 'line-through text-gray-500' : 'text-white'}`}>
                    {slot.task}
                  </span>
                </div>
                <button 
                  onClick={() => toggleTask(index)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    completedTasks[index] ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-cyan-400'
                  }`}
                >
                  {completedTasks[index] && <span className="text-white text-sm">✔️</span>}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
