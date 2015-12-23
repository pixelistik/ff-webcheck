#!/usr/bin/env python
"""
Extract the IPv4 range information from all the community files
"""
import yaml
import json
import sys
import os

base_path = os.path.join(os.path.dirname(__file__), "icvpn-meta")

communities = []

for community_file_path in os.listdir(base_path):
    try:
        f = file(os.path.join(base_path, community_file_path))
        data = yaml.load(f)
        f.close()

        community = {
            "name": community_file_path.split("/")[-1],
            "range":  data["networks"]["ipv4"][0]
        }

        communities.append(community)
    except:
        pass

print json.dumps(communities, indent=4)
