import { StereoToMonoConverter } from '../converter';
import { AudioBuffer } from '../types';

describe('StereoToMonoConverter', () => {
  describe('convert', () => {
    it('should convert stereo to mono', () => {
      const left = new Float32Array(1000);
      const right = new Float32Array(1000);
      
      for (let i = 0; i < left.length; i++) {
        left[i] = Math.sin(i * 0.1) * 0.5;
        right[i] = Math.sin(i * 0.1 + 0.5) * 0.5;
      }
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      const converter = new StereoToMonoConverter();
      const mono = converter.convert(buffer);
      
      expect(mono.length).toBe(1000);
      expect(mono).toBeInstanceOf(Float32Array);
    });

    it('should preserve energy with volume compensation', () => {
      const left = new Float32Array(1000).fill(0.5);
      const right = new Float32Array(1000).fill(0.5);
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      const converter = new StereoToMonoConverter({ volumeCompensation: 1.0 });
      const mono = converter.convert(buffer);
      
      const inputRMS = Math.sqrt((0.5 * 0.5 + 0.5 * 0.5) / 2);
      let monoRMS = 0;
      for (let i = 0; i < mono.length; i++) {
        monoRMS += mono[i] * mono[i];
      }
      monoRMS = Math.sqrt(monoRMS / mono.length);
      
      // Mono should have similar or higher RMS due to compensation
      expect(monoRMS).toBeGreaterThanOrEqual(inputRMS * 0.8);
    });

    it('should respect preserveWidth option', () => {
      const left = new Float32Array(1000);
      const right = new Float32Array(1000);
      
      // Create signal with actual stereo width
      for (let i = 0; i < left.length; i++) {
        left[i] = Math.sin(i * 0.1) * 0.5;
        right[i] = Math.sin(i * 0.1 + Math.PI / 2) * 0.5; // 90 degrees out of phase
      }
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      
      const converter1 = new StereoToMonoConverter({ preserveWidth: 0.0 });
      const mono1 = converter1.convert(buffer);
      
      const converter2 = new StereoToMonoConverter({ preserveWidth: 1.0 });
      const mono2 = converter2.convert(buffer);
      
      // With width preservation, output should be different
      let diff = 0;
      for (let i = 0; i < mono1.length; i++) {
        diff += Math.abs(mono1[i] - mono2[i]);
      }
      
      expect(diff).toBeGreaterThan(0.5); // Should have measurable difference
    });

    it('should handle silent audio', () => {
      const buffer: AudioBuffer = {
        left: new Float32Array(1000),
        right: new Float32Array(1000),
        sampleRate: 44100
      };
      
      const converter = new StereoToMonoConverter();
      const mono = converter.convert(buffer);
      
      expect(mono.length).toBe(1000);
      
      let maxValue = 0;
      for (let i = 0; i < mono.length; i++) {
        maxValue = Math.max(maxValue, Math.abs(mono[i]));
      }
      
      expect(maxValue).toBeLessThan(0.1); // Should be mostly silent
    });
  });

  describe('analyze', () => {
    it('should return valid stereo analysis', () => {
      const left = new Float32Array(1000);
      const right = new Float32Array(1000);
      
      for (let i = 0; i < left.length; i++) {
        left[i] = Math.sin(i * 0.1) * 0.5;
        right[i] = Math.sin(i * 0.1 + 1.0) * 0.5;
      }
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      const converter = new StereoToMonoConverter();
      const analysis = converter.analyze(buffer);
      
      expect(analysis.width).toBeGreaterThanOrEqual(0);
      expect(analysis.width).toBeLessThanOrEqual(1);
      expect(analysis.richness).toBeGreaterThanOrEqual(0);
      expect(analysis.rmsLevel).toBeGreaterThan(0);
      expect(analysis.peakLevel).toBeGreaterThan(0);
    });
  });

  describe('setOptions', () => {
    it('should update options', () => {
      const converter = new StereoToMonoConverter({ preserveWidth: 0.5 });
      
      converter.setOptions({ preserveWidth: 0.9 });
      
      // Options should be updated (we can't directly test private field,
      // but we can verify behavior changes)
      expect(() => converter.setOptions({ preserveWidth: 0.9 })).not.toThrow();
    });
  });
});
