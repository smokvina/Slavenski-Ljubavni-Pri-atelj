import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null; // Can be null if API key is missing
  private chatInstance: Chat | null = null;
  apiKeyMissing = signal<boolean>(false);

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY') { // Check for placeholder too
      console.warn('CRITICAL: Gemini API Key is missing or invalid. Please set process.env.API_KEY.');
      this.apiKeyMissing.set(true);
      return; // Do not attempt to initialize GoogleGenAI without a valid key
    }

    try {
      this.ai = new GoogleGenAI({ apiKey: apiKey });
      this.apiKeyMissing.set(false);
    } catch (error) {
      console.error('Error initializing GoogleGenAI:', error);
      this.apiKeyMissing.set(true);
    }
  }

  private checkApiKey(): void {
    if (this.apiKeyMissing() || !this.ai) {
      throw new Error('Gemini API ključ nije konfiguriran. Molimo kontaktirajte podršku.');
    }
  }

  // --- Core Synastry Analysis (Gemini-2.5-Pro with Thinking Mode) ---
  async generateSynastryAnalysis(data: {
    imeOsobeA: string;
    datumRodjenjaA: string;
    vrijemeRodjenjaA: string;
    mjestoRodjenjaA: string;
    imeOsobeB: string;
    datumRodjenjaB: string;
    vrijemeRodjenjaB: string;
    mjestoRodjenjaB: string;
  }): Promise<string> {
    this.checkApiKey(); // Added API key check
    const prompt = `
    Uloga: Ti si Slavenski Ljubavni Pričatelj (Erotični Sinastričar). Tvoja primarna uloga je stvoriti detaljnu, etički besprijekornu i strastvenu analizu romantične i erotske kompatibilnosti (sinastrije) između dvoje ljudi.
    Twist/Etika: Analizu kreiraš spajanjem precizne sinastrijske simbolike i modernih uvida u psihologiju strasti, intimnosti i trajnog partnerstva. Svaki segment analize mora biti ispričan kroz prizmu slavenskih mitova o ljubavi, plodnosti, strasti (poput Yarila i Lade), te erotskih narodnih priča i obrednih pjesama. Tvoj cilj je paru pružiti uvid u dubinu, strast i potencijal za rast njihovog odnosa, uz potpunu etičku odgovornost.

    Etički i Psihološki Kodeks (Obavezna Pravila):
    Fokus na Dinamiku, Ne na Sudbinu: Analiza mora objasniti dinamiku interakcije (što jedno donosi drugome), a ne predvidjeti trajanje veze. Nikada ne koristi riječi "osuđeni", "nekompatibilni".
    Pozitivni Psihološki Okvir: Svaki izazov u sinastriji (npr. kvadrat) mora biti interpretiran kao prilika za komunikaciju, kompromis i produbljivanje intimnosti, u duhu moderne terapije parova.
    Jasne Granice: Ne smiješ davati savjete o prekidu, braku, trudnoći ili zdravlju. Uključi etičko odricanje.
    Jezik: Koristi senzualan, poetski i narativan jezik, prožet slavenskim motivima strasti i vječne ljubavi.

    Struktura Izlaza (Romantično-Erotski Horoskop) - Koristi Markdown:
    1. 💌 Uvod: Susret Vatre i Vode (Početak Mitološke Ljubavi)
    Ton: Poetski uvod u analizu. Potvrda imena.
    Odricanje od Odgovornosti: Uvijek jasno navedi etičko odricanje i naglasi slobodnu volju.
    2. 🔥 Jezgra Strasti: Ples Venere i Marsa (Erotski Potencijal)
    A) Venera (Ljubav A) u odnosu na Mars (Strast B): Analiza privlačnosti. Poveži s mitovima o Ladi (Božica Ljubavi) i Perunu (Muška Snaga/Akcija).
    B) Mars (Akcija A) u odnosu na Venera (Žudnja B): Analiza kako partneri pokreću jedno drugo u strasti i želji.
    Narativ: Opiši njihov spoj kao "Ples na Vrelu Ivana Kupala" – strastvena, sirova energija.
    3. 🌙 Emocionalni Pečat: Mjesec na Mjesec (Kolijevka Intimnosti)
    Analiza: Kompatibilnost Mjeseca (emocionalne potrebe i sigurnost). Kako se međusobno njeguju.
    Narativ: Poveži s Mokoši (Velika Majka) i objašnjavanjem je li njihov emotivni zagrljaj poput sigurne šumske kolijevke.
    4. 🧭 Tko Koga Vidi: Projekcije Ascendenta (Ogledalo Duša)
    Analiza: Opozicija/Konjunkcija Ascendenta A i Descendenta B. Kako se doživljavaju i kakve uloge nesvjesno igraju jedno za drugo.
    Psihološki Twist: Objasni psihološki princip projekcije: "Partner B vidi u Partneru A osobine koje je zaboravio u sebi."
    5. 💔 Išaranost Sinastrije: Izazovi i Alati (Borba sa Zmajem)
    Analiza: Dva najizazovnija aspekta (npr. Mjesec/Saturn).
    Psihološka Pomoć: Pretvori svaki izazov u konkretan, psihološki savjet za bolju komunikaciju.
    Slavenski Twist: Opiši ove sukobe kao "Velesovu kušnju" – priliku da se dokaže snaga ljubavi kroz iskušenja.
    6. 💐 Zaključak: Blagoslov Puta
    Snažan, zaključni narativ koji slavi jedinstvenu dinamiku para i potiče ih da aktivno grade svoju "Ljubavnu Legencu", naglašavajući obostrani rast.

    Ulazni podaci za analizu:
    Ime Osobe A: ${data.imeOsobeA}
    Osobni Podaci A: (Molimo izvedite astrološke pozicije iz ovih podataka za potrebe sinastrije, npr. Sunce, Mjesec, Venera, Mars, Ascendent, Kuće)
    Datum rođenja: ${data.datumRodjenjaA}
    Vrijeme rođenja: ${data.vrijemeRodjenjaA}
    Mjesto rođenja: ${data.mjestoRodjenjaA}

    Ime Osobe B: ${data.imeOsobeB}
    Osobni Podaci B: (Molimo izvedite astrološke pozicije iz ovih podataka za potrebe sinastrije, npr. Sunce, Mjesec, Venera, Mars, Ascendent, Kuće)
    Datum rođenja: ${data.datumRodjenjaB}
    Vrijeme rođenja: ${data.vrijemeRodjenjaB}
    Mjesto rođenja: ${data.mjestoRodjenjaB}
    `;

    try {
      const response: GenerateContentResponse = await this.ai!.models.generateContent({ // Use non-null assertion as checkApiKey ensures it's not null
        model: 'gemini-2.5-pro', // Use Pro for complex tasks
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for 2.5 Pro
        },
      });
      return response.text;
    } catch (error) {
      console.error('Error generating synastry analysis:', error);
      throw new Error('Failed to generate synastry analysis. Please try again.');
    }
  }

  // --- Image Generation (Imagen-4.0-generate-001) ---
  async generateImage(prompt: string): Promise<string> {
    this.checkApiKey(); // Added API key check
    try {
      const response = await this.ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please try again.');
    }
  }

  // --- Chat Bot (Gemini-2.5-Flash with Streaming) ---
  async startChat(): Promise<void> {
    this.checkApiKey(); // Added API key check
    if (!this.chatInstance) { // Only create if not already created
        this.chatInstance = this.ai!.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are a helpful assistant for Slavic mythology and astrological synastry. Provide concise and relevant information. If asked about current events or locations, use grounding tools.',
          },
        });
    }
  }

  async sendMessageToChat(message: string): Promise<string> {
    this.checkApiKey(); // Added API key check
    if (!this.chatInstance) {
      await this.startChat(); // Ensure chat instance is ready
    }

    try {
      // Non-null assertion for this.chatInstance! as it's checked by startChat or checkApiKey
      const responseStream = await this.chatInstance!.sendMessageStream({ message });
      let fullResponse = '';
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
      }
      return fullResponse;
    } catch (error: any) {
      console.error('Error sending message to chat:', error);
      throw new Error('Failed to get chat response. Please try again.');
    }
  }

  // --- Low-Latency Response (Gemini-2.5-Flash with thinkingBudget: 0) ---
  async getLowLatencyResponse(query: string): Promise<string> {
    this.checkApiKey(); // Added API key check
    try {
      const response: GenerateContentResponse = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for lowest latency
        }
      });
      return response.text;
    } catch (error) {
      console.error('Error getting low-latency response:', error);
      throw new Error('Failed to get low-latency response.');
    }
  }

  // --- Search Grounding (Gemini-2.5-Flash with GoogleSearch tool) ---
  async searchGrounding(query: string): Promise<{ text: string; urls: string[] }> {
    this.checkApiKey(); // Added API key check
    try {
      const response: GenerateContentResponse = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const urls: string[] = [];
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            urls.push(chunk.web.uri);
          }
        });
      }

      return { text: response.text, urls: urls };
    } catch (error) {
      console.error('Error with Search Grounding:', error);
      throw new Error('Failed to perform search grounding. Please try again.');
    }
  }

  // --- Maps Grounding (Gemini-2.5-Flash with GoogleMaps tool) ---
  async mapsGrounding(query: string): Promise<{ text: string; urls: string[] }> {
    // Adhering to the rule: "Only `tools`: `googleSearch` is permitted. Do not use it with other tools."
    // The `googleMaps` tool is not directly available in the current public @google/genai SDK for use with `tools` config.
    this.checkApiKey();
    console.warn('The Google Maps tool is not directly available in the current public @google/genai SDK for use with `tools` config. Please use general chat for map-related queries, or search grounding for locations.');
    return {
      text: `Nažalost, direktna integracija Google Maps alata putem Gemini API-ja nije podržana u ovoj konfiguraciji. Možete pokušati postaviti općenito pitanje o lokacijama u chatu.`,
      urls: []
    };
  }
}