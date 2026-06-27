// src/lib/audio.ts

class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Load mute state from localStorage
    const savedMute = localStorage.getItem("nusaquest_muted");
    this.isMuted = savedMute === "true";
  }

  /**
   * Initialize and play the BGM starting from 17 seconds
   */
  public playBgm() {
    if (this.bgm) return; // Already playing

    this.bgm = new Audio("/audio/bgm_adventure.mp3");
    this.bgm.volume = 0.15; // Soft ambient volume
    this.bgm.muted = this.isMuted;

    // Set starting position to 17 seconds (skip first 16 seconds)
    this.bgm.currentTime = 17;

    // Loop logic: When it reaches the end, reset back to 17 seconds
    this.bgm.addEventListener("timeupdate", () => {
      if (this.bgm && this.bgm.currentTime >= this.bgm.duration - 0.5) {
        this.bgm.currentTime = 17;
      }
    });

    // Fallback: If loop is enabled, ensure it handles resetting
    this.bgm.addEventListener("ended", () => {
      if (this.bgm) {
        this.bgm.currentTime = 17;
        this.bgm.play().catch((err) => console.log("BGM loop play blocked:", err));
      }
    });

    this.bgm.play().catch((err) => {
      // Browsers block autoplay before user interaction
      console.log("BGM autoplay blocked until user interaction:", err);
      
      // Auto-retry on first click
      const enableAudio = () => {
        if (this.bgm) {
          this.bgm.play().catch((e) => console.log("Audio retry failed:", e));
        }
        window.removeEventListener("click", enableAudio);
      };
      window.addEventListener("click", enableAudio);
    });
  }

  /**
   * Stop the BGM
   */
  public stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
    }
  }

  /**
   * Play SFX Click
   */
  public playClick() {
    this.playSfx("/audio/sfx_click.mp3", 0.3);
  }

  /**
   * Play SFX Success
   */
  public playSuccess() {
    this.playSfx("/audio/sfx_success.mp3", 0.3);
  }

  /**
   * Play SFX Error
   */
  public playError() {
    this.playSfx("/audio/sfx_error.mp3", 0.25);
  }

  /**
   * Play SFX Level Up (stops programmatically after 3.5 seconds to avoid being too long)
   */
  public playLevelUp() {
    this.playSfx("/audio/sfx_levelup.mp3", 0.4, 3500); // 3500ms duration limit
  }

  /**
   * Helper to play an SFX with volume and optional duration limit
   */
  private playSfx(path: string, volume: number = 0.3, durationLimitMs?: number) {
    const sfx = new Audio(path);
    sfx.volume = volume;
    sfx.muted = this.isMuted;
    
    sfx.play().catch((err) => console.log(`SFX ${path} blocked:`, err));

    // If there is a duration limit, stop and fade out
    if (durationLimitMs) {
      setTimeout(() => {
        // Fade out quickly
        let vol = sfx.volume;
        const fadeInterval = setInterval(() => {
          if (vol > 0.05) {
            vol -= 0.05;
            sfx.volume = Math.max(0, vol);
          } else {
            clearInterval(fadeInterval);
            sfx.pause();
          }
        }, 50);
      }, durationLimitMs);
    }
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem("nusaquest_muted", String(this.isMuted));
    
    if (this.bgm) {
      this.bgm.muted = this.isMuted;
    }
    return this.isMuted;
  }

  /**
   * Check if currently muted
   */
  public getMutedState(): boolean {
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
