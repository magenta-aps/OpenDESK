# Syntax
#
# Add license header to a single file:
# $ python3 add_license_header.py path/to/file.ext
#
# Add license header to many file with the same extension (e.g. .ext):
# $ find path/to/files -name '*.ext' -exec python3 add_license_header.py {} \;
#


import os.path
import sys

HEADER_FILE = 'license_header.txt'
LICENSE_URL = 'http://mozilla.org/MPL/2.0/'
EXTENSION_COMMENT_MAP = {
    '.java': '//',
    '.js': '//',
#    '.ftl': '#',
}

src_file = sys.argv[1]
header_file = os.path.join(os.path.split(os.path.realpath(__file__))[0], HEADER_FILE)

with open(src_file, 'r') as fp:
    lines_file = fp.readlines()

with open(header_file, 'r') as fp:
    lines_header = fp.readlines()

# Check if header already present
for l in lines_file[:10]:
    if LICENSE_URL in l:
        # print('License already present')
        exit(0)

# Header not present - carry on...

extension = os.path.splitext(src_file)[-1]
if extension not in EXTENSION_COMMENT_MAP:
    print(extension + ' is not supported!')
    exit(0)

lines_header = [EXTENSION_COMMENT_MAP[extension] + ' ' + line for line in lines_header] + ['\n']

with open(sys.argv[1], 'w') as fp:
    fp.writelines(lines_header + lines_file)
