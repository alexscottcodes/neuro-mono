# NeuroMono

Neural network-based intelligent stereo to mono audio conversion that preserves quality, wideness, volume, and richness.

## Features

- 🧠 **Neural Network Processing**: Intelligently analyzes stereo characteristics and optimizes downmix weights
- 🎵 **Quality Preservation**: Maintains audio richness through harmonic analysis and spectral processing
- 📊 **Stereo Width Preservation**: Captures and retains stereo imaging information in the mono mix
- 🔊 **Volume Compensation**: Automatically adjusts volume to maintain perceived loudness
- ⚡ **Fast & Efficient**: Optimized algorithms for real-time processing capabilities
- 🎛️ **Flexible API**: Fluent builder pattern for easy configuration

## Installation

```bash
npm install neuro-mono
```

## Quick Start

### Simple Conversion

```typescript
import { convert } from 'neuro-mono';

// Your stereo audio buffer
const stereoBuffer = {
  left: new Float32Array([...]), // Left channel samples
  right: new Float32Array([...]), // Right channel samples
  sampleRate: 44100
};

// Convert to mono
const monoAudio = convert(stereoBuffer);
```

### With Custom Options

```typescript
import { createConverter } from 'neuro-mono';

const converter = createConverter()
  .preserveWidth(0.8)        // High stereo width preservation
  .preserveRichness(0.9)     // Maximum richness preservation
  .volumeCompensation(1.15)  // 15% volume boost
  .quality(0.9)              // High quality processing
  .spectralAnalysis(true);   // Enable spectral analysis

const monoAudio = converter.convert(stereoBuffer);
```

### Analyze Stereo Characteristics

```typescript
import { analyze } from 'neuro-mono';

const analysis = analyze(stereoBuffer);

console.log('Stereo Width:', analysis.width);
console.log('Spectral Richness:', analysis.richness);
console.log('RMS Level:', analysis.rmsLevel);
console.log('Phase Correlation:', analysis.phaseCorrelation);
console.log('Frequency Distribution:', analysis.frequencyDistribution);
```

## API Reference

### `createConverter(options?: ConversionOptions): NeuroMono`

Creates a new converter instance with optional initial configuration.

### `convert(buffer: AudioBuffer, options?: ConversionOptions): Float32Array`

Quick conversion function. Returns mono audio as Float32Array.

### `analyze(buffer: AudioBuffer): StereoAnalysis`

Analyzes stereo audio characteristics without converting.

## Configuration Options

### `preserveWidth(level: number): this`
- **Range**: 0.0 - 1.0
- **Default**: 0.7
- **Description**: Controls how much stereo width information is preserved in the mono mix. Higher values retain more spatial information.

### `preserveRichness(level: number): this`
- **Range**: 0.0 - 1.0
- **Default**: 0.8
- **Description**: Controls preservation of harmonic content and spectral detail. Higher values maintain more audio richness.

### `volumeCompensation(factor: number): this`
- **Range**: 0.5 - 2.0
- **Default**: 1.1
- **Description**: Volume compensation factor. Values > 1.0 boost volume, < 1.0 reduce it. Compensates for perceived loudness loss during stereo-to-mono conversion.

### `quality(level: number): this`
- **Range**: 0.0 - 1.0
- **Default**: 0.8
- **Description**: Processing quality level. Higher quality provides better results but may be slower.

### `spectralAnalysis(enabled: boolean): this`
- **Default**: true
- **Description**: Enable advanced spectral analysis for better harmonic preservation.

### `sampleRate(rate: number | null): this`
- **Default**: null (uses source sample rate)
- **Description**: Target sample rate for processing. Set to resample during conversion.

## Audio Buffer Format

```typescript
interface AudioBuffer {
  left: Float32Array;    // Left channel samples (-1.0 to 1.0)
  right: Float32Array;   // Right channel samples (-1.0 to 1.0)
  sampleRate: number;    // Sample rate in Hz (e.g., 44100, 48000)
}
```

## Analysis Results

```typescript
interface StereoAnalysis {
  width: number;                    // Stereo width (0.0 = mono, 1.0 = max separation)
  richness: number;                 // Spectral richness (harmonic density)
  rmsLevel: number;                 // RMS volume level
  peakLevel: number;                // Peak volume level
  phaseCorrelation: number;         // Phase correlation (-1 to 1)
  frequencyDistribution: {
    low: number;                    // Low frequency energy ratio
    mid: number;                    // Mid frequency energy ratio
    high: number;                   // High frequency energy ratio
  };
}
```

