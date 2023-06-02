import os
import subprocess
from . import settings
from datetime import datetime

def fetch_and_update_geolite_data_for_city_and_country():

    for file_name in os.listdir(settings.GEOIP_PATH):
        if file_name.endswith('.mmdb'):
            os.remove(os.path.join(settings.GEOIP_PATH, file_name))

    exe_command= ['geoipupdate','-v','-f',settings.GEOIP_CONFIG_FILE,'-d',settings.GEOIP_PATH]

    result = subprocess.run(exe_command, stdout = subprocess.PIPE).stdout.decode('utf-8')
    print(f"Updated at {datetime.now()}")
    print(result)
    

