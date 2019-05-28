import sys
import subprocess

sys.path.append('./scripts')

import _json_translator
import _clean

#get file names
if (len(sys.argv) < 2):
    sys.exit()

filename = sys.argv[1]

# Clean the data
print('Cleaning species data...')
_clean.run(filename + '.csv')

# Transform species.csv to json:
print('Transforming to JSON...')
_json_translator.run(filename + '.csv', filename + '.data.json')

print('Done! :)')
