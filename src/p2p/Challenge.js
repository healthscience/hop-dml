import crypto from 'crypto';

/**
 * Challenge Generation (2% sample)
 * Takes a Hyperbee instance and returns a random 2% sample of keys.
 */
export async function generateChallenge(bee) {
  const challengedKeys = [];
  const keys = [];

  // Iterate through Hyperbee to collect all keys
  // Assuming 'bee' is a Hyperbee instance
  for await (const entry of bee.createReadStream()) {
    keys.push(entry.key);
  }

  // Randomly select 2% of keys
  const sampleSize = Math.max(1, Math.floor(keys.length * 0.02));
  const shuffled = keys.sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < sampleSize; i++) {
    challengedKeys.push(shuffled[i]);
  }

  // Create a nonce to ensure the challenge is unique
  const nonce = crypto.randomBytes(16).toString('hex');

  return { challengedKeys, nonce };
}
