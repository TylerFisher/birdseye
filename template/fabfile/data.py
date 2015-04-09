#!/usr/bin/env python

"""
Commands that update or process the application data.
"""

from glob import glob
import json

from fabric.api import task
from libxmp import consts
from libxmp.utils import file_to_dict

@task
def parse_images():
    images = []

    for image_path in glob('www/assets/*.jpg'):

        filename = image_path.split('/')[2]
        image = {
            'filename': filename,
            'tags': []
        }

        xmp = file_to_dict(image_path)
        dc = xmp[consts.XMP_NS_DC]

        for item in dc:
            if item[1] != '':
                if item[0].startswith('dc:subject'):
                    image['tags'].append(item[1])
                if item[0].startswith('dc:description') and item[1] != 'x-default':
                    image['caption'] = item[1]
                if item[0].startswith('dc:creator'):
                    image['creator'] = item[1]

        images.append(image)

    with open('data/images.json', 'w') as f:
        f.write(json.dumps(images))