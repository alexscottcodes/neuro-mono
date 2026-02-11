import { AudioBuffer, StereoAnalysis } from './types';

/**
 * Audio processing utilities
 */
export class AudioUtils {
  /**
   * Analyze stereo audio characteristics
   */
  static analyzeStereo(buffer: AudioBuffer): StereoAnalysis {
    const { left, right } = buffer;
    const length = left.length;

    // Calculate stereo width (based on difference between channels)
    let widthSum = 0;
    let correlationSum = 0;
    let leftPowerSum = 0;
    let rightPowerSum = 0;
    let rmsSum = 0;
    let peakLevel = 0;

    for (let i = 0; i < length; i++) {
      const diff = Math.abs(left[i] - right[i]);
      const mid = (left[i] + right[i]) / 2;
      
      widthSum += diff;
      correlationSum += left[i] * right[i];
      leftPowerSum += left[i] * left[i];
      rightPowerSum += right[i] * right[i];
      rmsSum += mid * mid;
      
      const peak = Math.max(Math.abs(left[i]), Math.abs(right[i]));
      if (peak > peakLevel) peakLevel = peak;
    }

    const width = Math.min(1.0, widthSum / length);
    const rmsLevel = Math.sqrt(rmsSum / length);
    
    // Normalized phase correlation
    const leftRMS = Math.sqrt(leftPowerSum / length);
    const rightRMS = Math.sqrt(rightPowerSum / length);
    const normalization = leftRMS * rightRMS;
    const phaseCorrelation = normalization > 0 ? (correlationSum / length) / normalization : 0;

    // Calculate spectral richness using harmonic analysis
    const richness = this.calculateRichness(buffer);
    
    // Analyze frequency distribution
    const frequencyDistribution = this.analyzeFrequencyDistribution(buffer);

    return {
      width,
      richness,
      rmsLevel,
      peakLevel,
      phaseCorrelation,
      frequencyDistribution
    };
  }

  /**
   * Calculate spectral richness (harmonic content)
   */
  private static calculateRichness(buffer: AudioBuffer): number {
    const { left, right } = buffer;
    const length = Math.min(left.length, 8192); // Use first 8k samples for efficiency
    
    let harmonicSum = 0;
    const windowSize = 256;
    
    for (let i = 0; i < length - windowSize; i += windowSize / 2) {
      const lSlice = left.slice(i, i + windowSize);
      const rSlice = right.slice(i, i + windowSize);
      
      harmonicSum += this.calculateHarmonicContent(lSlice);
      harmonicSum += this.calculateHarmonicContent(rSlice);
    }
    
    const numWindows = Math.floor((length - windowSize) / (windowSize / 2)) * 2;
    return Math.min(1.0, harmonicSum / numWindows);
  }

  /**
   * Calculate harmonic content in a signal window
   */
  private static calculateHarmonicContent(window: Float32Array): number {
    let energy = 0;
    let zcr = 0; // Zero crossing rate
    
    for (let i = 0; i < window.length; i++) {
      energy += window[i] * window[i];
      if (i > 0 && window[i] * window[i - 1] < 0) zcr++;
    }
    
    // Higher ZCR relative to energy indicates richer harmonic content
    const normalizedZcr = zcr / window.length;
    const normalizedEnergy = Math.sqrt(energy / window.length);
    
    return normalizedZcr * normalizedEnergy * 10; // Scale factor
  }

  /**
   * Analyze frequency distribution (simplified spectral analysis)
   */
  private static analyzeFrequencyDistribution(buffer: AudioBuffer): { low: number; mid: number; high: number } {
    const { left, right } = buffer;
    const length = Math.min(left.length, 4096);
    
    // Simple frequency band energy estimation using zero-crossing analysis
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;
    
    const lowPassThreshold = 0.1;
    const highPassThreshold = 0.3;
    
    for (let i = 1; i < length; i++) {
      const lDiff = Math.abs(left[i] - left[i - 1]);
      const rDiff = Math.abs(right[i] - right[i - 1]);
      const diff = (lDiff + rDiff) / 2;
      
      if (diff < lowPassThreshold) {
        lowEnergy += Math.abs(left[i]) + Math.abs(right[i]);
      } else if (diff < highPassThreshold) {
        midEnergy += Math.abs(left[i]) + Math.abs(right[i]);
      } else {
        highEnergy += Math.abs(left[i]) + Math.abs(right[i]);
      }
    }
    
    const total = lowEnergy + midEnergy + highEnergy;
    return {
      low: total > 0 ? lowEnergy / total : 0,
      mid: total > 0 ? midEnergy / total : 0,
      high: total > 0 ? highEnergy / total : 0
    };
  }

  /**
   * Apply Hann window to reduce spectral leakage
   */
  static applyHannWindow(samples: Float32Array): Float32Array {
    const length = samples.length;
    const windowed = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
      windowed[i] = samples[i] * window;
    }
    
    return windowed;
  }

  /**
   * Calculate RMS (Root Mean Square) level
   */
  static calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Normalize audio to target RMS level
   */
  static normalize(samples: Float32Array, targetRMS: number): Float32Array {
    const currentRMS = this.calculateRMS(samples);
    if (currentRMS === 0) return samples;
    
    const gain = targetRMS / currentRMS;
    const normalized = new Float32Array(samples.length);
    
    for (let i = 0; i < samples.length; i++) {
      normalized[i] = Math.max(-1, Math.min(1, samples[i] * gain));
    }
    
    return normalized;
  }

  /**
   * Apply soft clipping to prevent harsh distortion
   */
  static softClip(samples: Float32Array, threshold: number = 0.9): Float32Array {
    const clipped = new Float32Array(samples.length);
    
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i];
      const absX = Math.abs(x);
      
      if (absX <= threshold) {
        clipped[i] = x;
      } else {
        // Soft clipping using tanh
        const sign = x >= 0 ? 1 : -1;
        clipped[i] = sign * (threshold + (1 - threshold) * Math.tanh((absX - threshold) / (1 - threshold)));
      }
    }
    
    return clipped;
  }

  /**
   * Simple linear interpolation for resampling
   */
  static resample(samples: Float32Array, sourceSampleRate: number, targetSampleRate: number): Float32Array {
    if (sourceSampleRate === targetSampleRate) return samples;
    
    const ratio = sourceSampleRate / targetSampleRate;
    const outputLength = Math.floor(samples.length / ratio);
    const resampled = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const sourceIndex = i * ratio;
      const index0 = Math.floor(sourceIndex);
      const index1 = Math.min(index0 + 1, samples.length - 1);
      const fraction = sourceIndex - index0;
      
      resampled[i] = samples[index0] * (1 - fraction) + samples[index1] * fraction;
    }
    
    return resampled;
  }
}
