import sys
import os

def process_files(file1_path, file2_path):
    print(f"Processing files:")
    print(f"File 1: {file1_path}")
    print(f"File 2: {file2_path}")

    # Check if files exist
    if not os.path.exists(file1_path):
        print(f"Error: File 1 does not exist at {file1_path}")
        sys.exit(1)

    if not os.path.exists(file2_path):
        print(f"Error: File 2 does not exist at {file2_path}")
        sys.exit(1)

    # Get file information
    file1_size = os.path.getsize(file1_path)
    file2_size = os.path.getsize(file2_path)

    print(f"File 1 size: {file1_size} bytes")
    print(f"File 2 size: {file2_size} bytes")

    # Example: Read and process files (customize based on your needs)
    try:
        with open(file1_path, 'r') as f1:
            content1 = f1.read()
            print(f"File 1 content length: {len(content1)} characters")
    except Exception as e:
        print(f"Could not read File 1 as text: {e}")

    try:
        with open(file2_path, 'r') as f2:
            content2 = f2.read()
            print(f"File 2 content length: {len(content2)} characters")
    except Exception as e:
        print(f"Could not read File 2 as text: {e}")
    
    import librosa
    import numpy as np
    from librosa.sequence import dtw

    # load (mono) - choose a moderate sr (e.g. 22050)
    sr = 22050
    parent, _ = librosa.load(file1_path, sr=sr, mono=True)
    clip, _   = librosa.load(file2_path, sr=sr, mono=True)

    # compute log-mel spectrograms (or MFCCs)
    n_mels = 64
    hop_length = 512
    S_parent = librosa.feature.melspectrogram(parent, sr=sr, n_mels=n_mels, hop_length=hop_length)
    S_clip   = librosa.feature.melspectrogram(clip, sr=sr,   n_mels=n_mels, hop_length=hop_length)

    # convert to log-power
    logP_parent = librosa.power_to_db(S_parent)
    logP_clip   = librosa.power_to_db(S_clip)

    # optionally reduce dimensionality with PCA if parent is huge (not shown)

    # compute frame distance matrix (cosine or Euclidean)
    # transpose so shape=(frames, features)
    X = logP_parent.T
    Y = logP_clip.T

    # normalize frames (helps with amplitude differences)
    X = (X - X.mean(axis=1, keepdims=True)) / (X.std(axis=1, keepdims=True) + 1e-8)
    Y = (Y - Y.mean(axis=1, keepdims=True)) / (Y.std(axis=1, keepdims=True) + 1e-8)

    # distance matrix: use Euclidean squared
    D = librosa.segment.cross_similarity(X.T, Y.T)  # alt: compute pairwise manually
    # but simplest: use librosa.sequence.dtw with a cost matrix
    cost = librosa.sequence.__spectral_contrast__ # (not needed) -> we'll compute manual cost below

    # manual distance:
    from scipy.spatial.distance import cdist
    dist = cdist(X, Y, metric='cosine')

    # run DTW (constrain with a Sakoe-Chiba band radius for speed)
    # steps: use librosa.sequence.dtw
    wp, wp_cost = dtw(dist, subseq=True, backtrack=True)

    # 'wp' gives the optimal alignment path (as array of (parent_frame_index, clip_frame_index))
    # If subseq=True, DTW finds the best subsequence in parent matching the entire clip.
    # Find start/end parent frame indices:
    parent_indices = wp[:, 0]
    clip_indices = wp[:, 1]

    start_parent_frame = parent_indices.min()
    end_parent_frame   = parent_indices.max()

    # convert frames -> time (seconds)
    start_time = start_parent_frame * hop_length / sr
    end_time   = (end_parent_frame * hop_length + hop_length) / sr

    print("Processing completed successfully!")

    print(f"Clip best matches parent between {start_time:.2f}s and {end_time:.2f}s")

    # Return results (print to stdout, which Node.js will capture)
    result = {
        "status": "success",
        "start_time": start_time,
        "end_time": end_time,
    }

    # Output JSON result
    import json
    print(json.dumps(result))


    

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Error: Two file paths are required as arguments")
        sys.exit(1)

    file1_path = sys.argv[1]
    file2_path = sys.argv[2]

    process_files(file1_path, file2_path)
