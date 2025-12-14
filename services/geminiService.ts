import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { Tool, Slide, NewsArticle, TutorialSection } from "../types";

// Helper to get client instance
const getClient = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper for generating AI images to avoid code duplication
export const generateAIImage = async (prompt: string, aspectRatio: string = "16:9"): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash-latest',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio, imageSize: "1K" } }
        });
        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if(data) return `data:image/png;base64,${data}`;
    } catch(e) {
        console.warn("Image gen failed", e);
    }
    // Fallback
    return `https://picsum.photos/seed/${Math.random()}/800/400`;
}

// --- Directory Generation (Tools) ---
export const generateDirectoryTools = async (count: number = 3, category?: string): Promise<Tool[]> => {
  const ai = getClient();
  const prompt = `Use Google Search to find ${count} REAL, currently trending AI tools${category ? ` specifically for ${category}` : ''} that are popular right now.
  
  Return a JSON array of these real tools. Each tool object MUST have:
  - name (The actual name of the tool)
  - description (A concise summary, max 15 words)
  - category (Best fit: Writing, Image, Video, Audio, Coding, Business)
  - tags (3 relevant tags)
  - price (Real pricing model e.g. "Freemium", "$20/mo", "Free")
  - website (Real URL if found, otherwise #)
  - features (3 real key features)
  - useCases (2 real-world use cases)
  - pros (2 real pros based on reviews)
  - cons (1 real con based on reviews)
  - howToUse (1-sentence quick start guide)`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Search Grounding
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            price: { type: Type.STRING },
            website: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            howToUse: { type: Type.STRING },
          }
        }
      }
    }
  });

  const toolsData = JSON.parse(response.text || "[]");
  
  // Generate Real Images for each candidate in parallel
  const toolsWithImages = await Promise.all(toolsData.map(async (t: any, i: number) => {
      const imgPrompt = `Futuristic 3D icon or interface for the AI tool "${t.name}". ${t.description}. Sleek, modern, tech style.`;
      const imageUrl = await generateAIImage(imgPrompt, "16:9");
      return {
          ...t,
          id: t.id || `gen-${Date.now()}-${i}`,
          imageUrl: imageUrl
      };
  }));

  return toolsWithImages;
};

export const generateToolDetails = async (topic: string): Promise<Partial<Tool>> => {
  const ai = getClient();
  const prompt = `Research the AI tool "${topic}" using Google Search. 
  If "${topic}" is a general concept, find the best REAL tool matching it.
  
  Return a JSON object with accurate, real-world details:
  - name
  - description (compelling, 2 sentences)
  - category (one of: Writing, Image, Video, Audio, Coding, Business)
  - price (Real pricing)
  - website (Real URL)
  - tags (3-5 relevant tags)
  - features (3-5 real key features)
  - useCases (3 real-world use cases)
  - pros (3 real pros)
  - cons (2 real cons)
  - howToUse (A short step-by-step guide)`;

  // 1. Generate Text Data
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Search Grounding
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          price: { type: Type.STRING },
          website: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          howToUse: { type: Type.STRING },
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // 2. Generate Real Image
  const imgPrompt = `A futuristic, high-tech abstract representation of the AI tool "${data.name}". ${data.description}. Digital art, sleek, modern UI elements, glowing nodes.`;
  const imageUrl = await generateAIImage(imgPrompt, "16:9");

  return {
    ...data,
    imageUrl: imageUrl
  };
};

// --- News Generation (Single & Batch) ---

export const generateNewsDetails = async (topic: string): Promise<Partial<NewsArticle>> => {
    const ai = getClient();
    // Using Search Tool for Grounding
    const prompt = `Write a comprehensive, engaging news article about "${topic}".
    Use Google Search to find accurate, up-to-date details. Ensure the facts are current.
    
    Return JSON with:
    - title: Catchy headline based on real events
    - description: Short summary (2 sentences)
    - content: Full article body (approx 200 words), use markdown for formatting. Include specific dates and names found in search.
    - category: e.g. Technology, AI, Business.
    - source: The primary source found (e.g. "TechCrunch", "The Verge", or "VETORRE Reporter")
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }], // Enable Search
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    content: { type: Type.STRING },
                    category: { type: Type.STRING },
                    source: { type: Type.STRING },
                }
            }
        }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Generate Editorial Image
    const imgPrompt = `Editorial news illustration for "${data.title}". ${data.description}. Photorealistic, high quality, 4k, cinematic lighting.`;
    const imageUrl = await generateAIImage(imgPrompt, "16:9");

    return {
        ...data,
        imageUrl,
        date: new Date().toISOString()
    };
};

export const generateDirectoryNews = async (count: number = 3): Promise<NewsArticle[]> => {
    const ai = getClient();
    // Batch generation of trending topics
    const prompt = `Use Google Search to find the top ${count} trending AI news stories from the last 24 hours.
    
    Return JSON format. Each item MUST have:
    - title (Real headline)
    - description (Summary of the event)
    - content (Detailed report, ~150 words)
    - category
    - source (The publication found)
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest', // Flash is fast for batch text
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }], // Search Grounding
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        content: { type: Type.STRING },
                        category: { type: Type.STRING },
                        source: { type: Type.STRING },
                    }
                }
            }
        }
    });

    const newsData = JSON.parse(response.text || "[]");

    // Generate Real Images for each news item in parallel
    const newsWithImages = await Promise.all(newsData.map(async (n: any, i: number) => {
        const imgPrompt = `News illustration for "${n.title}". ${n.description}. Professional photography style.`;
        const imageUrl = await generateAIImage(imgPrompt, "16:9");
        return {
            ...n,
            id: `news-gen-${Date.now()}-${i}`,
            imageUrl: imageUrl,
            date: new Date().toISOString()
        };
    }));

    return newsWithImages;
};

