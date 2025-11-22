#!/usr/bin/env python3
"""
Script to increment version in main.py before each commit.
Run this before committing to ensure version is always updated.
"""

from datetime import datetime
import re

# Read current main.py
with open('backend/app/main.py', 'r') as f:
    content = f.read()

# Extract current version
version_match = re.search(r'APP_VERSION = "([^"]+)"', content)
if version_match:
    current_version = version_match.group(1)
    # Extract the counter (last part after the last dash and 'v')
    parts = current_version.rsplit('-v', 1)
    if len(parts) == 2:
        counter = int(parts[1])
        new_counter = counter + 1
    else:
        new_counter = 1
else:
    new_counter = 1

# Generate new version
date_str = datetime.now().strftime('%Y-%m-%d')
new_version = f"{date_str}-fix-fk-violations-v{new_counter}"

# Replace version in main.py
new_content = re.sub(
    r'APP_VERSION = "[^"]+"',
    f'APP_VERSION = "{new_version}"',
    content
)

# Write back
with open('backend/app/main.py', 'w') as f:
    f.write(new_content)

print(f"✅ Version updated to: {new_version}")
