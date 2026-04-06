import EventEmitter from 'events';

export class DMLHandshake extends EventEmitter {
  constructor(swarmBridge, verifier, heliWindow = 5000) {
    super();
    this.swarmBridge = swarmBridge;
    this.verifier = verifier;
    this.heliWindow = heliWindow; // Timeout window for peer responses
    this.activeChallenges = new Map();
  }

  /**
   * Start a handshake with a peer for DML verification.
   */
  async verifyPeer(peerId, challengeData) {
    console.log(`Starting DML Handshake with peer: ${peerId}`);
    
    return new Promise((resolve, reject) => {
      // 1. Send DML_CHALLENGE_REQ to the peer via swarm
      this.swarmBridge.send(peerId, {
        type: 'DML_CHALLENGE_REQ',
        content: challengeData
      });

      // 2. Set timeout for Heli-Window
      const timeout = setTimeout(() => {
        this._handleTimeout(peerId, resolve, reject);
      }, this.heliWindow);

      // 3. Listen for DML_CHALLENGE_RES
      this.activeChallenges.set(peerId, { resolve, reject, timeout });
    });
  }

  /**
   * Handle incoming DML_CHALLENGE_RES from the swarm.
   */
  onChallengeResponse(peerId, proofData) {
    const challenge = this.activeChallenges.get(peerId);
    if (!challenge) return;

    clearTimeout(challenge.timeout);
    this.activeChallenges.delete(peerId);

    // 4. Verify the Hash-Chain Proof
    const isValid = this.verifier.verifyAttestationSeal(
      proofData.content,
      proofData.signature,
      proofData.publicKey
    );

    if (isValid) {
      console.log(`DML Verification Passed for peer: ${peerId}`);
      
      // 5. Issue DML_TRUST_ATTEST
      this.swarmBridge.broadcast({
        type: 'DML_TRUST_ATTEST',
        content: {
          peerId: peerId,
          attestation: 'PASS',
          timestamp: Date.now()
        }
      });
      
      challenge.resolve(true);
    } else {
      console.log(`DML Verification Failed for peer: ${peerId}`);
      challenge.reject(new Error('Invalid Hash-Chain Proof'));
    }
  }

  _handleTimeout(peerId, resolve, reject) {
    console.log(`DML Handshake Timed Out for peer: ${peerId}`);
    this.activeChallenges.delete(peerId);
    reject(new Error('DML_CHALLENGE_RES timeout within Heli-Window'));
  }
}
