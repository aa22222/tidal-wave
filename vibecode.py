import librosa
import numpy as np
from dtw import dtw
from scipy.spatial.distance import euclidean

class AnimenzComparer:
    def __init__(self, reference_path, performance_path):
        self.reference_path = reference_path
        self.performance_path = performance_path

    def extract_features(self, path):
        """
        Extract onset timing, pitch, and dynamic (volume) profiles.
        Works for audio files and can later support MIDI parsing.
        """
        y, sr = librosa.load(path)
        onsets = librosa.frames_to_time(librosa.onset.onset_detect(y=y, sr=sr), sr=sr)
        S = np.abs(librosa.stft(y))
        rms = librosa.feature.rms(S=S).flatten()

        # Extract dominant frequency contour per frame
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        dominant_pitches = np.array([
            pitches[:, i][np.argmax(magnitudes[:, i])]
            if np.max(magnitudes[:, i]) > 0 else 0
            for i in range(pitches.shape[1])
        ])
        return onsets, dominant_pitches, rms

    def align_measures(self, ref_onsets, perf_onsets):
        """Align two onset sequences using Dynamic Time Warping (DTW)."""
        ref = np.expand_dims(ref_onsets, axis=1)
        perf = np.expand_dims(perf_onsets, axis=1)
        _, _, _, path = dtw(ref, perf, dist=euclidean)
        return path

    def compare(self):
        """Full comparison: timing, note accuracy, dynamics."""
        ref_onsets, ref_pitches, ref_rms = self.extract_features(self.reference_path)
        perf_onsets, perf_pitches, perf_rms = self.extract_features(self.performance_path)

        path = self.align_measures(ref_onsets, perf_onsets)
        ref_idx, perf_idx = path

        # Timing difference
        time_diff = perf_onsets[perf_idx] - ref_onsets[ref_idx]
        # Pitch deviation
        pitch_diff = np.abs(ref_pitches[ref_idx] - perf_pitches[perf_idx])
        # Dynamic difference
        rms_diff = np.abs(ref_rms[ref_idx] - perf_rms[perf_idx])

        suggestions = []
        for i, (td, pd, rd) in enumerate(zip(time_diff, pitch_diff, rms_diff)):
            if pd > 50:  # threshold for wrong note
                suggestions.append((i, "Wrong note detected"))
            elif abs(td) > 0.1:
                suggestions.append((i, f"Timing issue: playing {'fast' if td < 0 else 'slow'}"))
            elif rd > np.mean(rms_diff) * 1.5:
                suggestions.append((i, "Dynamic inconsistency"))

        ranked = sorted(suggestions, key=lambda s: ('Wrong' not in s[1], 'Timing' not in s[1]))
        return ranked

# Example usage:
# comparer = AnimenzComparer("reference.wav", "performance.wav")
# feedback = comparer.compare()
# print(feedback)
