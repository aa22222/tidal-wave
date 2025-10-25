import sys
import os

def process_files(file1_path, file2_path):
    """
    Process two files and perform operations on them.

    Args:
        file1_path: Path to the first uploaded file
        file2_path: Path to the second uploaded file
    """
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

    # Perform your custom processing here
    # For example: data analysis, image processing, etc.

    print("Processing completed successfully!")

    # Return results (print to stdout, which Node.js will capture)
    result = {
        "status": "success",
        "file1_size": file1_size,
        "file2_size": file2_size,
        "total_size": file1_size + file2_size
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
