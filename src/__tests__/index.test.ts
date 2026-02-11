import { createConverter, convert, analyze, NeuroMono } from '../index';
import { AudioBuffer } from '../types';

describe('Public API', () => {
  let testBuffer: AudioBuffer;

  beforeEach(() => {
    const left = new Float32Array(1000);
    const right = new Float32Array(1000);
    
    for (let i = 0; i < left.length; i++) {
      left[i] = Math.sin(i * 0.1) * 0.5;
      right[i] = Math.sin(i * 0.1 + 0.5) * 0.5;
    }
    
    testBuffer = { left, right, sampleRate: 44100 };
  });

  describe('createConverter', () => {
    it('should create a NeuroMono instance', () => {
      const converter = createConverter();
      expect(converter).toBeInstanceOf(NeuroMono);
    });

    it('should accept initial options', () => {
      const converter = createConverter({
        preserveWidth: 0.9,
        preserveRichness: 0.8
      });
      
      const options = converter.getOptions();
      expect(options.preserveWidth).toBe(0.9);
      expect(options.preserveRichness).toBe(0.8);
    });
  });

  describe('convert', () => {
    it('should convert stereo to mono', () => {
      const mono = convert(testBuffer);
      
      expect(mono).toBeInstanceOf(Float32Array);
      expect(mono.length).toBe(testBuffer.left.length);
    });

    it('should accept options', () => {
      const mono = convert(testBuffer, {
        preserveWidth: 0.5,
        volumeCompensation: 1.2
      });
      
      expect(mono).toBeInstanceOf(Float32Array);
      expect(mono.length).toBe(testBuffer.left.length);
    });
  });

  describe('analyze', () => {
    it('should analyze stereo characteristics', () => {
      const analysis = analyze(testBuffer);
      
      expect(analysis).toHaveProperty('width');
      expect(analysis).toHaveProperty('richness');
      expect(analysis).toHaveProperty('rmsLevel');
      expect(analysis).toHaveProperty('peakLevel');
      expect(analysis).toHaveProperty('phaseCorrelation');
      expect(analysis).toHaveProperty('frequencyDistribution');
      
      expect(analysis.frequencyDistribution).toHaveProperty('low');
      expect(analysis.frequencyDistribution).toHaveProperty('mid');
      expect(analysis.frequencyDistribution).toHaveProperty('high');
    });
  });

  describe('NeuroMono', () => {
    it('should support fluent API', () => {
      const converter = new NeuroMono()
        .preserveWidth(0.8)
        .preserveRichness(0.9)
        .volumeCompensation(1.1)
        .quality(0.9)
        .spectralAnalysis(true);
      
      const options = converter.getOptions();
      expect(options.preserveWidth).toBe(0.8);
      expect(options.preserveRichness).toBe(0.9);
      expect(options.volumeCompensation).toBe(1.1);
      expect(options.quality).toBe(0.9);
      expect(options.spectralAnalysis).toBe(true);
    });

    it('should clamp values to valid ranges', () => {
      const converter = new NeuroMono()
        .preserveWidth(2.0)  // Should clamp to 1.0
        .preserveRichness(-0.5);  // Should clamp to 0.0
      
      const options = converter.getOptions();
      expect(options.preserveWidth).toBe(1.0);
      expect(options.preserveRichness).toBe(0.0);
    });

    it('should convert audio', () => {
      const converter = new NeuroMono()
        .preserveWidth(0.7)
        .preserveRichness(0.8);
      
      const mono = converter.convert(testBuffer);
      
      expect(mono).toBeInstanceOf(Float32Array);
      expect(mono.length).toBe(testBuffer.left.length);
    });

    it('should analyze audio', () => {
      const converter = new NeuroMono();
      const analysis = converter.analyze(testBuffer);
      
      expect(analysis).toHaveProperty('width');
      expect(analysis).toHaveProperty('richness');
    });

    it('should handle sample rate conversion', () => {
      const converter = new NeuroMono().sampleRate(22050);
      const mono = converter.convert(testBuffer);
      
      // Should be resampled to approximately half length
      expect(mono.length).toBeCloseTo(500, -2);
    });

    it('should setOptions after initialization', () => {
      const converter = new NeuroMono()
        .preserveWidth(0.5);
      
      converter.setOptions({ preserveWidth: 0.9, quality: 1.0 });
      
      const options = converter.getOptions();
      expect(options.preserveWidth).toBe(0.9);
      expect(options.quality).toBe(1.0);
    });

    it('should getOptions', () => {
      const converter = new NeuroMono()
        .preserveWidth(0.75)
        .quality(0.85);
      
      const options = converter.getOptions();
      
      expect(options.preserveWidth).toBe(0.75);
      expect(options.quality).toBe(0.85);
    });
  });
});
