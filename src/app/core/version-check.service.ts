import { Injectable } from "@angular/core";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: "root" })
export class VersionCheckService {
  private knownVersion: string | null = null;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  async start(): Promise<void> {
    if (this.intervalId) return;

    this.knownVersion = await this.fetchVersion();

    this.intervalId = setInterval(() => this.checkVersion(), CHECK_INTERVAL_MS);
  }

  private async checkVersion(): Promise<void> {
    const latestVersion = await this.fetchVersion();

    if (!latestVersion || !this.knownVersion) return;

    if (latestVersion !== this.knownVersion) {
      window.location.reload();
    }
  }

  private async fetchVersion(): Promise<string | null> {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) return null;

      const data = await response.json();

      return data.version ?? null;
    } catch {
      return null;
    }
  }
}
