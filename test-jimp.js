// test-jimp.js
async function testJimp() {
    try {
        console.log('Testing Jimp import...');
        const Jimp = require('jimp');
        console.log('Jimp loaded successfully:', typeof Jimp);
        
        // Create a simple test image
        const image = new Jimp(100, 100, 0xFF0000FF);
        console.log('Test image created:', image.bitmap.width, 'x', image.bitmap.height);
        
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        console.log('Buffer created:', buffer.length, 'bytes');
        
        // Try reading the buffer back
        const readImage = await Jimp.read(buffer);
        console.log('Buffer read successfully:', readImage.bitmap.width, 'x', readImage.bitmap.height);
        
        console.log('✅ Jimp test passed');
    } catch (error) {
        console.error('❌ Jimp test failed:', error);
    }
}

testJimp();