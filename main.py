import pandas as pd
import os
import glob

def process_all_files(input_dir="RAW_DATA", output_dir="FLAT_DATA"):
    """Flattens all raw lab.js CSV files from input_dir and saves them to output_dir."""
    if not os.path.exists(input_dir):
        print(f"Error: The folder '{input_dir}' does not exist.")
        return False

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: '{output_dir}'")

    csv_files = glob.glob(os.path.join(input_dir, "*.csv"))
    
    if not csv_files:
        print(f"No CSV files found in '{input_dir}'.")
        return False

    print(f"Found {len(csv_files)} files to process. Starting batch job...\n")
    
    success_count = 0
    error_count = 0

    tracking_cols = [
        'sender', 'sender_type', 'sender_id', 'timestamp', 'duration', 
        'ended_on', 'time_commit', 'time_end', 'time_render', 
        'time_run', 'time_show', 'time_switch'
    ]

    for file_path in csv_files:
        filename = os.path.basename(file_path)
        output_path = os.path.join(output_dir, filename)
        
        try:
            df = pd.read_csv(file_path)
            existing_tracking = [col for col in tracking_cols if col in df.columns]
            
            # Flatten the Answers
            df_answers = df.drop(columns=existing_tracking)
            if not df_answers.empty:
                df_flat_answers = df_answers.bfill().iloc[[0]].reset_index(drop=True)
            else:
                df_flat_answers = pd.DataFrame()

            # Process Timing Data
            timing_data = {}
            for index, row in df.iterrows():
                row_num = index + 1
                for col in existing_tracking:
                    new_col_name = f"{col}{row_num}"
                    timing_data[new_col_name] = row[col]
            
            df_timing = pd.DataFrame([timing_data])
            
            # Combine and Save
            df_final = pd.concat([df_flat_answers, df_timing], axis=1)
            df_final.to_csv(output_path, index=False)
            
            print(f"Processed: {filename}")
            success_count += 1
            
        except Exception as e:
            print(f"Failed to process '{filename}': {e}")
            error_count += 1

    print(f"\nFlattening Complete: {success_count} succeeded, {error_count} failed") 
    return True

def merge_flattened_files(input_dir="FLAT_DATA", output_file="merged_data.csv"):
    """Merges all flattened CSV files from input_dir into a single master CSV."""
    if not os.path.exists(input_dir):
        print(f"Error: The folder '{input_dir}' does not exist.")
        return

    csv_files = glob.glob(os.path.join(input_dir, "*.csv"))
    
    if not csv_files:
        print(f"No CSV files found in '{input_dir}' to merge.")
        return

    print(f"\nStarting merge of {len(csv_files)} files from '{input_dir}'...")
    
    dataframes = []
    
    for file in csv_files:
        # Prevent merging the output file into itself if it accidentally gets placed in FLAT_DATA
        if os.path.basename(file) == output_file:
            continue
            
        try:
            df = pd.read_csv(file)
            dataframes.append(df)
        except Exception as e:
            print(f"Failed to read '{file}' for merging: {e}")

    if dataframes:
        # pd.concat stacks all the rows on top of each other.
        # ignore_index=True ensures the final file has clean row numbers (0, 1, 2, 3...)
        merged_df = pd.concat(dataframes, ignore_index=True)
        
        merged_df.to_csv(output_file, index=False)
        print(f"Data merged into file: '{output_file}'")
    else:
        print("No valid data could be merged.")

if __name__ == "__main__":
    flattening_success = process_all_files(input_dir="RAW_DATA", output_dir="FLAT_DATA")
    
    if flattening_success:
        merge_flattened_files(input_dir="FLAT_DATA", output_file="FLAT_DATA/merged_data.csv")
