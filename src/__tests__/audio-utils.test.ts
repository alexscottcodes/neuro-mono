import { AudioUtils } from '../audio-utils';
import { AudioBuffer } from '../types';

describe('AudioUtils', () => {
  describe('analyzeStereo', () => {
    it('should analyze mono signal (identical channels)', () => {
      const samples = new Float32Array(1000);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin(i * 0.1) * 0.5;
      }
      
      const buffer: AudioBuffer = {
        left: samples,
        right: new Float32Array(samples),
        sampleRate: 44100
      };
      
      const analysis = AudioUtils.analyzeStereo(buffer);
      
      expect(analysis.width).toBeLessThan(0.1); // Very low width for mono
      expect(analysis.phaseCorrelation).toBeGreaterThan(0.5); // High correlation
    });

    it('should detect wide stereo image', () => {
      const left = new Float32Array(1000);
      const right = new Float32Array(1000);
      
      for (let i = 0; i < left.length; i++) {
        left[i] = Math.sin(i * 0.1) * 0.5;
        right[i] = Math.sin(i * 0.1 + Math.PI) * 0.5; // Inverted
      }
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      const analysis = AudioUtils.analyzeStereo(buffer);
      
      expect(analysis.width).toBeGreaterThan(0.3); // Significant width
    });

    it('should calculate valid RMS and peak levels', () => {
      const left = new Float32Array(1000);
      const right = new Float32Array(1000);
      
      for (let i = 0; i < left.length; i++) {
        left[i] = 0.5;
        right[i] = 0.5;
      }
      
      const buffer: AudioBuffer = { left, right, sampleRate: 44100 };
      const analysis = AudioUtils.analyzeStereo(buffer);
      
      expect(analysis.rmsLevel).toBeCloseTo(0.5, 1);
      expect(analysis.peakLevel).toBe(0.5);
    });
  });

  describe('calculateRMS', () => {
    it('should calculate correct RMS for constant signal', () => {
      const samples = new Float32Array(100).fill(0.5);
      const rms = AudioUtils.calculateRMS(samples);
      expect(rms).toBeCloseTo(0.5, 5);
    });

    it('should calculate correct RMS for sine wave', () => {
      const samples = new Float32Array(1000);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin(i * 0.1);
      }
      const rms = AudioUtils.calculateRMS(samples);
      expect(rms).toBeGreaterThan(0.6);
      expect(rms).toBeLessThan(0.8);
    });
  });

  describe('normalize', () => {
    it('should normalize to target RMS', () => {
      const samples = new Float32Array(100).fill(0.25);
      const normalized = AudioUtils.normalize(samples, 0.5);
      const rms = AudioUtils.calculateRMS(normalized);
      expect(rms).toBeCloseTo(0.5, 2);
    });

    it('should handle zero RMS', () => {
      const samples = new Float32Array(100).fill(0);
      const normalized = AudioUtils.normalize(samples, 0.5);
      expect(normalized).toEqual(samples);
    });
  });

  describe('softClip', () => {
    it('should not clip values below threshold', () => {
      const samples = new Float32Array([0.5, -0.5, 0.3, -0.3]);
      const clipped = AudioUtils.softClip(samples, 0.9);
      
      for (let i = 0; i < samples.length; i++) {
        expect(clipped[i]).toBeCloseTo(samples[i], 5);
      }
    });

    it('should clip values above threshold', () => {
      const samples = new Float32Array([1.5, -1.5]);
      const clipped = AudioUtils.softClip(samples, 0.9);
      
      expect(Math.abs(clipped[0])).toBeLessThan(1.5);
      expect(Math.abs(clipped[1])).toBeLessThan(1.5);
      expect(Math.abs(clipped[0])).toBeGreaterThan(0.9);
    });
  });

  describe('resample', () => {
    it('should downsample correctly', () => {
      const samples = new Float32Array(1000);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin(i * 0.1);
      }
      
      const resampled = AudioUtils.resample(samples, 44100, 22050);
      expect(resampled.length).toBeCloseTo(500, 0);
    });

    it('should upsample correctly', () => {
      const samples = new Float32Array(100);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = i / 100;
      }
      
      const resampled = AudioUtils.resample(samples, 22050, 44100);
      expect(resampled.length).toBeCloseTo(200, 0);
    });

    it('should return original if sample rates match', () => {
      const samples = new Float32Array(100);
      const resampled = AudioUtils.resample(samples, 44100, 44100);
      expect(resampled).toBe(samples);
    });
  });

  describe('applyHannWindow', () => {
    it('should apply window function', () => {
      const samples = new Float32Array(100).fill(1.0);
      const windowed = AudioUtils.applyHannWindow(samples);
      
      // First and last samples should be near zero
      expect(Math.abs(windowed[0])).toBeLessThan(0.01);
      expect(Math.abs(windowed[windowed.length - 1])).toBeLessThan(0.01);
      
      // Middle samples should be close to original
      expect(windowed[50]).toBeGreaterThan(0.9);
    });
  });
});
