// components/utils/steganography.js
import Jimp from 'jimp';

// Convert text to binary
const textToBinary = (text) => {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
};

// Convert binary to text
const binaryToText = (binary) => {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substr(i, 8);
        if (byte.length === 8) {
            text += String.fromCharCode(parseInt(byte, 2));
        }
    }
    return text;
};

// Hide data in image using LSB steganography
export const hideDataInImage = async (imagePath, data) => {
    try {
        console.log('🖼️ Loading image from:', imagePath);
        
        const fs = await import('fs');
        if (!fs.existsSync(imagePath)) {
            console.log('❌ Image file does not exist, creating default badge...');
            
            const { createCanvas } = await import('canvas');
            const canvas = createCanvas(400, 200);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#154D71';
            ctx.fillRect(0, 0, 400, 200);
            
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Kalasalingam University', 200, 80);
            ctx.font = '16px Arial';
            ctx.fillText('Proof of Right', 200, 120);
            ctx.fillStyle = '#d9a34c';
            ctx.font = '12px Arial';
            ctx.fillText('Digital Identity Badge', 200, 150);
            
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(imagePath, buffer);
            console.log('✅ Created default badge image');
        }

        const image = await Jimp.read(imagePath);
        console.log('✅ Image loaded, dimensions:', image.bitmap.width, 'x', image.bitmap.height);
        
        const dataString = JSON.stringify(data);
        const binaryData = textToBinary(dataString);

        // Use unique marker instead of plain 00000000
        const endMarker = "111111100000000011111110";
        const dataWithMarker = binaryData + endMarker;

        console.log('📊 Data to embed:', dataString.length, 'characters,', binaryData.length, 'bits');
        
        const maxBits = image.bitmap.width * image.bitmap.height * 3;
        if (dataWithMarker.length > maxBits) {
            throw new Error(`Data too large for image. Max: ${maxBits} bits, Need: ${dataWithMarker.length} bits`);
        }
        
        let dataIndex = 0;
        const totalBits = dataWithMarker.length;
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if (dataIndex >= totalBits) return;
            for (let channel = 0; channel < 3; channel++) {
                if (dataIndex >= totalBits) break;
                const bit = dataWithMarker[dataIndex];
                const currentValue = image.bitmap.data[idx + channel];
                const newValue = (currentValue & 0xFE) | parseInt(bit, 10);
                image.bitmap.data[idx + channel] = newValue;
                dataIndex++;
            }
        });
        
        console.log('✅ Data embedded successfully');
        
        const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        
        return {
            imageBuffer,
            imageBase64: imageBuffer.toString('base64'),
            metadata: {
                dataLength: dataString.length,
                bitsUsed: binaryData.length,
                imageSize: { width: image.bitmap.width, height: image.bitmap.height },
                capacity: maxBits
            }
        };
    } catch (error) {
        console.error('❌ Steganography error:', error);
        throw new Error(`Failed to hide data in image: ${error.message}`);
    }
};

// Extract data from image
export const extractDataFromImage = async (imageBuffer) => {
    try {
        console.log('🔍 Extracting data from image buffer...');
        const image = await Jimp.read(imageBuffer);
        let binaryData = '';
        
        console.log('✅ Image loaded for extraction');
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            for (let channel = 0; channel < 3; channel++) {
                const currentValue = image.bitmap.data[idx + channel];
                const bit = (currentValue & 1).toString();
                binaryData += bit;
            }
        });
        
        console.log('✅ Binary data extracted:', binaryData.length, 'bits');
        
        const endMarker = "111111100000000011111110";
        const endIndex = binaryData.indexOf(endMarker);
        if (endIndex === -1) {
            throw new Error('No data terminator found in image');
        }

        const actualBinaryData = binaryData.substring(0, endIndex);

        const paddedBinaryData = actualBinaryData.padEnd(
            Math.ceil(actualBinaryData.length / 8) * 8, 
            '0'
        );
        
        const extractedText = binaryToText(paddedBinaryData);

        console.log("🔎 Extracted text preview:", extractedText.slice(0, 200));

        if (!extractedText) {
            throw new Error('No valid data extracted from image');
        }

        let extractedJson;
        try {
            extractedJson = JSON.parse(extractedText);
        } catch (e) {
            console.error("❌ JSON parse failed. Extracted text:", extractedText);
            throw new Error("Extracted text is not valid JSON");
        }
        
        console.log('✅ Extracted JSON:', extractedJson);
        return extractedJson;
    } catch (error) {
        console.error('❌ Data extraction error:', error);
        throw new Error(`Failed to extract data from image: ${error.message}`);
    }
};
