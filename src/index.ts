import { AudioBuffer, ConversionOptions, StereoAnalysis } from './types';
import { StereoToMonoConverter } from './converter';
import { AudioUtils } from './audio-utils';

/**
 * Fluent API builder for stereo to mono conversion
 */
export class NeuroMono {
  private options: ConversionOptions = {};
  private converter?: StereoToMonoConverter;

  /**
   * Set stereo width preservation level (0.0 - 1.0)
   * Higher values preserve more stereo information in the mono mix
   * @default 0.7
   */
  preserveWidth(level: number): this {
    this.options.preserveWidth = Math.max(0, Math.min(1, level));
    return this;
  }

  /**
   * Set audio richness preservation level (0.0 - 1.0)
   * Higher values preserve more harmonic content and spectral detail
   * @default 0.8
   */
  preserveRichness(level: number): this {
    this.options.preserveRichness = Math.max(0, Math.min(1, level));
    return this;
  }

  /**
   * Set volume compensation factor
   * Values > 1.0 boost volume, < 1.0 reduce it
   * @default 1.1
   */
  volumeCompensation(factor: number): this {
    this.options.volumeCompensation = Math.max(0.5, Math.min(2.0, factor));
    return this;
  }

  /**
   * Set processing quality (0.0 - 1.0)
   * Higher quality = better results but slower processing
   * @default 0.8
   */
  quality(level: number): this {
    this.options.quality = Math.max(0, Math.min(1, level));
    return this;
  }

  /**
   * Enable or disable spectral analysis for better preservation
   * @default true
   */
  spectralAnalysis(enabled: boolean): this {
    this.options.spectralAnalysis = enabled;
    return this;
  }

  /**
   * Set target sample rate for processing
   * @default null (use source sample rate)
   */
  sampleRate(rate: number | null): this {
    this.options.sampleRate = rate;
    return this;
  }

  /**
   * Convert stereo audio buffer to mono
   */
  convert(buffer: AudioBuffer): Float32Array {
    if (!this.converter) {
      this.converter = new StereoToMonoConverter(this.options);
    }
    
    // Resample if needed
    let processedBuffer = buffer;
    if (this.options.sampleRate && this.options.sampleRate !== buffer.sampleRate) {
      processedBuffer = {
        left: AudioUtils.resample(buffer.left, buffer.sampleRate, this.options.sampleRate),
        right: AudioUtils.resample(buffer.right, buffer.sampleRate, this.options.sampleRate),
        sampleRate: this.options.sampleRate
      };
    }
    
    return this.converter.convert(processedBuffer);
  }

  /**
   * Analyze stereo audio characteristics without converting
   */
  analyze(buffer: AudioBuffer): StereoAnalysis {
    if (!this.converter) {
      this.converter = new StereoToMonoConverter(this.options);
    }
    return this.converter.analyze(buffer);
  }

  /**
   * Update options after initialization
   */
  setOptions(options: ConversionOptions): this {
    this.options = { ...this.options, ...options };
    if (this.converter) {
      this.converter.setOptions(options);
    }
    return this;
  }

  /**
   * Get current options
   */
  getOptions(): ConversionOptions {
    return { ...this.options };
  }
}

/**
 * Create a new NeuroMono converter instance
 */
export function createConverter(options?: ConversionOptions): NeuroMono {
  const converter = new NeuroMono();
  if (options) {
    converter.setOptions(options);
  }
  return converter;
}

/**
 * Quick convert function for simple use cases
 */
export function convert(buffer: AudioBuffer, options?: ConversionOptions): Float32Array {
  const converter = createConverter(options);
  return converter.convert(buffer);
}

/**
 * Quick analyze function for audio inspection
 */
export function analyze(buffer: AudioBuffer): StereoAnalysis {
  const converter = createConverter();
  return converter.analyze(buffer);
}

// Export types and utilities
export * from './types';
export { AudioUtils } from './audio-utils';
export { StereoToMonoConverter } from './converter';

// Default export
export default {
  createConverter,
  convert,
  analyze,
  NeuroMono
};
