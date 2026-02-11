/**
 * Basic usage examples for NeuroMono
 */

import { createConverter, convert, analyze } from '../src';

// Example 1: Simple conversion
function example1_SimpleConversion() {
  console.log('Example 1: Simple Conversion\n');
  
  // Create a test stereo buffer (sine wave with different phases)
  const sampleRate = 44100;
  const duration = 1; // 1 second
  const frequency = 440; // A4 note
  const samples = sampleRate * duration;
  
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    left[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    right[i] = Math.sin(2 * Math.PI * frequency * t + Math.PI / 4) * 0.5; // Phase shifted
  }
  
  const stereoBuffer = { left, right, sampleRate };
  
  // Convert to mono
  const mono = convert(stereoBuffer);
  
  console.log(`Input: ${samples} stereo samples`);
  console.log(`Output: ${mono.length} mono samples`);
  console.log(`Sample values: [${mono.slice(0, 5).join(', ')}...]`);
  console.log('');
}

// Example 2: Custom configuration
function example2_CustomConfiguration() {
  console.log('Example 2: Custom Configuration\n');
  
  const sampleRate = 48000;
  const samples = 48000; // 1 second
  
  // Create stereo buffer with wide stereo image
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    left[i] = Math.random() * 0.4 - 0.2; // Noise
    right[i] = Math.random() * 0.4 - 0.2; // Different noise
  }
  
  const stereoBuffer = { left, right, sampleRate };
  
  // Create converter with high preservation settings
  const converter = createConverter()
    .preserveWidth(0.9)
    .preserveRichness(0.95)
    .volumeCompensation(1.2)
    .quality(1.0);
  
  const mono = converter.convert(stereoBuffer);
  
  console.log('Configuration:');
  console.log('  - Width preservation: 0.9');
  console.log('  - Richness preservation: 0.95');
  console.log('  - Volume compensation: 1.2x');
  console.log('  - Quality: 1.0 (maximum)');
  console.log(`Output: ${mono.length} samples`);
  console.log('');
}

// Example 3: Stereo analysis
function example3_StereoAnalysis() {
  console.log('Example 3: Stereo Analysis\n');
  
  const sampleRate = 44100;
  const samples = 44100;
  
  // Create stereo buffer
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  
  // Complex waveform with harmonics
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    left[i] = 
      Math.sin(2 * Math.PI * 440 * t) * 0.5 +
      Math.sin(2 * Math.PI * 880 * t) * 0.25 +
      Math.sin(2 * Math.PI * 1320 * t) * 0.125;
    
    right[i] = 
      Math.sin(2 * Math.PI * 440 * t + 0.5) * 0.5 +
      Math.sin(2 * Math.PI * 880 * t + 0.3) * 0.25 +
      Math.sin(2 * Math.PI * 1320 * t + 0.2) * 0.125;
  }
  
  const stereoBuffer = { left, right, sampleRate };
  
  // Analyze stereo characteristics
  const analysis = analyze(stereoBuffer);
  
  console.log('Stereo Analysis Results:');
  console.log(`  - Stereo Width: ${(analysis.width * 100).toFixed(1)}%`);
  console.log(`  - Spectral Richness: ${(analysis.richness * 100).toFixed(1)}%`);
  console.log(`  - RMS Level: ${analysis.rmsLevel.toFixed(4)}`);
  console.log(`  - Peak Level: ${analysis.peakLevel.toFixed(4)}`);
  console.log(`  - Phase Correlation: ${analysis.phaseCorrelation.toFixed(4)}`);
  console.log('  - Frequency Distribution:');
  console.log(`    - Low: ${(analysis.frequencyDistribution.low * 100).toFixed(1)}%`);
  console.log(`    - Mid: ${(analysis.frequencyDistribution.mid * 100).toFixed(1)}%`);
  console.log(`    - High: ${(analysis.frequencyDistribution.high * 100).toFixed(1)}%`);
  console.log('');
}

