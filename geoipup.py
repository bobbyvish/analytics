import os
import shutil
import time
import subprocess

def copy_files(source_directory, destination_directory):
    file_list = os.listdir(source_directory)
    for file_name in file_list:
        source_path = os.path.join(source_directory, file_name)
        destination_path = os.path.join(destination_directory, file_name)
        shutil.copy2(source_path, destination_path)
    print("Files copied successfully!")

def execute_exe(exe_path):
    try:
        subprocess.run(['sudo', exe_path], shell=False)
        print("Executable file executed successfully!")
    except Exception as e:
        print(f"Error occurred while executing the executable file: {str(e)}")

# Example usage:
source_directory = "/usr/share/GeoIP"
destination_directory = "/home/sys15/MaxMind"
exe_path = "/usr/bin/geoipupdate"

while True:
    execute_exe(exe_path)
    copy_files(source_directory, destination_directory)
    time.sleep(10)