export const extractNewsFromRSSItem = async (title: string, description: string): Promise<Partial<NewsArticle>> => {
  const ai = getClient();
  const prompt = `
    Write a detailed news article based on this topic: "${title} - ${description}".
    Use Google Search to find the latest details and expand on it with real facts.
    
    Return a JSON object with:
    - title: A clean, engaging headline
    - description: A short summary (max 2 sentences)
    - content: A longer, well-formatted blog post body (approx 200 words).
    - category: The best fitting category.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Use Search for grounding RSS items too!
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING },
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Generate Image
  const imgPrompt = `Editorial news illustration for "${data.title}". ${data.description}. Modern, high quality.`;
  const imageUrl = await generateAIImage(imgPrompt, "16:9");

  return {
      ...data,
      imageUrl
  };
}

// --- Intelligent Search ---
export const intelligentSearch = async (query: string, tools: Tool[], news: NewsArticle[]): Promise<{ toolIds: string[], newsIds: string[] }> => {
    const ai = getClient();

    // Prepare lightweight context data (minimize tokens)
    const simplifiedTools = tools.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        tags: t.tags
    }));

    const simplifiedNews = news.map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        category: n.category
    }));

    const prompt = `
      You are an intelligent search engine for an AI tool directory.
      User Query: "${query}"
      
      Analyze the user's intent. Do they want a tool for a specific task? Are they looking for news about a topic? Or both?
      
      Here is the available data:
      TOOLS: ${JSON.stringify(simplifiedTools)}
      NEWS: ${JSON.stringify(simplifiedNews)}
      
      Return a JSON object with two arrays containing the IDs of relevant items.
      Be permissive but prioritize relevance. If the query implies "coding", include coding tools.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash-latest',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        toolIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        newsIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        return JSON.parse(response.text || '{"toolIds": [], "newsIds": []}');
    } catch (e) {
        console.error("AI Search Failed", e);
        return { toolIds: [], newsIds: [] };
    }
};

// --- Smart Chat (Search & Maps) ---
export const sendChatMessage = async (history: {role: string, parts: any[]}[], message: string, useSearch: boolean, useMaps: boolean) => {
  const ai = getClient();
  const tools: any[] = [];
  if (useSearch) tools.push({ googleSearch: {} });
  if (useMaps) tools.push({ googleMaps: {} });

  // Use Gemini 3 Pro for complex reasoning, or Flash if strict grounding needed (Flash is often faster/better for simple grounding)
  // Using stable Gemini models
  const model = (useSearch || useMaps) ? 'gemini-1.5-flash-latest' : 'gemini-1.5-pro-latest';

  const response = await ai.models.generateContent({
    model: model,
    contents: message, // Simplified for this demo, usually we pass full history if chat mode
    config: {
      tools: tools.length > 0 ? tools : undefined,
    }
  });

  return response;
};

// --- Veo Video Generation ---
export const generateVideo = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getClient();
  
  // Construct input
  let contents: any = { prompt }; // Prompt is handled slightly differently in generateVideos args, strictly speaking param is `prompt`
  
  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: aspectRatio
  };

  // If image provided
  let imageInput = undefined;
  if (imageBase64) {
    imageInput = {
      imageBytes: imageBase64,
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos({
    model: 'gemini-1.5-flash-latest',
    prompt: prompt,
    image: imageInput,
    config: config
  });

  return operation;
};

export const pollVideoOperation = async (operation: any) => {
  const ai = getClient();
  return await ai.operations.getVideosOperation({ operation: operation });
};

// --- Image Studio (Gen & Edit) ---
export const generateImage = async (prompt: string, aspectRatio: string, size: string) => {
  const ai = getClient();
  // Using generateContent for nano banana series per guidelines for image generation
  // Model: gemini-3-pro-image-preview for high quality with size control
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: size
      }
    }
  });
  return response;
};

