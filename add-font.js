const fs = require("fs");
const path = require("path");

// Get font names from command line arguments (starting from index 2)
const fontNames = process.argv.slice(2);

if (fontNames.length === 0) {
  console.error("Error: Please provide at least one font name as an argument");
  console.error('Usage: node add-font.js "Font Name 1" "Font Name 2" ...');
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

// Track results
const added = [];
const skipped = [];
const notFound = [];

// Process each font name
fontNames.forEach((fontName) => {
  // Find the font in google-fonts.json
  const fontData = googleFonts.items.find(
    (item) => item.family.toLowerCase() === fontName.toLowerCase()
  );

  if (!fontData) {
    notFound.push(fontName);
    console.error(`Error: Font "${fontName}" not found in google-fonts.json`);
    return;
  }

  // Check if font already exists in fonts.json
  const existingFont = fonts.google.find(
    (f) => f.name.toLowerCase() === fontData.family.toLowerCase()
  );

  if (existingFont) {
    skipped.push(fontData.family);
    console.error(
      `Error: Font "${fontData.family}" already exists in fonts.json`
    );
    return;
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
  added.push({
    name: fontData.family,
    weights: availableWeights,
    defaultWeight: newFont.defaultWeight,
  });
});

// Sort fonts alphabetically by name
fonts.google.sort((a, b) => a.name.localeCompare(b.name));

// Write back to fonts.json (only if we added at least one font)
if (added.length > 0) {
  try {
    fs.writeFileSync(fontsPath, JSON.stringify(fonts, null, 2) + "\n", "utf8");
  } catch (error) {
    console.error("Error writing fonts.json:", error.message);
    process.exit(1);
  }
}

// Print summary
console.log("\n=== Summary ===");
if (added.length > 0) {
  console.log(`\n✅ Successfully added ${added.length} font(s):`);
  added.forEach((font) => {
    console.log(`   - ${font.name}`);
    console.log(
      `     Weights: ${font.weights.join(", ")} | Default: ${
        font.defaultWeight
      }`
    );
  });
}

if (skipped.length > 0) {
  console.log(`\n⚠️  Skipped ${skipped.length} font(s) (already exists):`);
  skipped.forEach((font) => console.log(`   - ${font}`));
}

if (notFound.length > 0) {
  console.log(`\n❌ Not found ${notFound.length} font(s):`);
  notFound.forEach((font) => console.log(`   - ${font}`));
}

// Exit with error code if nothing was added
if (added.length === 0) {
  process.exit(1);
}
