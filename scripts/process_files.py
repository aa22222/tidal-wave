import sys
import os
import json
import librosa
import numpy as np
from scipy.spatial.distance import cdist
from librosa.sequence import dtw

def process_files(file1_path, file2_path):
    print("Processing files:")
    print(f"File 1: {file1_path}")
    print(f"File 2: {file2_path}")

    # Check that both files exist
    if not os.path.exists(file1_path):
        print(f"Error: File 1 does not exist at {file1_path}")
        sys.exit(1)
    if not os.path.exists(file2_path):
        print(f"Error: File 2 does not exist at {file2_path}")
        sys.exit(1)

    # Print file sizes for info
    file1_size = os.path.getsize(file1_path)
    file2_size = os.path.getsize(file2_path)
    print(f"File 1 size: {file1_size} bytes")
    print(f"File 2 size: {file2_size} bytes")

    # Load WAV audio (librosa handles .wav natively)
    try:
        sr = 22050  # standard sampling rate
        parent, _ = librosa.load(file1_path, sr=sr, mono=True)
        clip, _ = librosa.load(file2_path, sr=sr, mono=True)
    except Exception as e:
        print(f"Error loading audio files: {e}")
        sys.exit(1)

    print("Audio loaded successfully.")
    print(f"Parent length: {len(parent)} samples, Clip length: {len(clip)} samples")

    # Compute mel spectrograms
    n_mels = 64
    hop_length = 512
    S_parent = librosa.feature.melspectrogram(y=parent, sr=sr, n_mels=n_mels, hop_length=hop_length)
    S_clip = librosa.feature.melspectrogram(y=clip, sr=sr, n_mels=n_mels, hop_length=hop_length)

    # Convert to log scale
    logP_parent = librosa.power_to_db(S_parent)
    logP_clip = librosa.power_to_db(S_clip)

    # Transpose to (frames, features)
    X = logP_parent.T
    Y = logP_clip.T

    # Normalize along feature axis to account for amplitude differences
    X = (X - X.mean(axis=1, keepdims=True)) / (X.std(axis=1, keepdims=True) + 1e-8)
    Y = (Y - Y.mean(axis=1, keepdims=True)) / (Y.std(axis=1, keepdims=True) + 1e-8)

    # Compute pairwise cosine distances
    dist_matrix = cdist(X, Y, metric='cosine')

    # Compute subsequence DTW alignment path
    try:
        wp, cost = dtw(C=dist_matrix, subseq=True, backtrack=True)
    except Exception as e:
        print(f"Error running DTW: {e}")
        sys.exit(1)

    parent_indices = wp[:, 0]
    start_parent_frame = int(parent_indices.min())
    end_parent_frame = int(parent_indices.max())

    # Convert to time (seconds)
    start_time = start_parent_frame * hop_length / sr
    end_time = (end_parent_frame * hop_length + hop_length) / sr

    print("Processing completed successfully.")
    print(f"Clip best matches parent between {start_time:.2f}s and {end_time:.2f}s")

    result = {
        "status": "success",
        "start_time": start_time,
        "end_time": end_time,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Error: Two file paths are required as arguments")
        sys.exit(1)

    file1_path = sys.argv[1]
    file2_path = sys.argv[2]

    process_files(file1_path, file2_path)
