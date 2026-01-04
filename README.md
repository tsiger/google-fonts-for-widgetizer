# Google fonts for Widgetizer

A utility tool for managing Google Fonts in the Widgetizer project. This script helps you add Google Fonts to the `fonts.json` configuration file by automatically extracting font metadata from the Google Fonts API.

## Overview

The `add-font.js` script simplifies the process of adding Google Fonts to your fonts configuration. It reads font data from `google-fonts.json`, extracts relevant information (weights, category, etc.), and adds it to `fonts.json` in the correct format.

## Prerequisites

- Node.js installed on your system
- `google-fonts.json` file containing Google Fonts data
- `fonts.json` file with the existing fonts configuration

## Usage

To add one or more Google Fonts to your `fonts.json` file, run:

```bash
node add-font.js "Font Name 1" "Font Name 2" ...
```

### Examples

```bash
# Add a single font
node add-font.js "Roboto"

# Add a font with multiple words (use quotes)
node add-font.js "Open Sans"

# Add multiple fonts at once
node add-font.js "Raleway" "Playfair Display" "Oswald"

# Add multiple fonts with special characters
node add-font.js "IBM Plex Sans" "Source Sans Pro" "PT Sans"
```

## How It Works

1. **Reads Configuration Files**: The script reads both `google-fonts.json` (source data) and `fonts.json` (target configuration).

2. **Processes Each Font**: For each font name provided as an argument:

   - **Finds Font Data**: Searches for the font name in `google-fonts.json` (case-insensitive match)
   - **Checks for Duplicates**: Verifies that the font doesn't already exist in `fonts.json`
   - **Extracts Font Metadata**:
     - **Available Weights**: Extracts numeric font weights from variants (e.g., 100, 200, 300, 400, 500, etc.)
     - **Converts "regular"**: Maps the "regular" variant to weight 400
     - **Ignores Italics**: Skips italic variants (they end with "italic")
     - **Default Weight**: Uses 400 if available, otherwise the first available weight
   - **Creates Font Object**: Generates a font entry with:
     - `name`: Font family name
     - `stack`: CSS font-family stack (e.g., `"Roboto", sans-serif`)
     - `isGoogleFont`: Always `true`
     - `availableWeights`: Array of numeric weights
     - `defaultWeight`: Default font weight (typically 400)
   - **Adds to Batch**: Collects all valid fonts to add

3. **Updates fonts.json**: Adds all valid fonts to the `google` array, sorts all fonts alphabetically, and writes the file once.

4. **Displays Summary**: Shows a summary of:
   - Successfully added fonts (with weights and default weight)
   - Skipped fonts (already exist)
   - Not found fonts (not in `google-fonts.json`)

## Output Format

The script adds fonts to `fonts.json` in this format:

```json
{
  "name": "Font Name",
  "stack": "\"Font Name\", sans-serif",
  "isGoogleFont": true,
  "availableWeights": [300, 400, 500, 600, 700],
  "defaultWeight": 400
}
```

## Error Handling

The script provides clear error messages for common issues:

- **Missing font names**: Prompts for correct usage if no font names are provided
- **Font not found**: Indicates fonts that don't exist in `google-fonts.json` (shown in summary)
- **Duplicate fonts**: Warns if fonts already exist in `fonts.json` (shown in summary, processing continues for other fonts)
- **File read errors**: Reports issues reading JSON files and exits
- **File write errors**: Reports issues writing to `fonts.json` and exits

When processing multiple fonts, the script continues processing even if some fonts fail, and displays a summary at the end showing what was added, skipped, or not found.

## Notes

- Font names are matched case-insensitively
- You can add multiple fonts in a single command
- The script processes all fonts before writing to `fonts.json` (single write operation)
- The script automatically sorts fonts alphabetically after adding
- Only non-italic font weights are included
- If no weights are found, the script defaults to weight 400
- The font stack uses the font's category (sans-serif, serif, etc.) as the fallback
- The script exits with an error code (1) if no fonts were successfully added
