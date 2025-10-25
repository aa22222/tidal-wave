import numpy as np
import soundfile as sf
from scipy.signal import resample, stft
from scipy.spatial.distance import cdist
from scipy.spatial.distance import cosine
import json, sys, os
from fastdtw import fastdtw  # pip install fastdtw

sr = 22050
n_mels = 64
hop_length = 512

def load_audio(path, target_sr=22050, mono=True):
    data, sr = sf.read(path)
    # convert to mono
    if data.ndim > 1:
        data = data.mean(axis=1)
    # resample if needed
    if sr != target_sr:
        num_samples = int(len(data) * target_sr / sr)
        data = resample(data, num_samples)
        sr = target_sr
    # normalize
    data = (data - np.mean(data)) / (np.std(data) + 1e-8)
    return data, sr

def mel_filterbank(sr, n_fft, n_mels):
    # Simple Mel filterbank approximation
    def hz_to_mel(hz):
        return 2595 * np.log10(1 + hz / 700)
    def mel_to_hz(m):
        return 700 * (10**(m / 2595) - 1)

    f_min, f_max = 0, sr / 2
    m_min, m_max = hz_to_mel(f_min), hz_to_mel(f_max)
    m_points = np.linspace(m_min, m_max, n_mels + 2)
    hz_points = mel_to_hz(m_points)
    bin_points = np.floor((n_fft + 1) * hz_points / sr).astype(int)

    filters = np.zeros((n_mels, n_fft // 2 + 1))
    for m in range(1, n_mels + 1):
        f_m_minus, f_m, f_m_plus = bin_points[m-1], bin_points[m], bin_points[m+1]
        for k in range(f_m_minus, f_m):
            filters[m-1, k] = (k - f_m_minus) / max(1, f_m - f_m_minus)
        for k in range(f_m, f_m_plus):
            filters[m-1, k] = (f_m_plus - k) / max(1, f_m_plus - f_m)
    return filters

def compute_mel_spectrogram(y, sr, n_mels, hop_length):
    n_fft = 1024
    _, _, Zxx = stft(y, fs=sr, nperseg=n_fft, noverlap=n_fft-hop_length)
    S = np.abs(Zxx)**2
    mel_fb = mel_filterbank(sr, n_fft, n_mels)
    S_mel = mel_fb @ S
    S_db = 10 * np.log10(S_mel + 1e-10)
    return S_db

def get_match(parent, clip):
    logP_parent = compute_mel_spectrogram(parent, sr, n_mels, hop_length)
    logP_clip   = compute_mel_spectrogram(clip, sr, n_mels, hop_length)

    X = logP_parent.T
    Y = logP_clip.T

    X = (X - X.mean(axis=1, keepdims=True)) / (X.std(axis=1, keepdims=True) + 1e-8)
    Y = (Y - Y.mean(axis=1, keepdims=True)) / (Y.std(axis=1, keepdims=True) + 1e-8)

    cost, path = fastdtw(X, Y, dist=lambda a, b: cosine(a, b))

    # extract parent frame indices
    parent_indices = np.array([i for i, j in path])
    start_parent_frame = parent_indices.min()
    end_parent_frame = parent_indices.max()

    # convert frames -> time (seconds)
    start_time = start_parent_frame * hop_length / sr
    end_time = (end_parent_frame * hop_length + hop_length) / sr

    return (start_time, end_time) #
    # print(f"Clip best matches parent between {start_time:.2f}s and {end_time:.2f}s")

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
        parent, _ = load_audio(file1_path, target_sr=sr, mono=True)
        clip, _ = load_audio(file2_path, target_sr=sr, mono=True)
    except Exception as e:
        print(f"Error loading audio files: {e}")
        sys.exit(1)

    print("Audio loaded successfully.")
    print(f"Parent length: {len(parent)} samples, Clip length: {len(clip)} samples")

    start_time, end_time = get_match(parent, clip)

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