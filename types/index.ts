export interface ClaimRequestBody {
  address: string;
  turnstileToken: string;
}

export interface ClaimSuccessResponse {
  success: true;
  data: {
    txHash: string;
    amount: string;
    timestamp: number;
    from: string;
    to: string;
    explorerUrl: string;
  };
}

export interface ClaimErrorResponse {
  success: false;
  error: string;
}

export type ClaimResponse = ClaimSuccessResponse | ClaimErrorResponse;