// Example 4: Adaptive processing
function example4_AdaptiveProcessing() {
  console.log('Example 4: Adaptive Processing\n');
  
  const sampleRate = 44100;
  const samples = 44100;
  
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  
  // Wide stereo with rich harmonics
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    left[i] = Math.sin(2 * Math.PI * 220 * t) * 0.6;
    right[i] = Math.sin(2 * Math.PI * 330 * t) * 0.6; // Different frequency
  }
  
  const stereoBuffer = { left, right, sampleRate };
  
  // Create converter
  const converter = createConverter();
  
  // Analyze first
  const analysis = converter.analyze(stereoBuffer);
  
  console.log('Detected characteristics:');
  console.log(`  - Width: ${(analysis.width * 100).toFixed(1)}%`);
  console.log(`  - Richness: ${(analysis.richness * 100).toFixed(1)}%`);
  
  // Adjust settings based on analysis
  if (analysis.width > 0.7) {
    console.log('  → High stereo width detected, increasing preservation');
    converter.preserveWidth(0.9);
  }
  
  if (analysis.richness > 0.6) {
    console.log('  → Rich harmonic content detected, increasing preservation');
    converter.preserveRichness(0.9);
  }
  
  // Convert with adaptive settings
  const mono = converter.convert(stereoBuffer);
  
  console.log(`\nConverted: ${mono.length} samples`);
  console.log('');
}

// Example 5: Comparing presets
function example5_ComparingPresets() {
  console.log('Example 5: Comparing Presets\n');
  
  const sampleRate = 44100;
  const samples = 22050; // 0.5 seconds
  
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    left[i] = Math.sin(2 * Math.PI * 440 * t) * 0.5;
    right[i] = Math.sin(2 * Math.PI * 440 * t + 1.0) * 0.5;
  }
  
  const stereoBuffer = { left, right, sampleRate };
  
  // Voice/Podcast preset
  const voiceConverter = createConverter()
    .preserveWidth(0.3)
    .preserveRichness(0.6)
    .volumeCompensation(1.2);
  
  const voiceMono = voiceConverter.convert(stereoBuffer);
  console.log('Voice Preset:');
  console.log(`  - Width: 0.3, Richness: 0.6, Volume: 1.2x`);
  console.log(`  - RMS: ${calculateRMS(voiceMono).toFixed(4)}`);
  
  // Music preset
  const musicConverter = createConverter()
    .preserveWidth(0.9)
    .preserveRichness(0.95)
    .volumeCompensation(1.1);
  
  const musicMono = musicConverter.convert(stereoBuffer);
  console.log('\nMusic Preset:');
  console.log(`  - Width: 0.9, Richness: 0.95, Volume: 1.1x`);
  console.log(`  - RMS: ${calculateRMS(musicMono).toFixed(4)}`);
  
  // Fast preset
  const fastConverter = createConverter()
    .preserveWidth(0.5)
    .preserveRichness(0.5)
    .quality(0.5)
    .spectralAnalysis(false);
  
  const fastMono = fastConverter.convert(stereoBuffer);
  console.log('\nFast Preset:');
  console.log(`  - Width: 0.5, Richness: 0.5, Quality: 0.5`);
  console.log(`  - RMS: ${calculateRMS(fastMono).toFixed(4)}`);
  console.log('');
}

// Helper function
function calculateRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

// Run all examples
function runAllExamples() {
  console.log('='.repeat(60));
  console.log('NeuroMono - Usage Examples');
  console.log('='.repeat(60));
  console.log('');
  
  example1_SimpleConversion();
  example2_CustomConfiguration();
  example3_StereoAnalysis();
  example4_AdaptiveProcessing();
  example5_ComparingPresets();
  
  console.log('='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

export {
  example1_SimpleConversion,
  example2_CustomConfiguration,
  example3_StereoAnalysis,
  example4_AdaptiveProcessing,
  example5_ComparingPresets,
  runAllExamples
};
