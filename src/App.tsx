/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Loader2, RefreshCcw, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { runExtraction, runExaniSimulator, runDialecticChat, GdeLINEZResult, ExaniResult } from './services/geminiService';

type AppMode = 'idle' | 'extraction' | 'exani' | 'exani-result';

export default function App() {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>('idle');
  const [extractionResult, setExtractionResult] = useState<GdeLINEZResult | null>(null);
  const [exaniResult, setExaniResult] = useState<ExaniResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<('a' | 'b' | 'c')[]>([]);
  const [scenarioAnswer, setScenarioAnswer] = useState<'a' | 'b' | 'c' | null>(null);
  const [showScenarioAudit, setShowScenarioAudit] = useState(false);
  const [loadingType, setLoadingType] = useState<'none' | 'extraction' | 'exani'>('none');
  const [showExaniFeedback, setShowExaniFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Dialectic Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, text: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const history = newMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      const response = await runDialecticChat(userMessage, history);
      setChatMessages(prev => [...prev, { role: 'model' as const, text: response }]);
    } catch (err) {
      setError('CONEXIÓN DIALÉCTICA INTERRUMPIDA');
    } finally {
      setChatLoading(false);
    }
  };

  const handleExtraction = async (overrideTheme?: string) => {
    const targetTheme = overrideTheme || theme;
    if (!targetTheme.trim()) return;
    
    setLoading(true);
    setLoadingType('extraction');
    setError(null);
    setScenarioAnswer(null);
    setShowScenarioAudit(false);

    if (overrideTheme) {
      setTheme(overrideTheme);
    }

    try {
      const data = await runExtraction(targetTheme);
      setExtractionResult(data);
      setMode('extraction');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('FALLO EN PROTOCOLO DE EXTRACCIÓN');
      setMode('idle');
    } finally {
      setLoading(false);
      setLoadingType('none');
    }
  };

  const handleExaniStart = async () => {
    if (!theme.trim()) return;
    setLoading(true);
    setLoadingType('exani');
    setError(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowExaniFeedback(false);
    try {
      const data = await runExaniSimulator(theme);
      setExaniResult(data);
      setMode('exani');
    } catch (err) {
      setError('FALLO EN NÚCLEO EXANI');
      setMode('idle');
    } finally {
      setLoading(false);
      setLoadingType('none');
    }
  };

  const handleAnswer = (answer: 'a' | 'b' | 'c') => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    setShowExaniFeedback(true);
  };

  const nextExaniQuestion = () => {
    setShowExaniFeedback(false);
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setMode('exani-result');
    }
  };

  const submitScenarioAnswer = () => {
    if (scenarioAnswer) {
      setShowScenarioAudit(true);
    }
  };

  const resetApp = () => {
    setTheme('');
    setExtractionResult(null);
    setExaniResult(null);
    setMode('idle');
    setError(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScenarioAnswer(null);
    setShowScenarioAudit(false);
    setShowExaniFeedback(false);
    setChatMessages([]);
  };

  const calculateExaniScore = () => {
    if (!exaniResult) return 0;
    return userAnswers.reduce((score, ans, idx) => {
      return score + (ans === exaniResult.questions[idx].correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start py-20 px-6">
      <div className="flow-bg" />
      <div className="breathing-glow" />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl text-center mb-16 space-y-2"
      >
        <div className="mb-6 flex justify-center">
          {!logoError ? (
            <img 
              src="./Logo - GdeLINEZ.png" 
              alt="GdeLINEZ Logo" 
              className="h-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-700" 
              referrerPolicy="no-referrer" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-16 w-16 rounded-full border-2 border-white/20 flex items-center justify-center text-white/40 font-bold text-xl tracking-tighter bg-black/40">
              GP
            </div>
          )}
        </div>
        <h1 className="text-sm font-semibold tracking-[0.4em] text-white/40 uppercase">
          GdeLINEZ
        </h1>
        <div className="h-[1px] w-12 bg-white/20 mx-auto" />
        <div className="text-[10px] text-white/20 font-mono mt-2 tracking-widest uppercase">Black Room</div>
      </motion.header>

      <main className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.section 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-12"
            >
              <div className="w-full max-w-2xl text-center">
                <input
                  id="theme-input"
                  type="text"
                  className="prot-input text-center"
                  placeholder="DEFINA OBJETIVO"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
                <button
                  onClick={() => handleExtraction()}
                  disabled={loading || !theme.trim()}
                  className="prot-button flex-1"
                >
                  {loadingType === 'extraction' ? (
                    <Loader2 className="animate-spin text-black mx-auto" size={24} />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      EJECUTAR EXTRACCIÓN
                    </div>
                  )}
                </button>
                <button
                  onClick={handleExaniStart}
                  disabled={loading || !theme.trim()}
                  className="prot-button flex-1 bg-transparent border border-white/20 text-white hover:bg-white/5"
                >
                  {loadingType === 'exani' ? (
                    <Loader2 className="animate-spin text-white mx-auto" size={24} />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      EXAMEN RÁPIDO
                    </div>
                  )}
                </button>
              </div>

              {error && (
                <div className="text-red-400 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                  <AlertCircle size={14} /> [ERROR] {error}
                </div>
              )}
            </motion.section>
          )}

          {mode === 'extraction' && (
            <motion.section key="extraction-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="w-full text-center mb-8">
                <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
                  [ OBJETIVO EN CURSO: "{theme}" ]
                </span>
              </div>
              {loading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-white/40" size={48} />
                  <span className="text-[10px] tracking-[0.5em] text-white/20 uppercase animate-pulse">DISECCIONANDO ESTRUCTURA MACRO...</span>
                </div>
              ) : extractionResult && (
                <div className="space-y-12">
                  {/* 00_ARQUITECTURA MACRO (MAPA 80/20) */}
                  <div className="prot-card md:col-span-2 border-white/10 bg-white/[0.01] overflow-x-auto custom-scrollbar min-h-[600px] cursor-grab active:cursor-grabbing">
                    <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-12">00_ARQUITECTURA MACRO (MAPA 80/20)</span>
                    
                    <div className="flex items-center min-w-max p-8 py-16">
                      {/* TRONCO CENTRAL */}
                      <div className="relative flex-shrink-0 mr-32">
                        <div className="px-10 py-6 border-2 border-white/40 bg-black text-white font-bold tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(255,255,255,0.05)] z-10 relative">
                          {extractionResult.macroArchitecture.theme}
                        </div>
                        {/* Connection lines start here */}
                        <svg className="absolute top-1/2 left-full w-32 h-[500px] -translate-y-1/2 pointer-events-none" style={{ overflow: 'visible' }}>
                          {extractionResult.macroArchitecture.branches.map((_, i) => {
                            const total = extractionResult.macroArchitecture.branches.length;
                            const yPos = ((i - (total - 1) / 2) * 120);
                            return (
                              <path
                                key={i}
                                d={`M 0 250 C 60 250, 60 ${250 + yPos}, 128 ${250 + yPos}`}
                                fill="none"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                        </svg>
                      </div>

                      {/* RAMAS PRINCIPALES (LADRILLOS) */}
                      <div className="flex flex-col gap-[60px]">
                        {extractionResult.macroArchitecture.branches.map((branch, bIdx) => (
                          <div key={bIdx} className="flex items-center relative">
                            {/* Brick Node */}
                            <div className="w-64 p-5 prot-card border-white/20 bg-white/[0.03] z-10 hover:border-blue-500/40 transition-all group shadow-xl">
                              <div className="text-[9px] text-white/20 font-mono mb-2 tracking-tighter uppercase">LADRILLO_VITAL_0{bIdx + 1}</div>
                              <div className="text-sm font-bold uppercase tracking-wide leading-tight group-hover:text-blue-200 transition-colors">
                                {branch.brick}
                              </div>
                            </div>

                            {/* Connection to concepts */}
                            <svg className="absolute top-1/2 left-full w-20 h-40 -translate-y-1/2 pointer-events-none" style={{ overflow: 'visible' }}>
                              {branch.concepts.map((_, i) => {
                                const cTotal = branch.concepts.length;
                                const cYPos = ((i - (cTotal - 1) / 2) * 80);
                                return (
                                  <path
                                    key={i}
                                    d={`M 0 80 C 40 80, 40 ${80 + cYPos}, 80 ${80 + cYPos}`}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="1"
                                  />
                                );
                              })}
                            </svg>

                            {/* SUB-RAMAS (CONCEPTOS) */}
                            <div className="flex flex-col gap-6 ml-20">
                              {branch.concepts.map((concept, cIdx) => (
                                <div key={cIdx} className="w-72 p-4 bg-white/[0.01] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.03] group/concept">
                                  <div className="text-[10px] font-mono text-white/40 mb-2 uppercase tracking-tighter transition-colors group-hover/concept:text-blue-400/60">
                                    {concept.name}
                                  </div>
                                  <div className="text-[10px] italic leading-relaxed text-white/60 font-mono tracking-tight bg-black/40 p-2 border-l border-white/10">
                                    <span className="text-white/20 mr-2">[HOJA]:</span>
                                    <span dangerouslySetInnerHTML={{ __html: concept.example }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 01_DECODIFICADOR TÁCTICO (SÍNTESIS DE EXTRACCIÓN) */}
                  <div className="prot-card md:col-span-2 border-blue-500/10 bg-blue-500/[0.01]">
                    <span className="text-[10px] tracking-widest text-blue-400/30 uppercase block mb-8">01_DECODIFICADOR TÁCTICO (SÍNTESIS DE EXTRACCIÓN)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">[ LÓGICA_PARETO ]</span>
                        <div 
                          className="text-sm leading-relaxed text-white/70 italic border-l border-white/10 pl-6"
                          dangerouslySetInnerHTML={{ __html: extractionResult.tacticalDecoder.paretoLogic }}
                        />
                      </div>
                      <div className="space-y-4">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">[ VECTOR_DE_APLICACIÓN ]</span>
                        <div 
                          className="text-sm leading-relaxed text-white/70 italic border-l border-white/10 pl-6"
                          dangerouslySetInnerHTML={{ __html: extractionResult.tacticalDecoder.applicationVector }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 02_ENSAMBLAJE TÁCTICO (SIMULACIÓN EN MOVIMIENTO) */}
                  <div className="prot-card md:col-span-2 border-white/5 bg-white/[0.01]">
                    <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-8">02_ENSAMBLAJE TÁCTICO (SIMULACIÓN EN MOVIMIENTO)</span>
                    <div className="p-8 bg-black/40 border-l-4 border-white/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <RefreshCcw size={120} className="text-white animate-[spin_20s_linear_infinite]" />
                      </div>
                      <p 
                        className="text-lg md:text-xl leading-[1.8] text-white/90 font-serif italic relative z-10"
                        dangerouslySetInnerHTML={{ __html: extractionResult.tacticalAssembly }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="prot-card">
                      <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-6">01_Primeros Principios</span>
                      <div 
                        className="text-lg leading-relaxed font-light text-white/80"
                        dangerouslySetInnerHTML={{ __html: extractionResult.deconstruction.firstPrinciples }}
                      />
                    </div>
                    <div className="prot-card">
                      <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-6">02_Ladrillos Pareto (Variables)</span>
                      <div className="space-y-3">
                        {extractionResult.deconstruction.pareto8020.map((brick, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-white/80">
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: brick }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="prot-card border-blue-500/20 bg-blue-500/[0.02] md:col-span-2">
                      <span className="text-[10px] tracking-widest text-blue-400/50 uppercase block mb-6">02.1_Método Feynman (Doble Columna)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">[ LA_ANALOGÍA ]</span>
                          <div 
                            className="text-lg leading-relaxed text-white/90 font-sans italic border-l-2 border-blue-500/20 pl-6"
                            dangerouslySetInnerHTML={{ __html: extractionResult.feynmanExplanation.analogy }}
                          />
                        </div>
                        <div className="space-y-4">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">[ TRADUCCIÓN_LADRILLOS ]</span>
                          <div className="space-y-3">
                            {extractionResult.feynmanExplanation.mapping.map((map, idx) => (
                              <div key={idx} className="flex flex-col border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono text-white/30 uppercase" dangerouslySetInnerHTML={{ __html: map.brick }} />
                                <span className="text-sm text-blue-300 font-medium" dangerouslySetInnerHTML={{ __html: map.analog }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="prot-card border-white/20 md:col-span-2 space-y-8">
                      <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-2">03_Escenario de Rigor (Interactivo)</span>
                      <div 
                        className="italic text-xl text-white font-semibold leading-relaxed border-l-2 border-white/10 pl-6"
                        dangerouslySetInnerHTML={{ __html: extractionResult.wildScenario.situation }}
                      />
                      
                      <div className="grid grid-cols-1 gap-4 pt-4">
                        {(['a', 'b', 'c'] as const).map((opt) => (
                          <button
                            key={opt}
                            disabled={showScenarioAudit}
                            onClick={() => setScenarioAnswer(opt)}
                            className={`prot-card p-4 text-left transition-all flex items-center gap-4 ${
                              scenarioAnswer === opt ? 'bg-white/10 border-white/40' : 'bg-transparent border-white/5 hover:border-white/20'
                            } ${showScenarioAudit && extractionResult.wildScenario.correctOption === opt ? 'border-green-500/50 bg-green-500/5' : ''} ${showScenarioAudit && scenarioAnswer === opt && opt !== extractionResult.wildScenario.correctOption ? 'border-red-500/50 bg-red-500/5' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs uppercase transition-colors ${scenarioAnswer === opt ? 'bg-white text-black border-white' : 'border-white/20 text-white/40'}`}>
                              {opt}
                            </div>
                            <span className="text-sm text-white/90">{extractionResult.wildScenario.options[opt]}</span>
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {!showScenarioAudit && scenarioAnswer && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                            <button onClick={submitScenarioAnswer} className="prot-button px-12">
                              ENVIAR RESPUESTA
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {showScenarioAudit && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 border-t border-white/10 space-y-6">
                            <div className="flex items-center gap-4">
                              {scenarioAnswer === extractionResult.wildScenario.correctOption ? (
                                <div className="text-green-400 font-bold tracking-widest flex items-center gap-2">
                                  <CheckCircle2 size={16} /> ÉXITO OPERATIVO
                                </div>
                              ) : (
                                <div className="text-red-400 font-bold tracking-widest flex items-center gap-2">
                                  <AlertCircle size={16} /> FALLO COGNITIVO
                                </div>
                              )}
                            </div>
                            <div className="prot-card bg-white/[0.02] border-white/5 p-6">
                              <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-4">Auditoría Metacognitiva</span>
                              <div 
                                className="text-lg text-white/80 italic leading-relaxed font-sans"
                                dangerouslySetInnerHTML={{ __html: extractionResult.wildScenario.rationale }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="prot-card md:col-span-2">
                      <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-6">04_Anclaje Mnemotécnico (Visceral Core)</span>
                      <div className="text-sm text-white/60 mb-6 pb-2 border-b border-white/10 italic" dangerouslySetInnerHTML={{ __html: extractionResult.mentalPalace.room }} />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {extractionResult.mentalPalace.items.map((item, idx) => (
                          <div key={idx} className="mnemonic-item flex flex-col gap-2 min-h-[120px] transition-all hover:border-white/20">
                            <span className="text-[10px] text-white/20 uppercase tracking-tighter">Anclaje_{idx + 1}</span>
                            <div className="text-sm" dangerouslySetInnerHTML={{ __html: item }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="prot-card md:col-span-2 border-dashed border-white/10">
                      <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-8">05_Rutas de Expansión (La Telaraña)</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {extractionResult.expansionRoutes.map((route, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleExtraction(route.tacticalCommand)}
                            className="text-left group"
                          >
                            <div className="text-[10px] text-white/20 mb-2 font-mono group-hover:text-white/40 transition-colors">EJECUTAR_TÁCTICO_AUTOMÁTICO</div>
                            <div className="text-sm text-white/60 group-hover:text-white transition-colors duration-300 leading-relaxed">
                              {route.visibleText}
                            </div>
                            <div className="mt-4 h-[1px] w-0 group-hover:w-full bg-white/20 transition-all duration-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-8">
                    <button onClick={resetApp} className="prot-button bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white transition-all">
                      <div className="flex items-center gap-3">
                        <RefreshCcw size={16} /> NUEVA EXTRACCIÓN
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {mode === 'exani' && (
            <motion.section key="exani-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
              <div className="w-full text-center mb-4">
                <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
                  [ OBJETIVO EN CURSO: "{theme}" ]
                </span>
              </div>
              {loading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-t-2 border-white/40 rounded-full animate-spin" />
                  <span className="text-[10px] tracking-[0.5em] text-white/20 uppercase">Configurando Alta Fricción</span>
                </div>
              ) : exaniResult && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-[10px] tracking-widest text-white/30 uppercase">Pregunta {currentQuestionIndex + 1} / 10</span>
                    <span className="text-[10px] tracking-widest text-white/30 uppercase">Evaluación Crítica</span>
                  </div>
                  
                  <div className="prot-card bg-[#1a1a1a]">
                    <h3 className="text-xl text-white font-medium leading-relaxed">
                      {exaniResult.questions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(['a', 'b', 'c'] as const).map((opt) => (
                      <button
                        key={opt}
                        disabled={showExaniFeedback}
                        onClick={() => handleAnswer(opt)}
                        className={`prot-card p-5 text-left border-white/10 group flex items-center gap-4 transition-all ${
                          showExaniFeedback 
                            ? (opt === exaniResult.questions[currentQuestionIndex].correctAnswer 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : (userAnswers[currentQuestionIndex] === opt ? 'bg-red-500/10 border-red-500/30' : 'opacity-40 hover:bg-transparent'))
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs uppercase transition-colors ${
                          showExaniFeedback && opt === exaniResult.questions[currentQuestionIndex].correctAnswer 
                            ? 'bg-white text-black border-white' 
                            : 'border-white/20 text-white/40'
                        }`}>
                          {opt}
                        </div>
                        <span className="text-white/80">{exaniResult.questions[currentQuestionIndex].options[opt]}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showExaniFeedback && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="prot-card bg-white/[0.02] border-white/10 p-6">
                          <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-2">Retroinforme de Impacto</span>
                          <p className="text-white/90 font-medium">
                            {exaniResult.questions[currentQuestionIndex].impactFeedback}
                          </p>
                        </div>
                        <button onClick={nextExaniQuestion} className="prot-button w-full">
                          CONTINUAR EVALUACIÓN
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>
          )}

          {mode === 'exani-result' && exaniResult && (
            <motion.section key="exani-result-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-12">
              <div className="w-full text-center">
                <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
                  [ OBJETIVO FINALIZADO: "{theme}" ]
                </span>
              </div>
              <div className="text-center space-y-4">
                <BarChart3 size={48} className="mx-auto text-white/20" />
                <h2 className="text-sm font-semibold tracking-[0.4em] text-white/40 uppercase">Dashboard de Rendimiento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="prot-card flex flex-col items-center justify-center text-center py-12">
                  <span className="text-[10px] tracking-widest text-white/30 uppercase mb-4">Calificación</span>
                  <div className="text-6xl font-light text-white mb-2">
                    {calculateExaniScore()}<span className="text-2xl text-white/20">/10</span>
                  </div>
                  <div className="text-[10px] text-white/40 uppercase">Nivel de Dominio: {calculateExaniScore() >= 8 ? 'Experto' : calculateExaniScore() >= 5 ? 'Funcional' : 'Crítico'}</div>
                </div>
                
                <div className="prot-card md:col-span-2 space-y-4">
                  <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-2">Análisis Metacognitivo</span>
                  <div 
                    className="text-lg leading-relaxed text-white/80 italic max-w-none"
                    dangerouslySetInnerHTML={{ __html: exaniResult.metacognitiveFeedback }}
                  />
                  <div className="h-[1px] w-full bg-white/10 mt-4" />
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-green-400 capitalize">
                      <CheckCircle2 size={14} /> Correctas: {calculateExaniScore()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-400 capitalize">
                      <AlertCircle size={14} /> Fallos: {10 - calculateExaniScore()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="prot-card border-dashed border-white/10">
                <span className="text-[10px] tracking-widest text-white/30 uppercase block mb-8">06_[ VECTORES DE CORRECCIÓN ]</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {exaniResult.remedialTactics.map((tactic, idx) => (
                    <div key={idx} className="space-y-4 group">
                      <div className="text-[10px] text-white/20 font-mono tracking-tighter uppercase transition-colors group-hover:text-white/40">
                        {tactic.label}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed italic">
                        {tactic.target}
                      </p>
                      <button 
                        onClick={() => handleExtraction(tactic.target)}
                        className="text-[10px] text-blue-400/50 hover:text-blue-400 font-mono uppercase tracking-widest underline underline-offset-4"
                      >
                        INYECTAR OBJETIVO
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={resetApp} className="prot-button">
                  <div className="flex items-center gap-3">
                    FINALIZAR SESIÓN
                  </div>
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        
        {/* Cámara de Ecos */}
        {(mode === 'extraction' || mode === 'exani-result') && !loading && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-24 pt-24 border-t border-white/10"
          >
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-semibold">CÁMARA DE ECOS [LA DIALÉCTICA]</h2>
                <div className="h-[1px] w-8 bg-white/10 mx-auto" />
                <p className="text-[10px] text-white/10 font-mono uppercase tracking-widest italic">Interrogación Socrática de Grado Superior</p>
              </div>

              <div className="prot-card min-h-[300px] flex flex-col gap-6 bg-black/40 border-white/5 p-8">
                <div className="flex-1 space-y-6 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center opacity-20 italic text-sm font-light">
                      La cámara está en silencio. <br/> Desafíe a la verdad para iniciar el descenso.
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[9px] font-mono text-white/20 uppercase mb-2">
                          {msg.role === 'user' ? '[ SUJETO_DE_PRUEBA ]' : '[ ENTIDAD_SOCRÁTICA ]'}
                        </span>
                        <div 
                          className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-white/5 border-r-2 border-white/20 text-white/60' 
                              : 'bg-blue-500/[0.03] border-l-2 border-blue-500/20 text-white/90 italic'
                          }`}
                          dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" />
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest animate-pulse">Procesando respuesta socrática...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="relative mt-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="INTRODUZCA SU PROVOCACIÓN O DUDA..."
                    className="prot-input !text-left !px-6 !py-4 pr-16 text-sm"
                    disabled={chatLoading}
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </form>
              </div>
              
              <div className="text-center">
                <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">
                  EL CONOCIMIENTO ES SÓLO LA SOMBRA DE LA INTELIGENCIA
                </span>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="mt-auto pt-20 text-[10px] font-mono text-white/10 uppercase tracking-[0.5em]">
        GdeLINEZ // BLACK_ROOM // FLOW_{mode.toUpperCase()}
      </footer>
    </div>
  );
}

