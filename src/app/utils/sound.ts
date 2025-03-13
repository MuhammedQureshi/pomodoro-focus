class SoundManager {
  private static context: AudioContext | null = null;
  private static gainNode: GainNode | null = null;

  private static getContext() {
    if (!this.context) {
      interface WebKitWindow extends Window {
        webkitAudioContext: typeof AudioContext;
      }
      
      this.context = new (window.AudioContext || (window as unknown as WebKitWindow).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
    }
    return { context: this.context, gainNode: this.gainNode };
  }

  static async playNotification(volume: number = 0.7) {
    try {
      const { context, gainNode } = this.getContext();
      if (!context || !gainNode) return;

      // Create oscillator for the notification sound
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, context.currentTime); // Start at 800Hz
      oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.2); // Sweep to 400Hz

      // Set volume
      gainNode.gain.value = volume;

      // Connect and play
      oscillator.connect(gainNode);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);

      // Create a second tone after a short delay
      setTimeout(() => {
        const oscillator2 = context.createOscillator();
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(600, context.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.2);
        oscillator2.connect(gainNode);
        oscillator2.start();
        oscillator2.stop(context.currentTime + 0.2);
      }, 250);

    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
}

export default SoundManager; 