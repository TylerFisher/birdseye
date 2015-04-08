from libxmp import consts
from libxmp.utils import file_to_dict

xmp = file_to_dict('nprborderlands_0043.jpg')
dc = xmp[consts.XMP_NS_DC]

for item in dc:
	if item[0].startswith('dc:subject') and item[1] != '':
		print item[1]
	if item[0].startswith('dc:description') and item[1] != '':
		print item[1]
	if item[0].startswith('dc:creator') and item[1] != '':
		print item[1]