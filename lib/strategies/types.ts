export interface IFaucetStrategy {
  /**
   * Validates the request (Captcha + Cooldown).
   * Throws Error if invalid.
   */
  validateRequest(req: Request, body: { address: string; turnstileToken: string }): Promise<void>;

  /** Returns configuration for the active strategy */
  getDropAmount(): number;
  getTreasuryPrivateKey(): string;
  getRpcUrl(): string;
  getCooldownSeconds(): number;
  getEnvironmentName(): string;
}
