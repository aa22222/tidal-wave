import sys
import os
import json
import numpy as np
import librosa
import soundfile as sf
from scipy.spatial.distance import euclidean


def rms_db(y):
    """Calculate RMS in dB."""
    energy = np.sqrt(np.mean(np.square(y)) + 1e-12)
    return 20 * np.log10(energy + 1e-12)


def dtw_with_diagonal_constraint(cost_matrix, band_width=0.1):
    """
    DTW with Sakoe-Chiba band constraint to prevent path collapse.
    band_width: fraction of matrix size (0.1 = 10% deviation allowed)
    """
    N, M = cost_matrix.shape
    band = max(1, int(max(N, M) * band_width))
    
    # Initialize cumulative cost matrix
    D = np.full((N, M), np.inf)
    D[0, 0] = cost_matrix[0, 0]
    
    # Fill first row and column within band
    for i in range(1, min(N, band + 1)):
        D[i, 0] = D[i-1, 0] + cost_matrix[i, 0]
    for j in range(1, min(M, band + 1)):
        D[0, j] = D[0, j-1] + cost_matrix[0, j]
    
    # Dynamic programming with band constraint
    for i in range(1, N):
        j_start = max(1, i - band)
        j_end = min(M, i + band + 1)
        for j in range(j_start, j_end):
            cost = cost_matrix[i, j]
            D[i, j] = cost + min(D[i-1, j], D[i, j-1], D[i-1, j-1])
    
    # Backtrack
    path = [(N-1, M-1)]
    i, j = N-1, M-1
    while i > 0 or j > 0:
        if i == 0:
            j -= 1
        elif j == 0:
            i -= 1
        else:
            candidates = [
                (i-1, j-1, D[i-1, j-1]),
                (i-1, j, D[i-1, j]),
                (i, j-1, D[i, j-1])
            ]
            i, j, _ = min(candidates, key=lambda x: x[2])
        path.append((i, j))
    
    path.reverse()
    return np.array(path), D[N-1, M-1] / (N + M)


def segment_analysis(master_seg, performer_seg, sr, s_start, s_end, seg_id, outdir):
    """
    Analyze segment with improved DTW that prevents path collapse.
    """
    hop = 512
    n_mels = 40  # Reduced for more stable features
    n_fft = 2048

    # Use MFCC instead of mel spectrogram for more robust features
    mfcc_m = librosa.feature.mfcc(y=master_seg, sr=sr, n_mfcc=n_mels, hop_length=hop, n_fft=n_fft)
    mfcc_p = librosa.feature.mfcc(y=performer_seg, sr=sr, n_mfcc=n_mels, hop_length=hop, n_fft=n_fft)
    
    # Normalize per feature dimension
    X = mfcc_m.T
    Y = mfcc_p.T
    
    # Compute Euclidean distance (more stable than cosine for identical signals)
    N, M = X.shape[0], Y.shape[0]
    cost_matrix = np.zeros((N, M))
    for i in range(N):
        for j in range(M):
            cost_matrix[i, j] = euclidean(X[i], Y[j])
    
    # DTW with band constraint (allows max 20% deviation from diagonal)
    path, avg_cost = dtw_with_diagonal_constraint(cost_matrix, band_width=0.2)
    i, j = path[:, 0], path[:, 1]

    # Convert frame indices to time
    t_m = i * hop / sr
    t_p = j * hop / sr

    # Tempo estimation with better regression
    if len(t_m) > 10:
        # Remove outliers using RANSAC-like approach
        valid_idx = (t_m > 0.1) & (t_p > 0.1)  # Skip initial noisy frames
        t_m_clean = t_m[valid_idx]
        t_p_clean = t_p[valid_idx]
        
        if len(t_m_clean) > 5:
            # Fit: t_p = slope * t_m + offset
            A = np.vstack([t_m_clean, np.ones_like(t_m_clean)]).T
            result = np.linalg.lstsq(A, t_p_clean, rcond=None)
            slope, offset = result[0]
            residuals = result[1]
            
            # Check fit quality
            if len(residuals) > 0:
                rmse = np.sqrt(residuals[0] / len(t_m_clean))
            else:
                rmse = 0.0
            
            tempo_diff = (slope - 1.0) * 100.0
        else:
            slope = 1.0
            tempo_diff = 0.0
            rmse = 0.0
    else:
        slope = 1.0
        tempo_diff = 0.0
        rmse = 0.0

    # Extract aligned audio - use full segments since they should match
    master_start_sample = max(0, int(np.min(i) * hop))
    master_end_sample = min(len(master_seg), int(np.max(i) * hop) + hop)
    master_aligned = master_seg[master_start_sample:master_end_sample]
    
    performer_start_sample = max(0, int(np.min(j) * hop))
    performer_end_sample = min(len(performer_seg), int(np.max(j) * hop) + hop)
    performer_aligned = performer_seg[performer_start_sample:performer_end_sample]

    # Ensure valid segments
    if len(master_aligned) < sr * 0.1:
        master_aligned = master_seg
    if len(performer_aligned) < sr * 0.1:
        performer_aligned = performer_seg

    # Calculate RMS on aligned segments
    rms_m = rms_db(master_aligned)
    rms_p = rms_db(performer_aligned)
    loud_diff = rms_p - rms_m

    # Export segments
    # m_path = os.path.join(outdir, f"master_seg_{seg_id}.wav")
    # p_path = os.path.join(outdir, f"performer_seg_{seg_id}.wav")
    # sf.write(m_path, master_aligned, sr)
    # sf.write(p_path, performer_aligned, sr)

    return {
        "segment_id": seg_id,
        "master_time": [round(s_start, 3), round(s_end, 3)],
        "performer_time_range": [
            round(float(t_p.min()), 3), 
            round(float(t_p.max()), 3)
        ],
        "tempo_diff_percent": round(float(tempo_diff), 3),
        "loudness_db_diff": round(float(loud_diff), 3),
        "alignment_cost_mean": round(float(avg_cost), 5),
        "alignment_rmse": round(float(rmse), 5),
        # "master_segment_file": m_path,
        # "performer_segment_file": p_path,
    }


