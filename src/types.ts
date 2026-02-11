/**
 * Configuration options for stereo to mono conversion
 */
export interface ConversionOptions {
  /** Preserve stereo width information (0.0 = no preservation, 1.0 = maximum preservation) */
  preserveWidth?: number;
  
  /** Preserve audio richness through harmonic analysis (0.0 = no preservation, 1.0 = maximum) */
  preserveRichness?: number;
  
  /** Volume compensation factor (1.0 = no change, >1.0 = boost) */
  volumeCompensation?: number;
  
  /** Sample rate for processing (null = use source sample rate) */
  sampleRate?: number | null;
  
  /** Neural network processing quality (0-1, higher = better but slower) */
  quality?: number;
  
  /** Enable advanced spectral analysis for better preservation */
  spectralAnalysis?: boolean;
}

/**
 * Audio buffer representation
 */
export interface AudioBuffer {
  /** Left channel samples */
  left: Float32Array;
  
  /** Right channel samples */
  right: Float32Array;
  
  /** Sample rate in Hz */
  sampleRate: number;
}

/**
 * Analysis results for stereo audio
 */
export interface StereoAnalysis {
  /** Stereo width (0.0 = mono, 1.0 = maximum stereo separation) */
  width: number;
  
  /** Spectral richness (harmonic content density) */
  richness: number;
  
  /** RMS volume level */
  rmsLevel: number;
  
  /** Peak volume level */
  peakLevel: number;
  
  /** Phase correlation (-1 to 1, 1 = in phase, -1 = out of phase) */
  phaseCorrelation: number;
  
  /** Frequency distribution (low, mid, high energy) */
  frequencyDistribution: {
    low: number;
    mid: number;
    high: number;
  };
}

/**
 * Neural network layer configuration
 */
export interface NeuralLayer {
  weights: Float32Array[];
  biases: Float32Array;
  activation: 'relu' | 'tanh' | 'sigmoid' | 'linear';
}
