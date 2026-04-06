export class DMLEngine {
  constructor() {
    this.weights = [];
    this.bias = 0;
    this.learningRate = 0.01;
  }

  /**
   * Pure JS Matrix math & Gradient Descent.
   */
  train(data, labels, epochs = 100) {
    console.log(`Starting Local DML Training with ${data.length} samples.`);

    // Initialize weights if not already done
    if (this.weights.length === 0) {
      this.weights = new Array(data[0].length).fill(0);
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;

      for (let i = 0; i < data.length; i++) {
        const prediction = this.predict(data[i]);
        const error = labels[i] - prediction;
        totalError += Math.abs(error);

        // Update weights and bias using Gradient Descent
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] += this.learningRate * error * data[i][j];
        }
        this.bias += this.learningRate * error;
      }

      if (epoch % 10 === 0) {
        console.log(`Epoch ${epoch}: Total Error: ${totalError}`);
      }
    }
    
    return { weights: this.weights, bias: this.bias };
  }

  /**
   * Predict the result of a given data sample using current weights and bias.
   */
  predict(sample) {
    let sum = 0;
    for (let i = 0; i < sample.length; i++) {
      sum += sample[i] * this.weights[i];
    }
    return sum + this.bias;
  }

  /**
   * Set local model weights from an external source (e.g. Weight Aggregation).
   */
  setWeights(weights, bias) {
    this.weights = weights;
    this.bias = bias;
  }

  getWeights() {
    return { weights: this.weights, bias: this.bias };
  }
}
