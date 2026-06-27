// src/lib/haptics.ts

class HapticsManager {
  /**
   * Check if vibration API is supported on the user's browser/device
   */
  private isSupported(): boolean {
    return typeof window !== "undefined" && "vibrate" in navigator;
  }

  /**
   * Short subtle buzz for button clicks
   */
  public triggerClick() {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  }

  /**
   * Success vibration pattern (two quick pulses)
   */
  public triggerSuccess() {
    if (this.isSupported()) {
      navigator.vibrate([60, 40, 60]);
    }
  }

  /**
   * Error vibration pattern (one long heavy buzz)
   */
  public triggerError() {
    if (this.isSupported()) {
      navigator.vibrate(200);
    }
  }

  /**
   * Level up vibration pattern (triumphant rhythmic pulses)
   */
  public triggerLevelUp() {
    if (this.isSupported()) {
      navigator.vibrate([100, 50, 100, 50, 250]);
    }
  }
}

export const hapticsManager = new HapticsManager();
