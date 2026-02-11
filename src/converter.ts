import { AudioBuffer, ConversionOptions, StereoAnalysis } from './types';
import { AudioUtils } from './audio-utils';
import { AudioFeatureProcessor } from './neural-network';

/**
 * Intelligent stereo to mono converter using neural network analysis
 */
export class StereoToMonoConverter {
  private options: Required<ConversionOptions>;
  private processor: AudioFeatureProcessor;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      preserveWidth: options.preserveWidth ?? 0.7,
      preserveRichness: options.preserveRichness ?? 0.8,
      volumeCompensation: options.volumeCompensation ?? 1.1,
      sampleRate: options.sampleRate ?? null,
      quality: options.quality ?? 0.8,
      spectralAnalysis: options.spectralAnalysis ?? true
    };
    
    this.processor = new AudioFeatureProcessor();
  }

  /**
   * Convert stereo audio to mono while preserving quality characteristics
   */
  convert(buffer: AudioBuffer): Float32Array {
    // Analyze stereo characteristics
    const analysis = AudioUtils.analyzeStereo(buffer);
    
    // Get neural network processing recommendations
    const mixingWeights = this.calculateMixingWeights(analysis);
    
    // Perform intelligent downmix
    const mono = this.performIntelligentDownmix(buffer, analysis, mixingWeights);
    
    // Apply preservation techniques
    const enhanced = this.applyPreservationTechniques(mono, buffer, analysis);
    
    // Apply volume compensation
    const compensated = this.applyVolumeCompensation(enhanced, analysis);
    
    // Final normalization and soft clipping
    return AudioUtils.softClip(compensated, 0.95);
  }

  /**
   * Calculate mixing weights using neural network
   */
  private calculateMixingWeights(analysis: StereoAnalysis): Float32Array {
    // Prepare feature vector for neural network
    const features = new Float32Array([
      analysis.width,
      analysis.richness,
      analysis.rmsLevel,
      analysis.peakLevel,
      (analysis.phaseCorrelation + 1) / 2, // Normalize to [0, 1]
      analysis.frequencyDistribution.low,
      analysis.frequencyDistribution.mid,
      analysis.frequencyDistribution.high
    ]);
    
    return this.processor.processFeatures(features);
  }

  /**
   * Perform intelligent stereo to mono downmix
   */
  private performIntelligentDownmix(
    buffer: AudioBuffer,
    analysis: StereoAnalysis,
    weights: Float32Array
  ): Float32Array {
    const { left, right } = buffer;
    const length = left.length;
    const mono = new Float32Array(length);
    
    const [leftWeight, rightWeight, sideGain, _] = weights;
    
    for (let i = 0; i < length; i++) {
      // Base mix with neural network weights
      const mid = (left[i] * leftWeight + right[i] * rightWeight);
      
      // Add stereo width preservation
      if (this.options.preserveWidth > 0) {
        const side = (left[i] - right[i]) * sideGain * this.options.preserveWidth;
        mono[i] = mid + side * 0.5;
      } else {
        mono[i] = mid;
      }
    }
    
    return mono;
  }

  /**
   * Apply preservation techniques for richness and quality
   */
  private applyPreservationTechniques(
    mono: Float32Array,
    buffer: AudioBuffer,
    analysis: StereoAnalysis
  ): Float32Array {
    if (this.options.preserveRichness === 0) return mono;
    
    const enhanced = new Float32Array(mono.length);
    
    // Apply harmonic preservation using spectral analysis
    if (this.options.spectralAnalysis && analysis.richness > 0.3) {
      const harmonicEnhancement = this.extractHarmonicContent(buffer);
      const richnessFactor = this.options.preserveRichness * analysis.richness;
      
      for (let i = 0; i < mono.length; i++) {
        enhanced[i] = mono[i] + harmonicEnhancement[i] * richnessFactor * 0.15;
      }
    } else {
      enhanced.set(mono);
    }
    
    // Preserve high-frequency content
    if (analysis.frequencyDistribution.high > 0.2) {
      this.enhanceHighFrequencies(enhanced, analysis.frequencyDistribution.high);
    }
    
    return enhanced;
  }

  /**
   * Extract harmonic content from stereo signal
   */
  private extractHarmonicContent(buffer: AudioBuffer): Float32Array {
    const { left, right } = buffer;
    const length = left.length;
    const harmonic = new Float32Array(length);
    
    // Extract high-order harmonics through difference signal
    for (let i = 0; i < length; i++) {
      // Side signal contains harmonic richness
      harmonic[i] = (left[i] - right[i]) * 0.5;
    }
    
    // Apply windowing to smooth transitions
    const windowSize = Math.min(512, length);
    for (let i = 0; i < length; i += windowSize / 2) {
      const end = Math.min(i + windowSize, length);
      const slice = harmonic.slice(i, end);
      const windowed = AudioUtils.applyHannWindow(slice);
      harmonic.set(windowed, i);
    }
    
    return harmonic;
  }

  /**
   * Enhance high frequencies to preserve clarity
   */
  private enhanceHighFrequencies(samples: Float32Array, highFreqRatio: number): void {
    const enhancementFactor = 1.0 + (highFreqRatio * 0.2 * this.options.preserveRichness);
    
    // Simple high-pass filter approximation using differences
    for (let i = 1; i < samples.length; i++) {
      const highFreq = (samples[i] - samples[i - 1]) * 0.5;
      samples[i] += highFreq * (enhancementFactor - 1.0);
    }
  }

  /**
   * Apply volume compensation to maintain perceived loudness
   */
  private applyVolumeCompensation(samples: Float32Array, analysis: StereoAnalysis): Float32Array {
    const targetRMS = analysis.rmsLevel * this.options.volumeCompensation;
    
    // Apply intelligent gain based on stereo width
    // Wider stereo images often lose perceived volume in mono
    const widthCompensation = 1.0 + (analysis.width * 0.15);
    const adjustedTarget = targetRMS * widthCompensation;
    
    return AudioUtils.normalize(samples, adjustedTarget);
  }

  /**
   * Get stereo analysis for the input buffer
   */
  analyze(buffer: AudioBuffer): StereoAnalysis {
    return AudioUtils.analyzeStereo(buffer);
  }

  /**
   * Update conversion options
   */
  setOptions(options: Partial<ConversionOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
  }
}
