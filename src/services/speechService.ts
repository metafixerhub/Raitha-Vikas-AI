class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private voicePitch: number = 1.0;
  private voiceRate: number = 0.95; // slightly paced for clarity

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer Indian English or high-clarity natural English
    const preferred = voices.find(v => v.lang.includes('en-IN')) ||
                      voices.find(v => v.name.includes('Natural') || v.name.includes('Neural')) ||
                      voices.find(v => v.lang.startsWith('en')) ||
                      voices[0];
    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setPitchRate(pitch: number, rate: number) {
    this.voicePitch = pitch;
    this.voiceRate = rate;
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void): boolean {
    if (this.isMuted || !this.synth) {
      return false;
    }

    try {
      this.synth.cancel(); // clear previous utterance

      // Strip markdown symbols (*, **, #, _, `, etc.) so speech doesn't pronounce "asterisk"
      const cleanText = text
        .replace(/[*#_`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.pitch = this.voicePitch;
      utterance.rate = this.voiceRate;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        onEnd?.();
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis not permitted or failed:', err);
      onEnd?.();
      return false;
    }
  }
}

export const speechService = new SpeechService();
