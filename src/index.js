'use strict';
/**
 *  hop-dml
 *
 * @class HopDml
 * @package    dml
 * @copyright  Copyright (c) 2024 James Littlejohn
 * @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
 */
import EventEmitter from 'events';
import { DMLEngine } from './core/Engine.js';
import { DMLSigner } from './security/Signer.js';
import { DMLVerifier } from './security/Verifier.js';
import { generateChallenge } from './p2p/Challenge.js';
import { DMLHandshake } from './p2p/Handshake.js';
import { DMLSwarmBridge } from './p2p/SwarmBridge.js';

class HopDml extends EventEmitter {

  constructor(library, swarm, bee, ledger) {
    super();
    this.library = library;
    this.swarm = swarm;
    this.bee = bee;
    this.ledger = ledger; // Represents the coherence.attestation ledger

    this.engine = new DMLEngine();
    this.signer = new DMLSigner();
    this.verifier = new DMLVerifier();
    this.bridge = new DMLSwarmBridge(this.swarm);
    this.handshake = new DMLHandshake(this.bridge, this.verifier);

    // Initialise P2P message handlers
    this.bridge.on('dmlMessage', (peerId, message) => {
      this._handleIncomingMessage(peerId, message);
    });
  }

  /**
   * Produce Proof of Health for the decentralized machine learning cycle.
   */
  async powEvidence(context) {
    console.log('Building DML Proof-of-Health Evidence for SafeFlow-ECS Cycle...');
    
    // 1. Generate local evidence data (The 'Evidence Seal')
    const evidence = {
      timestamp: Date.now(),
      modelId: context.modelId,
      weights: this.engine.getWeights(),
      nxpContract: context.nxpContract
    };

    const signature = this.signer.sealEvidence(evidence, context.privateKey);
    
    // 2. Broadcast the result of the local cycle to the swarm
    this.bridge.broadcast({
      type: 'DML_EVIDENCE_BROADCAST',
      content: evidence,
      signature: signature
    });

    return { evidence, signature };
  }

  /**
   * Verify a peer using the "Gifting Peer" logic.
   */
  async verifyPeer(peerId) {
    // 1. Check if a valid attestation already exists in the swarm ledger for this peer.
    const existingAttestation = await this.ledger.get(peerId);

    if (existingAttestation && existingAttestation.isValid) {
      console.log(`Gifting Peer: Valid attestation already exists for ${peerId}. Skipping redundant compute.`);
      
      // Move directly to weight aggregation
      return this._performWeightAggregation(peerId, existingAttestation.weights);
    }

    // 2. If no attestation, perform the DML Handshake.
    const challenge = await generateChallenge(this.bee);
    const signature = this.signer.sealChallenge(challenge, this.context.privateKey);

    const result = await this.handshake.verifyPeer(peerId, {
      challenge,
      signature
    });

    if (result) {
      // 3. Rotation: Peer then "Gifts" their own compute for a new 2% sample in the future.
      console.log(`DML Handshake Successful. Rotation: Compute gifted for peer ${peerId}.`);
    }

    return result;
  }

  _handleIncomingMessage(peerId, message) {
    switch (message.type) {
      case 'DML_CHALLENGE_REQ':
        this._respondToChallenge(peerId, message.content);
        break;
      case 'DML_CHALLENGE_RES':
        this.handshake.onChallengeResponse(peerId, message.content);
        break;
      case 'DML_TRUST_ATTEST':
        this._handleAttestation(peerId, message.content);
        break;
      case 'DML_GIFT_PROOF':
        this._handleGiftProof(peerId, message.content);
        break;
      default:
        console.log(`Unhandled DML Message type: ${message.type}`);
    }
  }

  _respondToChallenge(peerId, challengeReq) {
    const { challenge, signature } = challengeReq;
    
    // Verify challenger signature
    const isValidChallenge = this.verifier.verifyChallengeSeal(challenge, signature, peerId);
    if (!isValidChallenge) return;

    // Generate Hash-Chain Proof for the challenged 2% sample
    const proofData = {
      challengedKeys: challenge.challengedKeys,
      proofChain: this._generateHashChain(challenge.challengedKeys)
    };

    const attestationSignature = this.signer.sealAttestation(proofData, this.context.privateKey);

    // Send the DML_CHALLENGE_RES
    this.bridge.send(peerId, {
      type: 'DML_CHALLENGE_RES',
      content: proofData,
      signature: attestationSignature
    });
  }

  _performWeightAggregation(peerId, weights) {
    console.log(`Performing Weight Aggregation for peer ${peerId}...`);
    // Aggregation logic...
  }

  _handleAttestation(peerId, attestation) {
    console.log(`Received Trust Attestation from ${peerId}: ${attestation.attestation}`);
    // Save to local ledger
  }

  _handleGiftProof(peerId, giftProof) {
    console.log(`Received Gifting Proof from ${peerId} for verification delegation.`);
    // Forwarded verification to the network
  }

  _generateHashChain(keys) {
    // Basic hash generation logic for Hash-Chain Proof
    return keys.map(key => {
      const hash = this.bee.get(key); // Simplified
      return { key, hash };
    });
  }

}

export default HopDml;
