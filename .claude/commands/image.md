---
description: Read the most recent screenshot from Desktop
allowed-tools: Bash, Read
---

Find and read the most recent screenshot from the user's Desktop:

1. Run this command to find the most recent screenshot:
   ```
   ls -t /Users/keegan/Desktop/Screenshot*.png 2>/dev/null | head -1
   ```

2. If no screenshot is found, inform the user.

3. If a screenshot is found, use the Read tool to read/view the image file at that path.

4. Describe what you see in the screenshot and ask the user what they'd like to do with it.

If the user provided arguments ($ARGUMENTS), use them as additional context for what to look for or do with the screenshot.
