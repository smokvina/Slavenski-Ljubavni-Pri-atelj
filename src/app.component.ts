import { Component, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { Marked } from 'marked'; // Only Marked is needed as a class

// Initialize marked
const marked = new Marked({ // Pass options directly to the Marked constructor
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

interface ChatMessage {
  sender: 'user' | 'gemini';
  text: string;
  groundingUrls?: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  imeOsobeA = signal<string>('Ana Petrović');
  datumRodjenjaA = signal<string>('');
  vrijemeRodjenjaA = signal<string>('');
  mjestoRodjenjaA = signal<string>('');

  imeOsobeB = signal<string>('Marko Horvat');
  datumRodjenjaB = signal<string>('');
  vrijemeRodjenjaB = signal<string>('');
  mjestoRodjenjaB = signal<string>('');

  // Validation signals
  imeOsobeAError = signal<string | null>(null);
  datumRodjenjaAError = signal<string | null>(null);
  vrijemeRodjenjaAError = signal<string | null>(null);
  mjestoRodjenjaAError = signal<string | null>(null);

  imeOsobeBError = signal<string | null>(null);
  datumRodjenjaBError = signal<string | null>(null);
  vrijemeRodjenjaBError = signal<string | null>(null);
  mjestoRodjenjaBError = signal<string | null>(null);

  formValid = computed(() => {
    return (
      !!this.imeOsobeA() &&
      !!this.datumRodjenjaA() &&
      !!this.vrijemeRodjenjaA() &&
      !!this.mjestoRodjenjaA() &&
      !!this.imeOsobeB() &&
      !!this.datumRodjenjaB() &&
      !!this.vrijemeRodjenjaB() &&
      !!this.mjestoRodjenjaB()
    );
  });

  analysisResult = signal<string>('');
  analysisHtml = signal<string>('');
  loadingAnalysis = signal<boolean>(false);
  analysisError = signal<string | null>(null);

  imagePrompt = signal<string>('');
  generatedImageSrc = signal<string | null>(null);
  loadingImage = signal<boolean>(false);
  imageError = signal<string | null>(null);

  chatHistory = signal<ChatMessage[]>([]);
  chatInput = signal<string>('');
  loadingChat = signal<boolean>(false);
  chatError = signal<string | null>(null);

  lowLatencyResponse = signal<string | null>(null);
  loadingLowLatency = signal<boolean>(false);
  lowLatencyError = signal<string | null>(null);

  activeMobileTab = signal<'input' | 'results'>('input'); // Signal for mobile tab navigation

  constructor(private geminiService: GeminiService) {
    // Effect to re-render markdown when analysisResult changes
    effect(() => {
      const result = this.analysisResult();
      if (result) {
        try {
          const html = marked.parse(result);
          this.analysisHtml.set(html);
        } catch (err) {
          console.error("Markdown parsing error:", err);
          this.analysisHtml.set(`<p class="text-red-400">Error rendering analysis.</p><pre>${result}</pre>`);
        }
      } else {
        this.analysisHtml.set('');
      }
    });

    // Effects to clear validation errors when input changes
    effect(() => { this.imeOsobeA(); this.imeOsobeAError.set(null); });
    effect(() => { this.datumRodjenjaA(); this.datumRodjenjaAError.set(null); });
    effect(() => { this.vrijemeRodjenjaA(); this.vrijemeRodjenjaAError.set(null); });
    effect(() => { this.mjestoRodjenjaA(); this.mjestoRodjenjaAError.set(null); });

    effect(() => { this.imeOsobeB(); this.imeOsobeBError.set(null); });
    effect(() => { this.datumRodjenjaB(); this.datumRodjenjaBError.set(null); });
    effect(() => { this.vrijemeRodjenjaB(); this.vrijemeRodjenjaBError.set(null); });
    effect(() => { this.mjestoRodjenjaB(); this.mjestoRodjenjaBError.set(null); });
  }

  ngOnInit(): void {
    this.generateExampleAstroData();
    this.geminiService.startChat(); // Initialize chat instance
  }

  // Clear all validation errors
  private clearValidationErrors(): void {
    this.imeOsobeAError.set(null);
    this.datumRodjenjaAError.set(null);
    this.vrijemeRodjenjaAError.set(null);
    this.mjestoRodjenjaAError.set(null);

    this.imeOsobeBError.set(null);
    this.datumRodjenjaBError.set(null);
    this.vrijemeRodjenjaBError.set(null);
    this.mjestoRodjenjaBError.set(null);
  }

  generateExampleAstroData(): void {
    this.clearValidationErrors(); // Clear errors when populating example data

    this.imeOsobeA.set('Ana Petrović');
    this.datumRodjenjaA.set('1985-08-15');
    this.vrijemeRodjenjaA.set('14:30');
    this.mjestoRodjenjaA.set('Zagreb, Hrvatska');

    this.imeOsobeB.set('Marko Horvat');
    this.datumRodjenjaB.set('1983-01-20');
    this.vrijemeRodjenjaB.set('08:00');
    this.mjestoRodjenjaB.set('Split, Hrvatska');
  }

  private validateForm(): boolean {
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    // Validation for Partner A
    if (!this.imeOsobeA()) {
      this.imeOsobeAError.set('Ime prve osobe je obavezno.');
      isValid = false;
    }
    if (!this.datumRodjenjaA()) {
      this.datumRodjenjaAError.set('Datum rođenja za prvu osobu je obavezan.');
      isValid = false;
    } else {
      const birthDateA = new Date(this.datumRodjenjaA());
      if (isNaN(birthDateA.getTime())) {
        this.datumRodjenjaAError.set('Neispravan format datuma za prvu osobu.');
        isValid = false;
      } else if (birthDateA > today) {
        this.datumRodjenjaAError.set('Datum rođenja ne može biti u budućnosti za prvu osobu.');
        isValid = false;
      }
    }
    if (!this.vrijemeRodjenjaA()) {
      this.vrijemeRodjenjaAError.set('Vrijeme rođenja za prvu osobu je obavezno.');
      isValid = false;
    } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(this.vrijemeRodjenjaA())) {
      this.vrijemeRodjenjaAError.set('Neispravan format vremena (HH:MM) za prvu osobu.');
      isValid = false;
    }
    if (!this.mjestoRodjenjaA()) {
      this.mjestoRodjenjaAError.set('Mjesto rođenja za prvu osobu je obavezno.');
      isValid = false;
    }

    // Validation for Partner B
    if (!this.imeOsobeB()) {
      this.imeOsobeBError.set('Ime druge osobe je obavezno.');
      isValid = false;
    }
    if (!this.datumRodjenjaB()) {
      this.datumRodjenjaBError.set('Datum rođenja za drugu osobu je obavezan.');
      isValid = false;
    } else {
      const birthDateB = new Date(this.datumRodjenjaB());
      if (isNaN(birthDateB.getTime())) {
        this.datumRodjenjaBError.set('Neispravan format datuma za drugu osobu.');
        isValid = false;
      } else if (birthDateB > today) {
        this.datumRodjenjaBError.set('Datum rođenja ne može biti u budućnosti za drugu osobu.');
        isValid = false;
      }
    }
    if (!this.vrijemeRodjenjaB()) {
      this.vrijemeRodjenjaBError.set('Vrijeme rođenja za drugu osobu je obavezno.');
      isValid = false;
    } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(this.vrijemeRodjenjaB())) {
      this.vrijemeRodjenjaBError.set('Neispravan format vremena (HH:MM) za drugu osobu.');
      isValid = false;
    }
    if (!this.mjestoRodjenjaB()) {
      this.mjestoRodjenjaBError.set('Mjesto rođenja za drugu osobu je obavezno.');
      isValid = false;
    }

    return isValid;
  }

  async onSubmitAnalysis(): Promise<void> {
    if (!this.validateForm()) {
      this.analysisError.set('Molimo popunite sva obavezna polja ispravno.');
      return;
    }

    this.loadingAnalysis.set(true);
    this.analysisError.set(null);
    try {
      const data = {
        imeOsobeA: this.imeOsobeA(),
        datumRodjenjaA: this.datumRodjenjaA(),
        vrijemeRodjenjaA: this.vrijemeRodjenjaA(),
        mjestoRodjenjaA: this.mjestoRodjenjaA(),
        imeOsobeB: this.imeOsobeB(),
        datumRodjenjaB: this.datumRodjenjaB(),
        vrijemeRodjenjaB: this.vrijemeRodjenjaB(),
        mjestoRodjenjaB: this.mjestoRodjenjaB(),
      };
      const result = await this.geminiService.generateSynastryAnalysis(data);
      this.analysisResult.set(result);
      this.imagePrompt.set(`An artistic representation of ${this.imeOsobeA()} and ${this.imeOsobeB()}'s love, inspired by Slavic mythology, featuring Lada and Yarilo, in a vibrant, romantic style.`);
      this.activeMobileTab.set('results'); // Switch to results tab after successful analysis
    } catch (error: any) {
      this.analysisError.set(error.message || 'An unknown error occurred during analysis.');
    } finally {
      this.loadingAnalysis.set(false);
    }
  }

  async onGenerateImage(): Promise<void> {
    if (!this.imagePrompt()) {
      this.imageError.set('Please provide an image prompt.');
      return;
    }

    this.loadingImage.set(true);
    this.imageError.set(null);
    try {
      const imageUrl = await this.geminiService.generateImage(this.imagePrompt());
      this.generatedImageSrc.set(imageUrl);
    } catch (error: any) {
      this.imageError.set(error.message || 'Failed to generate image.');
    } finally {
      this.loadingImage.set(false);
    }
  }

  async onChatSubmit(): Promise<void> {
    const userMessage = this.chatInput().trim();
    if (!userMessage) return;

    this.chatHistory.update(history => [...history, { sender: 'user', text: userMessage }]);
    this.chatInput.set('');
    this.loadingChat.set(true);
    this.chatError.set(null);

    try {
      const geminiResponse = await this.geminiService.sendMessageToChat(userMessage);
      this.chatHistory.update(history => [...history, { sender: 'gemini', text: geminiResponse }]);
    } catch (error: any) {
      this.chatError.set(error.message || 'Failed to get chat response. Please try again.');
    } finally {
      this.loadingChat.set(false);
    }
  }

  async onSearchGrounding(query: string = this.chatInput()): Promise<void> {
    const userMessage = query.trim();
    if (!userMessage) return;

    this.chatHistory.update(history => [...history, { sender: 'user', text: `Search: ${userMessage}` }]);
    this.chatInput.set('');
    this.loadingChat.set(true);
    this.chatError.set(null);

    try {
      const { text, urls } = await this.geminiService.searchGrounding(userMessage);
      this.chatHistory.update(history => [...history, { sender: 'gemini', text: text, groundingUrls: urls }]);
    } catch (error: any) {
      this.chatError.set(error.message || 'Failed to perform search grounding.');
    } finally {
      this.loadingChat.set(false);
    }
  }

  async onMapsGrounding(query: string = this.chatInput()): Promise<void> {
    const userMessage = query.trim();
    if (!userMessage) return;

    this.chatHistory.update(history => [...history, { sender: 'user', text: `Maps: ${userMessage}` }]);
    this.chatInput.set('');
    this.loadingChat.set(true);
    this.chatError.set(null);

    try {
      const { text, urls } = await this.geminiService.mapsGrounding(userMessage);
      this.chatHistory.update(history => [...history, { sender: 'gemini', text: text, groundingUrls: urls }]);
    } catch (error: any) {
      this.chatError.set(error.message || 'Failed to perform maps grounding.');
    } finally {
      this.loadingChat.set(false);
    }
  }

  async onGetLowLatencyResponse(): Promise<void> {
    const query = this.chatInput().trim();
    if (!query) {
      this.lowLatencyError.set('Please enter a query for low-latency response.');
      return;
    }

    this.loadingLowLatency.set(true);
    this.lowLatencyError.set(null);
    this.lowLatencyResponse.set(null);

    try {
      const response = await this.geminiService.getLowLatencyResponse(query);
      this.lowLatencyResponse.set(response);
    } catch (error: any) {
      this.lowLatencyError.set(error.message || 'Failed to get low-latency response.');
    } finally {
      this.loadingLowLatency.set(false);
    }
  }
}