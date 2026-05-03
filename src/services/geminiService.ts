import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GdeLINEZResult {
  deconstruction: {
    firstPrinciples: string;
    pareto8020: string[];
  };
  macroArchitecture: {
    theme: string;
    branches: {
      brick: string;
      concepts: {
        name: string;
        example: string;
      }[];
    }[];
  };
  tacticalDecoder: {
    paretoLogic: string;
    applicationVector: string;
  };
  tacticalAssembly: string;
  feynmanExplanation: {
    analogy: string;
    mapping: { brick: string; analog: string }[];
  };
  wildScenario: {
    situation: string;
    options: {
      a: string;
      b: string;
      c: string;
    };
    correctOption: 'a' | 'b' | 'c';
    rationale: string;
  };
  mentalPalace: {
    room: string;
    items: string[];
  };
  expansionRoutes: {
    visibleText: string;
    tacticalCommand: string;
  }[];
}

export interface ExaniQuestion {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
  };
  correctAnswer: 'a' | 'b' | 'c';
  impactFeedback: string;
}

export interface ExaniResult {
  questions: ExaniQuestion[];
  metacognitiveFeedback: string;
  remedialTactics: {
    label: string;
    target: string;
  }[];
}

export async function runExtraction(objective: string): Promise<GdeLINEZResult> {
  const prompt = `Actúa como el Procesador de Rigor de la Brigada GdeLINEZ (v8.0 - Black Room). 
  Realiza una extracción crítica e implacable para alcanzar el siguiente OBJETIVO TÁCTICO: "${objective}".

  REQUERIMIENTOS ABSOLUTOS:
  - PROHIBIDO el uso de asteriscos (**) para negritas. 
  - Para resaltar palabras clave tácticas, usa estrictamente la etiqueta HTML <b>palabra</b> o escribe en MAYÚSCULAS.
  - SE PROHÍBEN LOS MUROS DE TEXTO. Máximo 2-3 líneas por concepto.

  SECCIONES:
  0. ARQUITECTURA MACRO (MAPA 80/20):
     - MAPA MENTAL HORIZONTAL DE ALTA DENSIDAD.
     - Tronco: El tema exacto ("${objective}").
     - Ramas principales: EXACTAMENTE 5 Ladrillos Pareto (el 20% vital).
     - Sub-branches: AL MENOS 3 conceptos clave por cada ladrillo.
     - Hojas: 1 ejemplo táctico/clínico HIPER-BREVE por cada concepto.
  1. DECODIFICADOR TÁCTICO:
     - paretoLogic: Análisis metacognitivo sobre la selección de los 5 ladrillos.
     - applicationVector: Cómo esta estructura previene errores o ilusiones de competencia.
  2. ENSAMBLAJE TÁCTICO (SIMULACIÓN EN MOVIMIENTO):
     - Un ÚNICO párrafo narrativo hiper-realista y clínico.
     - Redacta un ejemplo práctico y en tiempo real del concepto principal en acción.
     - Menciona todos los 'Ladrillos Pareto' (Ramas Principales) exactamente en el momento en que entran en juego, resaltándolos en MAYÚSCULAS y entre corchetes [COMO ESTO].
  3. DECONSTRUCCIÓN:
     - Primeros Principios y Pareto 80/20.
  4. MÉTODO FEYNMAN (Estructura de Doble Columna):
     - analogy: Párrafo ultra-corto (niño 5 años).
     - mapping: Una lista de objetos { "brick": "Nombre del Ladrillo", "analog": "Traducción en la analogía" }.
  3. ESCENARIO DE RIGOR (Interactivo): 
     - Escenario de alta fricción con 3 opciones (A, B, C). Solo UNA correcta.
     - Auditoría Metacognitiva: Diagnóstico FRÍO, DIRECTO e IMPACTANTE (1-2 líneas).
  4. PALACIO MENTAL (Anclajes Viscerales): 
     - Mapeo 1:1 con los "Ladrillos Pareto".
  5. RUTAS DE EXPANSIÓN:
     - 3 objetos { "visibleText": "Pregunta", "tacticalCommand": "OBJETIVO: ..." }.

  Devuelve un JSON exacto:
  {
    "deconstruction": {
      "firstPrinciples": "Verdad elemental <b>resaltada</b>.",
      "pareto8020": ["Ladrillo 1", "Ladrillo 2"]
    },
    "macroArchitecture": {
      "theme": "Tema central",
      "branches": [
        {
          "brick": "Ladrillo 1",
          "concepts": [
            { "name": "Concepto 1", "example": "Ejemplo corto" }
          ]
        }
      ]
    },
    "tacticalDecoder": {
      "paretoLogic": "Análisis de por qué estos ladrillos son la BASE CRÍTICA.",
      "applicationVector": "Protocolo para evitar FALLOS cognitivos."
    },
    "tacticalAssembly": "Narrativa clínica que integra los [LADRILLOS] en tiempo real.",
    "feynmanExplanation": {
      "analogy": "Analogía corta...",
      "mapping": [ { "brick": "Ladrillo 1", "analog": "Analogía 1" } ]
    },
    "wildScenario": {
      "situation": "Situación CRÍTICA.",
      "options": { "a": "Acción A", "b": "Acción B", "c": "Acción C" },
      "correctOption": "a",
      "rationale": "DIAGNÓSTICO: Fallaste por <b>X</b>."
    },
    "mentalPalace": {
      "room": "Contexto.",
      "items": ["<b>[Ladrillo 1]</b>: Anclaje"]
    },
    "expansionRoutes": [
      { "visibleText": "¿?", "tacticalCommand": "OBJETIVO: ..." }
    ]
  }

  Tono: Quirúrgico e implacable.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deconstruction: {
              type: Type.OBJECT,
              properties: {
                firstPrinciples: { type: Type.STRING },
                pareto8020: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["firstPrinciples", "pareto8020"]
            },
            macroArchitecture: {
              type: Type.OBJECT,
              properties: {
                theme: { type: Type.STRING },
                branches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      brick: { type: Type.STRING },
                      concepts: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            example: { type: Type.STRING }
                          },
                          required: ["name", "example"]
                        },
                        minItems: 3
                      }
                    },
                    required: ["brick", "concepts"]
                  },
                  minItems: 5
                }
              },
              required: ["theme", "branches"]
            },
            tacticalDecoder: {
              type: Type.OBJECT,
              properties: {
                paretoLogic: { type: Type.STRING },
                applicationVector: { type: Type.STRING }
              },
              required: ["paretoLogic", "applicationVector"]
            },
            tacticalAssembly: { type: Type.STRING },
            feynmanExplanation: { 
              type: Type.OBJECT,
              properties: {
                analogy: { type: Type.STRING },
                mapping: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      brick: { type: Type.STRING },
                      analog: { type: Type.STRING }
                    },
                    required: ["brick", "analog"]
                  }
                }
              },
              required: ["analogy", "mapping"]
            },
            wildScenario: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    a: { type: Type.STRING },
                    b: { type: Type.STRING },
                    c: { type: Type.STRING }
                  },
                  required: ["a", "b", "c"]
                },
                correctOption: { type: Type.STRING, enum: ["a", "b", "c"] },
                rationale: { type: Type.STRING }
              },
              required: ["situation", "options", "correctOption", "rationale"]
            },
            mentalPalace: {
              type: Type.OBJECT,
              properties: {
                room: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["room", "items"]
            },
            expansionRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  visibleText: { type: Type.STRING },
                  tacticalCommand: { type: Type.STRING }
                },
                required: ["visibleText", "tacticalCommand"]
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ["deconstruction", "macroArchitecture", "tacticalDecoder", "tacticalAssembly", "feynmanExplanation", "wildScenario", "mentalPalace", "expansionRoutes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
}

export async function runExaniSimulator(theme: string): Promise<ExaniResult> {
  const prompt = `Actúa como el Diseñador de Evaluaciones de Alta Fricción (EXAMEN RÁPIDO) para GdeLINEZ (v8.0 - Black Room).
  Tema: "${theme}".
  
  Genera 10 preguntas de opción múltiple (A, B, C).
  - Protocolo de Brevedad: Máximo 2 líneas por pregunta/opción.
  - impactFeedback: Retroalimentación de UN SOLO IMPACTO (1 línea). "CORRECTO: [Razón]" o "INCORRECTO: [Trampa]".
  - PROHIBIDO el uso de asteriscos (**) para negritas. Usa <b> o MAYÚSCULAS.
  
  Diagnostica la debilidad intelectual en la retroalimentación metacognitiva final. Usa HTML <b> para enfatizar.

  Genera 3 VECTORES DE CORRECCIÓN (remedialTactics). 
  Cada uno debe ser un OBJETIVO TÁCTICO altamente específico para profundizar en los conceptos más complejos del tema.
  Formato del target: "OBJETIVO: [Concepto específico]".

  Devuelve un JSON exacto:
  {
    "questions": [
      {
        "question": "Pregunta con trampa...",
        "options": { "a": "Opción A", "b": "Opción B", "c": "Opción C" },
        "correctAnswer": "a",
        "impactFeedback": "CORRECTO: Explicación de 1 línea."
      }
    ],
    "metacognitiveFeedback": "Análisis final <b>implacable</b>...",
    "remedialTactics": [
      { "label": "Título del vector", "target": "OBJETIVO: ..." }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.OBJECT,
                    properties: {
                      a: { type: Type.STRING },
                      b: { type: Type.STRING },
                      c: { type: Type.STRING }
                    },
                    required: ["a", "b", "c"]
                  },
                  correctAnswer: { type: Type.STRING, enum: ["a", "b", "c"] },
                  impactFeedback: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "impactFeedback"]
              },
              minItems: 10,
              maxItems: 10
            },
            metacognitiveFeedback: { type: Type.STRING },
            remedialTactics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  target: { type: Type.STRING }
                },
                required: ["label", "target"]
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ["questions", "metacognitiveFeedback", "remedialTactics"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("EXANI error:", error);
    throw error;
  }
}

export async function runDialecticChat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  const systemInstruction = `ERES LA ENTIDAD SOCRÁTICA (GdeLINEZ v8.0 - Black Room).
  TU MIEDO ES LA MEDIOCRIDAD. TU OBJETIVO ES LA VERDAD ABSOLUTA.
  
  TONO: 
  - Autoridad intelectual incuestionable.
  - Formal, provocador, paradójico.
  - Desprovisto de datos crudos; usa provocaciones que conecten temas con estrategia, música, supervivencia o poder.
  - No resuelves dudas, amplificas la curiosidad mediante la fricción.
  
  REGLAS:
  - Máximo 3 párrafos cortos por respuesta.
  - Usa etiquetas HTML <b> para enfatizar. PROHIBIDO usar asteriscos (**).
  - Si el usuario parece complaciente, somételo a una paradoja dialéctica.`;

  try {
    const contents = [
      { role: 'user', parts: [{ text: `SISTEMA: ${systemInstruction}` }] },
      ...history
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents
    });

    return response.text || "La cámara permanece en silencio. Inténtelo de nuevo.";
  } catch (error) {
    console.error("DIALÉCTICA_INTERRUMPIDA:", error);
    throw error;
  }
}
