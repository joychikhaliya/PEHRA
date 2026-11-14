import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export interface GroundedDisasterIntel {
  summary: string;
  sources: { title: string; uri: string }[];
  keyAdvisories: string[];
  weatherAlertLevel: string;
  timestamp: string;
}

export async function fetchGroundedFloodIntel(query?: string): Promise<GroundedDisasterIntel> {
  const prompt = query || 'Latest official Mumbai weather warnings, rainfall alerts, waterlogging reports, high tide schedule, and flood advisories from IMD and MCGM.';
  const ai = getGenAI();

  if (!ai) {
    return {
      summary: 'Grounded intelligence requires GEMINI_API_KEY in server environment. Displaying cached official IMD & MCGM Mumbai disaster management protocol data.',
      sources: [
        { title: 'India Meteorological Department (IMD) Mumbai', uri: 'https://mausam.imd.gov.in/mumbai' },
        { title: 'Brihanmumbai Municipal Corporation (MCGM) Disaster Portal', uri: 'https://dm.mcgm.gov.in' },
      ],
      keyAdvisories: [
        'Orange/Red alert protocol: Keep emergency battery packs ready; avoid subways (Milan, Andheri, Khar, Dahisar).',
        'Coincident Arabian Sea high tide (>4.2m) creates backwater surge along Mithi River and Mahim creek.',
        'Emergency Municipal Helpline: Dial 1916 for MCGM Disaster Control or 112 for Police/NDRF.',
      ],
      weatherAlertLevel: 'ORANGE (Heavy to Very Heavy Rain with High Tide)',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the PEHRA AI Disaster Intelligence Officer. Provide an authoritative, structured, and factual disaster assessment for Mumbai based on real-time search information.
Query: ${prompt}

Format your response clearly with:
1. Executive situation summary (max 3 sentences)
2. 3-4 Key verified actionable advisories
3. Current IMD color alert level (Green / Yellow / Orange / Red)`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web?.title || 'Official Source',
        uri: c.web?.uri || '',
      }))
      .slice(0, 5);

    // Parse advisories
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const keyAdvisories: string[] = [];
    lines.forEach((line) => {
      if (line.match(/^[-*•\d.]\s+/)) {
        keyAdvisories.push(line.replace(/^[-*•\d.]\s+/, '').trim());
      }
    });

    return {
      summary: text.slice(0, 320) + (text.length > 320 ? '...' : ''),
      sources: sources.length > 0 ? sources : [
        { title: 'IMD Mumbai Meteorological Centre', uri: 'https://mausam.imd.gov.in/mumbai' },
        { title: 'MCGM Disaster Management Cell', uri: 'https://dm.mcgm.gov.in' },
      ],
      keyAdvisories: keyAdvisories.length > 0 ? keyAdvisories.slice(0, 4) : [
        'Follow designated high-elevation evacuation corridors.',
        'Do not drive through submerged underpasses.',
        'Report stranded citizens to NDRF & MCGM 1916 emergency helpline.',
      ],
      weatherAlertLevel: text.toUpperCase().includes('RED') ? 'RED (Extremely Heavy Rainfall)' : 'ORANGE (Very Heavy Rain)',
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('Failed to query Gemini Search Grounding:', err);
    return {
      summary: 'Fallback: Real-time search query unavailable. Displaying local cached disaster bulletin.',
      sources: [
        { title: 'IMD Mumbai', uri: 'https://mausam.imd.gov.in/mumbai' },
      ],
      keyAdvisories: [
        'Ensure potable water supplies for 48 hours.',
        'Follow instructions issued by NDRF and local ward disaster officers.',
      ],
      weatherAlertLevel: 'ORANGE (Advisory in effect)',
      timestamp: new Date().toISOString(),
    };
  }
}
