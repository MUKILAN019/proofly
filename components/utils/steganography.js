import zlib from "zlib";

// Convert text to binary
const textToBinary = (text) =>
  text.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join("");

// Convert binary to text
const binaryToText = (binary) => {
  let text = "";
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte.length === 8) text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

// Encode JSON safely: compress + base64
const encodeData = (data) => {
  const jsonStr = JSON.stringify(data);
  const compressed = zlib.deflateSync(Buffer.from(jsonStr, "utf-8"));
  return compressed.toString("base64");
};

// Decode safely: base64 + decompress
const decodeData = (encoded) => {
  const buffer = Buffer.from(encoded, "base64");
  const decompressed = zlib.inflateSync(buffer);
  return JSON.parse(decompressed.toString("utf-8"));
};

// SVG template matching your badge design
const createBadgeSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#154D71;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1C6EA4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#33A1E0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Outer circle -->
  <circle cx="200" cy="200" r="195" fill="url(#bgGradient)" stroke="url(#goldGradient)" stroke-width="8"/>
  
  <!-- Inner circle -->
  <circle cx="200" cy="200" r="160" fill="none" stroke="url(#goldGradient)" stroke-width="4"/>
  
  <!-- University text (curved) -->
  <path id="universityTextPath" d="M100,200 A100,100 0 1,1 300,200" fill="none"/>
  <text fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    <textPath href="#universityTextPath" startOffset="50%" text-anchor="middle">
      KALASALINGAM UNIVERSITY
    </textPath>
  </text>
  
  <!-- Center content -->
  <circle cx="200" cy="200" r="80" fill="white" stroke="url(#goldGradient)" stroke-width="3"/>
  
  <!-- Digital University text -->
  <text x="200" y="180" text-anchor="middle" fill="#154D71" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    DIGITAL UNIVERSITY
  </text>
  
  <!-- Forever text -->
  <text x="200" y="220" text-anchor="middle" fill="#154D71" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
    FOREVER
  </text>
  
  <!-- Bottom text -->
  <text x="200" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
    PROOF OF RIGHT
  </text>
  
  <!-- Steganography data will be embedded here as invisible elements -->
  <g id="steganography" display="none">
    <!-- Data will be embedded in these invisible text elements -->
  </g>
</svg>`;
};

export const hideDataInSVG = (data) => {
  const encoded = encodeData(data);
  const binaryData = textToBinary(encoded);
  
  // Create SVG with embedded data
  let svg = createBadgeSVG();
  
  // Embed data in invisible elements within the SVG
  // We'll use multiple tiny elements with specific attributes to store the data
  const dataMarker = `<!--${binaryData}-->`;
  
  // Insert the data as a comment in the SVG
  svg = svg.replace('<!-- Steganography data will be embedded here as invisible elements -->', dataMarker);
  
  return {
    svg: svg,
    metadata: {
      dataSize: binaryData.length,
      timestamp: new Date().toISOString(),
      format: 'svg'
    }
  };
};

export const extractDataFromSVG = (svgContent) => {
  // Extract data from SVG comment
  const commentMatch = svgContent.match(/<!--([01]+)-->/);
  
  if (!commentMatch) {
    throw new Error("No steganographic data found in SVG");
  }
  
  const binaryData = commentMatch[1];
  const extractedText = binaryToText(binaryData);
  
  try {
    return decodeData(extractedText.trim());
  } catch (err) {
    throw new Error("Extracted text is not valid JSON or decodable");
  }
};

// Legacy functions for compatibility (will be deprecated)
export const hideDataInImage = async (imageBuffer, data) => {
  // For backward compatibility, convert to SVG approach
  const result = hideDataInSVG(data);
  return {
    imageBuffer: Buffer.from(result.svg),
    metadata: result.metadata
  };
};

export const extractDataFromImage = async (imageBuffer) => {
  const svgContent = imageBuffer.toString('utf-8');
  return extractDataFromSVG(svgContent);
};