export const editImage = async (prompt: string, imageBase64: string) => {
  const ai = getClient();
  // Using stable Gemini model for image editing
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: imageBase64 } },
        { text: prompt }
      ]
    }
  });
  return response;
};

// --- Audio Transcription & TTS ---
export const transcribeAudio = async (audioBase64: string) => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: {
            parts: [
                { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }, // Assuming wav from recorder
                { text: "Transcribe this audio exactly." }
            ]
        }
    });
    return response.text;
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: { parts: [{ text }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
            }
        }
    });
    return response;
}

export const generateConversationScript = async (topic: string, speaker1: string, speaker2: string) => {
    const ai = getClient();
    const prompt = `Write a short, engaging podcast dialogue (approx 150 words) between two hosts, ${speaker1} and ${speaker2}, discussing the topic: "${topic}". 
    Format it exactly like this:
    ${speaker1}: [Text]
    ${speaker2}: [Text]
    Keep it natural, conversational, and enthusiastic.`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt
    });
    return response.text;
};

export const generateMultiSpeakerSpeech = async (script: string, speaker1Config: {name: string, voice: string}, speaker2Config: {name: string, voice: string}) => {
    const ai = getClient();
    // Prepend instruction to ensure model understands it's a TTS task for specific speakers
    const prompt = `TTS the following conversation:\n${script}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        {
                            speaker: speaker1Config.name,
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker1Config.voice } }
                        },
                        {
                            speaker: speaker2Config.name,
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker2Config.voice } }
                        }
                    ]
                }
            }
        }
    });
    return response;
};

// --- Admin & Tool Insights ---

export const extractToolFromRSSItem = async (title: string, description: string): Promise<Partial<Tool>> => {
  const ai = getClient();
  const prompt = `
    Analyze this RSS feed item and extract structured data to create an AI Tool listing.
    Title: ${title}
    Description: ${description}
    Use Google Search to confirm details if the description is sparse.
    
    Return a JSON object with:
    - name: A catchy tool name based on the title
    - description: A concise 1-sentence description
    - category: The best fitting category (e.g., Writing, Image, Video, Coding, Analytics)
    - tags: A list of 3 relevant tags
    - price: Estimated price model (e.g. "Free", "Paid", "Freemium") - guess based on context or default to "Waitlist"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            price: { type: Type.STRING },
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export const generateToolSlides = async (tool: Tool): Promise<Slide[]> => {
    const ai = getClient();
    const prompt = `Create a 4-slide presentation about the AI tool "${tool.name}". 
    Description: ${tool.description}. 
    Category: ${tool.category}.
    
    Return JSON array of slides.`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
}

export const generateToolTutorial = async (tool: Tool): Promise<TutorialSection[]> => {
    const ai = getClient();
    const prompt = `
        You are an expert AI instructor. Create a visual mini-course for the AI tool "${tool.name}".
        Target audience: Beginners.
        
        Return a JSON list of 3 educational modules.
        Each module must have:
        - title: Module Title (e.g. "Step 1: Setup")
        - content: 2-3 sentences explaining the concept simply.
        - imageDescription: A detailed visual description to generate an educational illustration for this specific module (e.g. "A minimalist diagram showing data flow...").
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        imageDescription: { type: Type.STRING }
                    }
                }
            }
        }
    });

    const modules = JSON.parse(response.text || "[]");
    
    // Generate images in parallel for the course
    const modulesWithImages = await Promise.all(modules.map(async (mod: any) => {
        const imageUrl = await generateAIImage(`Educational illustration: ${mod.imageDescription}`, "16:9");
        return {
            title: mod.title,
            content: mod.content,
            imageUrl
        };
    }));

    return modulesWithImages;
}

export const generatePodcastScript = async (tool: Tool): Promise<string> => {
    const ai = getClient();
    const prompt = `Write a very short, enthusiastic podcast intro script (approx 50 words) introducing the AI tool "${tool.name}". 
    The host is excited about its features: ${tool.description}.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt
    });
    return response.text || "";
}

// --- Analytics ---

export const analyzeToolTrends = async (tools: Tool[]): Promise<string> => {
  const ai = getClient();
  const toolList = tools.map(t => `- ${t.name} (${t.category}): ${t.description}`).join('\n');
  const prompt = `
    You are an expert market analyst for AI technologies.
    Analyze the following list of AI tools currently in our directory:
    
    ${toolList}
    
    Please provide a concise but insightful report covering:
    1. **Current Trend**: What is the dominant theme?
    2. **Market Gap**: What kind of tool is missing or underrepresented?
    3. **Prediction**: What should be the next big tool we build?
    
    Format the response in Markdown with clear headings.
  `;

  // Use Gemini 3 Pro with Thinking Mode for complex analysis
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro-latest',
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 32768 } // Max budget for deep reasoning
    }
  });
  
  return response.text || "Unable to generate analysis.";
}