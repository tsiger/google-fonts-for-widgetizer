# google-fonts-for-widgetizer

A utility tool for managing Google Fonts in the Widgetizer project. This script helps you add Google Fonts to the `fonts.json` configuration file by automatically extracting font metadata from the Google Fonts API.

## Overview

The `add-font.js` script simplifies the process of adding Google Fonts to your fonts configuration. It reads font data from `google-fonts.json`, extracts relevant information (weights, category, etc.), and adds it to `fonts.json` in the correct format.

## Prerequisites

- Node.js installed on your system
- `google-fonts.json` file containing Google Fonts data
- `fonts.json` file with the existing fonts configuration

## Usage

To add a Google Font to your `fonts.json` file, run:

```bash
node add-font.js "Font Name"
```

### Examples

```bash
# Add a font with a single-word name
node add-font.js "Roboto"

# Add a font with multiple words (use quotes)
node add-font.js "Open Sans"

# Add a font with special characters
node add-font.js "IBM Plex Sans"
```

## How It Works

1. **Reads Configuration Files**: The script reads both `google-fonts.json` (source data) and `fonts.json` (target configuration).

2. **Finds Font Data**: It searches for the specified font name in `google-fonts.json` (case-insensitive match).

3. **Checks for Duplicates**: Verifies that the font doesn't already exist in `fonts.json`.

4. **Extracts Font Metadata**:

   - **Available Weights**: Extracts numeric font weights from variants (e.g., 100, 200, 300, 400, 500, etc.)
   - **Converts "regular"**: Maps the "regular" variant to weight 400
   - **Ignores Italics**: Skips italic variants (they end with "italic")
   - **Default Weight**: Uses 400 if available, otherwise the first available weight

5. **Creates Font Object**: Generates a font entry with:

   - `name`: Font family name
   - `stack`: CSS font-family stack (e.g., `"Roboto", sans-serif`)
   - `isGoogleFont`: Always `true`
   - `availableWeights`: Array of numeric weights
   - `defaultWeight`: Default font weight (typically 400)

6. **Updates fonts.json**: Adds the font to the `google` array and sorts all fonts alphabetically.

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

- **Missing font name**: Prompts for correct usage
- **Font not found**: Indicates the font doesn't exist in `google-fonts.json`
- **Duplicate font**: Warns if the font already exists in `fonts.json`
- **File read errors**: Reports issues reading JSON files
- **File write errors**: Reports issues writing to `fonts.json`

## Notes

- Font names are matched case-insensitively
- The script automatically sorts fonts alphabetically after adding
- Only non-italic font weights are included
- If no weights are found, the script defaults to weight 400
- The font stack uses the font's category (sans-serif, serif, etc.) as the fallback
