import { sign } from 'hop-crypto';

export class DMLSigner {
  /**
   * Peer 1 signs the result of their 24-hour SafeFlow-ECS cycle.
   */
  sealEvidence(evidenceData, privateKey) {
    return sign(evidenceData, privateKey);
  }

  /**
   * Peer 2 signs a random selection of 2% of Peer 1's binary keys.
   */
  sealChallenge(challengeData, privateKey) {
    return sign(challengeData, privateKey);
  }

  /**
   * Peer 1 signs the Hash-Chain Proof for the challenged data.
   */
  sealAttestation(proofData, privateKey) {
    return sign(proofData, privateKey);
  }
}