## Advanced Examples

### Processing with Different Presets

```typescript
import { createConverter } from 'neuro-mono';

// Podcast/Voice preset - focus on clarity
const voiceConverter = createConverter()
  .preserveWidth(0.3)
  .preserveRichness(0.6)
  .volumeCompensation(1.2);

// Music preset - maximum quality
const musicConverter = createConverter()
  .preserveWidth(0.9)
  .preserveRichness(0.95)
  .volumeCompensation(1.1)
  .quality(1.0);

// Fast preset - for real-time processing
const fastConverter = createConverter()
  .preserveWidth(0.5)
  .preserveRichness(0.5)
  .quality(0.5)
  .spectralAnalysis(false);
```

### Batch Processing

```typescript
import { createConverter } from 'neuro-mono';

const converter = createConverter()
  .preserveWidth(0.8)
  .preserveRichness(0.8);

const stereoBuffers = [...]; // Array of stereo buffers

const monoBuffers = stereoBuffers.map(buffer => 
  converter.convert(buffer)
);
```

### Integration with Web Audio API

```typescript
import { createConverter } from 'neuro-mono';

async function convertWebAudioBuffer(audioBuffer: AudioBuffer) {
  // Extract channels
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  
  // Convert
  const converter = createConverter()
    .preserveWidth(0.8)
    .preserveRichness(0.85);
  
  const mono = converter.convert({
    left: new Float32Array(left),
    right: new Float32Array(right),
    sampleRate: audioBuffer.sampleRate
  });
  
  // Create new mono AudioBuffer
  const audioContext = new AudioContext();
  const monoBuffer = audioContext.createBuffer(
    1, // mono
    mono.length,
    audioBuffer.sampleRate
  );
  
  monoBuffer.copyToChannel(mono, 0);
  return monoBuffer;
}
```

### Dynamic Quality Adjustment

```typescript
import { createConverter } from 'neuro-mono';

const converter = createConverter();

// Analyze first
const analysis = converter.analyze(stereoBuffer);

// Adjust settings based on analysis
if (analysis.width > 0.7) {
  // Wide stereo image - preserve more width
  converter.preserveWidth(0.9);
}

if (analysis.richness > 0.8) {
  // Rich harmonic content - preserve more richness
  converter.preserveRichness(0.95);
}

const mono = converter.convert(stereoBuffer);
```

## How It Works

NeuroMono uses a multi-stage intelligent processing pipeline:

1. **Stereo Analysis**: Analyzes stereo width, phase correlation, spectral richness, and frequency distribution
2. **Neural Network Processing**: A pre-trained neural network determines optimal mixing weights based on audio characteristics
3. **Intelligent Downmix**: Combines left and right channels using neural network weights while preserving side information
4. **Harmonic Preservation**: Extracts and reintroduces harmonic content to maintain audio richness
5. **Frequency Enhancement**: Preserves high-frequency clarity that's often lost in traditional downmixing
6. **Volume Compensation**: Adjusts volume to maintain perceived loudness, accounting for stereo width loss

### Why Not Just Average L+R?

Traditional stereo-to-mono conversion simply averages left and right channels: `mono = (L + R) / 2`. This approach loses:

- **Stereo Width Information**: Spatial positioning is completely discarded
- **Harmonic Richness**: Side channel harmonics are lost
- **Perceived Volume**: Wide stereo mixes lose perceived loudness
- **Frequency Balance**: High-frequency content in out-of-phase signals cancels out

NeuroMono preserves these characteristics through intelligent analysis and processing.

## Performance

Typical processing speed on modern hardware:
- **44.1kHz stereo audio**: ~50-100x real-time (quality=0.8)
- **48kHz stereo audio**: ~40-80x real-time (quality=0.8)
- **Fast preset**: ~200-400x real-time

## Browser Support

NeuroMono works in any JavaScript environment:
- ✅ Node.js 16+
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Electron
- ✅ React Native (with appropriate audio buffer handling)

## TypeScript

NeuroMono is written in TypeScript and includes full type definitions.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Developed with ❤️ by Alex Scott