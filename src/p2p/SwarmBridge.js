import EventEmitter from 'events';

export class DMLSwarmBridge extends EventEmitter {
  constructor(swarm) {
    super();
    this.swarm = swarm; // Expects a Hyperswarm instance
    this.connections = new Map();
  }

  /**
   * Send a targeted message to a specific peer in the swarm.
   */
  send(peerId, message) {
    const peer = this.connections.get(peerId);
    if (!peer) {
      console.log(`SwarmBridge: Peer ${peerId} not found in active connections.`);
      return;
    }

    const payload = JSON.stringify(message);
    peer.write(payload);
  }

  /**
   * Broadcast a message to all connected peers in the swarm.
   */
  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const peer of this.connections.values()) {
      peer.write(payload);
    }
  }

  /**
   * Handle incoming swarm messages and route them to DML Handshake.
   */
  onMessageReceived(peerId, message) {
    const parsed = JSON.parse(message);
    this.emit('dmlMessage', peerId, parsed);
  }

  addConnection(peerId, socket) {
    this.connections.set(peerId, socket);
    socket.on('data', (data) => this.onMessageReceived(peerId, data.toString()));
  }

  removeConnection(peerId) {
    this.connections.delete(peerId);
  }
}
