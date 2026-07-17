/**
 * Verifies a Cloudflare Turnstile token
 * @param token - The turnstile response token from the client
 * @param secret - The Turnstile secret key
 * @returns Promise<boolean> - True if verification succeeds, false otherwise
 */
export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) {
    console.error('Turnstile verification failed: Missing token or secret');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error('Turnstile API returned non-OK status:', response.status);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}
