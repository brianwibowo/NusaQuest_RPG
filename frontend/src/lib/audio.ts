// src/lib/audio.ts

class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private normalVolume: number = 0.15;
  private duckVolume: number = 0.03;
  private isBgmLoading: boolean = false;

  constructor() {
    // Load mute state from localStorage
    const savedMute = localStorage.getItem("sinopiquest_muted");
    this.isMuted = savedMute === "true";
  }

  /**
   * Fetch the active BGM URL from backend, fallback to default adventure music
   */
  private async getActiveBgmUrl(): Promise<{ url: string; skipIntro: boolean }> {
    try {
      const res = await fetch("/api/songs");
      if (res.ok) {
        const songs = await res.json();
        const activeSong = songs.find((s: any) => s.isActive);
        if (activeSong && activeSong.fileUrl) {
          return { url: activeSong.fileUrl, skipIntro: false };
        }
      }
    } catch (e) {
      console.error("Failed to load active BGM from API, using default fallback:", e);
    }
    return { url: "/audio/bgm_adventure.mp3", skipIntro: true };
  }

  /**
   * Initialize and play the active BGM from database
   */
  public async playBgm() {
    if (this.bgm) return; // Already playing
    if (this.isBgmLoading) return; // Already loading BGM

    this.isBgmLoading = true;

    try {
      const { url, skipIntro } = await this.getActiveBgmUrl();
      
      // If stopBgm was called while fetching, abort playing
      if (!this.isBgmLoading) return;

      this.bgm = new Audio(url);
      this.bgm.volume = this.normalVolume;
      this.bgm.muted = this.isMuted;

      if (skipIntro) {
        // Set starting position to 17 seconds (skip first 16 seconds of default BGM)
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
      } else {
        this.bgm.loop = true;
      }

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
    } catch (e) {
      console.error("Error initializing dynamic BGM:", e);
    } finally {
      this.isBgmLoading = false;
    }
  }

  /**
   * Stop the BGM
   */
  public stopBgm() {
    this.isBgmLoading = false;
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
    }
  }

  /**
   * Lower BGM volume during quiz/battle for focus
   */
  public lowerBgm() {
    if (!this.bgm) return;
    // Smooth fade down
    const target = this.duckVolume;
    const step = 0.01;
    const interval = setInterval(() => {
      if (this.bgm && this.bgm.volume > target + step) {
        this.bgm.volume -= step;
      } else {
        if (this.bgm) this.bgm.volume = target;
        clearInterval(interval);
      }
    }, 30);
  }

  /**
   * Restore BGM volume after quiz/battle ends
   */
  public restoreBgm() {
    if (!this.bgm) return;
    // Smooth fade up
    const target = this.normalVolume;
    const step = 0.01;
    const interval = setInterval(() => {
      if (this.bgm && this.bgm.volume < target - step) {
        this.bgm.volume += step;
      } else {
        if (this.bgm) this.bgm.volume = target;
        clearInterval(interval);
      }
    }, 30);
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
    localStorage.setItem("sinopiquest_muted", String(this.isMuted));
    
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
