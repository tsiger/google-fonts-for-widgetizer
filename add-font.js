const fs = require("fs");
const path = require("path");

// Get font name from command line argument
const fontName = process.argv[2];

if (!fontName) {
  console.error("Error: Please provide a font name as an argument");
  console.error('Usage: node add-font.js "Font Name"');
  process.exit(1);
}

// Read google-fonts.json
const googleFontsPath = path.join(__dirname, "google-fonts.json");
const fontsPath = path.join(__dirname, "fonts.json");

let googleFonts, fonts;

try {
  googleFonts = JSON.parse(fs.readFileSync(googleFontsPath, "utf8"));
} catch (error) {
  console.error("Error reading google-fonts.json:", error.message);
  process.exit(1);
}

try {
  fonts = JSON.parse(fs.readFileSync(fontsPath, "utf8"));
} catch (error) {
  console.error("Error reading fonts.json:", error.message);
  process.exit(1);
}

// Find the font in google-fonts.json
const fontData = googleFonts.items.find(
  (item) => item.family.toLowerCase() === fontName.toLowerCase()
);

if (!fontData) {
  console.error(`Error: Font "${fontName}" not found in google-fonts.json`);
  process.exit(1);
}

// Check if font already exists in fonts.json
const existingFont = fonts.google.find(
  (f) => f.name.toLowerCase() === fontData.family.toLowerCase()
);

if (existingFont) {
  console.error(
    `Error: Font "${fontData.family}" already exists in fonts.json`
  );
  process.exit(1);
}

// Extract available weights from variants
// Convert "regular" to 400, numeric strings to numbers, ignore italic variants
const availableWeights = [];
fontData.variants.forEach((variant) => {
  // Skip italic variants (they end with "italic")
  if (variant.endsWith("italic")) {
    return;
  }

  // Convert "regular" to 400
  if (variant === "regular") {
    if (!availableWeights.includes(400)) {
      availableWeights.push(400);
    }
  } else {
    // Try to parse as number (e.g., "100", "200", "300", etc.)
    const weight = parseInt(variant, 10);
    if (!isNaN(weight) && !availableWeights.includes(weight)) {
      availableWeights.push(weight);
    }
  }
});

// Sort weights
availableWeights.sort((a, b) => a - b);

// If no weights found, default to 400
if (availableWeights.length === 0) {
  availableWeights.push(400);
}

// Determine the CSS font-family stack
const category = fontData.category || "sans-serif";
const stack = `"${fontData.family}", ${category}`;

// Create the font object
const newFont = {
  name: fontData.family,
  stack: stack,
  isGoogleFont: true,
  availableWeights: availableWeights,
  defaultWeight: availableWeights.includes(400) ? 400 : availableWeights[0],
};

// Add to fonts.json
fonts.google.push(newFont);

// Sort fonts alphabetically by name
fonts.google.sort((a, b) => a.name.localeCompare(b.name));

// Write back to fonts.json
try {
  fs.writeFileSync(fontsPath, JSON.stringify(fonts, null, 2) + "\n", "utf8");
  console.log(`Successfully added "${fontData.family}" to fonts.json`);
  console.log(`Available weights: ${availableWeights.join(", ")}`);
  console.log(`Default weight: ${newFont.defaultWeight}`);
} catch (error) {
  console.error("Error writing fonts.json:", error.message);
  process.exit(1);
}