def process_files(m_path, p_path, seg_len=10, output_json="analysis_results.json"):
    """Process files and save results to JSON without printing."""
    
    sr = 22050
    
    # Load and trim
    m, _ = librosa.load(m_path, sr=sr, mono=True)
    p, _ = librosa.load(p_path, sr=sr, mono=True)
    m, _ = librosa.effects.trim(m, top_db=40)
    p, _ = librosa.effects.trim(p, top_db=40)

    # Setup
    seg_samples = int(seg_len * sr)
    # os.makedirs("segments_output", exist_ok=True)
    segments = []

    # Process segments
    n_segments = int(np.ceil(len(m) / seg_samples))
    
    for i in range(n_segments):
        m_start = i * seg_samples
        m_end = min((i + 1) * seg_samples, len(m))
        master_seg = m[m_start:m_end]
        
        if np.allclose(master_seg, 0, atol=1e-8) or len(master_seg) < sr * 0.5:
            continue
        
        p_start = min(i * seg_samples, len(p))
        p_end = min((i + 1) * seg_samples, len(p))
        
        if p_start >= len(p):
            continue
            
        performer_seg = p[p_start:p_end]
        
        # Match lengths
        if len(performer_seg) < len(master_seg):
            performer_seg = np.pad(
                performer_seg, 
                (0, len(master_seg) - len(performer_seg)), 
                mode='constant'
            )
        elif len(performer_seg) > len(master_seg):
            performer_seg = performer_seg[:len(master_seg)]
        
        result = segment_analysis(
            master_seg, performer_seg, sr, 
            m_start / sr, m_end / sr, i, "segments_output"
        )
        segments.append(result)

    # Calculate statistics
    if segments:
        tempo_diffs = [s["tempo_diff_percent"] for s in segments]
        loud_diffs = [s["loudness_db_diff"] for s in segments]
        
        summary = {
            "status": "success",
            "master_file": m_path,
            "performer_file": p_path,
            "total_segments": len(segments),
            "tempo_stats": {
                "mean": round(float(np.mean(tempo_diffs)), 3),
                "std": round(float(np.std(tempo_diffs)), 3),
                "min": round(float(np.min(tempo_diffs)), 3),
                "max": round(float(np.max(tempo_diffs)), 3),
            },
            "loudness_stats": {
                "mean": round(float(np.mean(loud_diffs)), 3),
                "std": round(float(np.std(loud_diffs)), 3),
                "min": round(float(np.min(loud_diffs)), 3),
                "max": round(float(np.max(loud_diffs)), 3),
            },
            "segments": segments
        }
    else:
        summary = {"status": "no_valid_segments", "segments": []}
    
    # Save to JSON file
    # with open(output_json, 'w') as f:
    #     json.dump(summary, f, indent=4)
    
    print(json.dumps(summary))
    return summary


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python audio_compare_v2.py <master.wav> <performer.wav> [output.json]")
        sys.exit(1)
    
    output_json = sys.argv[3] if len(sys.argv) > 3 else "analysis_results.json"
    process_files(sys.argv[1], sys.argv[2], output_json=output_json)
    # print(f"Analysis complete. Results saved to {output_json}")
