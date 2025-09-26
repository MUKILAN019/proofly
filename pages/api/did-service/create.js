import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';
import { hideDataInImage } from '../../../components/utils/steganography';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Generate cryptographic DID
const generateCryptographicDid = async (clerkUserId) => {
    try {
        // Generate cryptographic key pair
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        // Create DID identifier
        const publicKeyHash = crypto.createHash('sha256').update(keyPair.publicKey).digest('hex');
        const didId = `did:kalasalingam:student:${publicKeyHash.substring(0, 16)}`;
        
        const didDocument = {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: didId,
            created: new Date().toISOString(),
            verificationMethod: [{
                id: `${didId}#keys-1`,
                type: 'RsaVerificationKey2018',
                controller: didId,
                publicKeyPem: keyPair.publicKey,
            }],
            authentication: [`${didId}#keys-1`],
            service: [{
                id: `${didId}#university`,
                type: 'UniversityIdentity',
                serviceEndpoint: 'https://kalasalingam.ac.in'
            }]
        };

        return {
            didId,
            didPublicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            didDocument: JSON.stringify(didDocument),
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('DID generation error:', error);
        throw new Error(`Failed to generate DID: ${error.message}`);
    }
};

// Download image from Cloudinary
const downloadImageFromCloudinary = async (url) => {
    try {
        console.log('📥 Downloading image from Cloudinary:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        
        console.log('✅ Image downloaded successfully, size:', imageBuffer.length, 'bytes');
        return imageBuffer;
    } catch (error) {
        console.error('❌ Error downloading image:', error);
        throw new Error(`Cloudinary download failed: ${error.message}`);
    }
};

// Upload image to Cloudinary (if you want to upload the modified image)
const uploadImageToCloudinary = async (imageBuffer, didId) => {
    try {
        const formData = new FormData();
        formData.append('file', imageBuffer, {
            filename: `did_badge_${didId}.png`,
            contentType: 'image/png'
        });
        formData.append('upload_preset', 'rlz83089');
        formData.append('public_id', `did_badge_${didId.replace(/[^a-zA-Z0-9]/g, '_')}`);
        formData.append('folder', 'did_badges');
        formData.append('flags', 'lossless'); // important
        formData.append('quality', '100');    // important

        const response = await fetch(`https://api.cloudinary.com/v1_1/dioirlnnn/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result.secure_url;
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
};


// Fallback using Cloudinary URL directly
const getFallbackCloudinaryBadge = (didId) => {
    const cloudinaryUrl = 'https://res.cloudinary.com/dioirlnnn/image/upload/v1758909129/badge_auvzuk.png';
    
    return {
        imageUrl: cloudinaryUrl,
        metadata: {
            fallback: true,
            reason: 'Using Cloudinary badge directly',
            source: 'cloudinary',
            originalUrl: cloudinaryUrl
        }
    };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('🔐 Starting DID creation with steganography...');

    try {
        // Connect to MongoDB
        await connectMongo();
        console.log('✅ MongoDB connected');

        // Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid.' });
        }
        
        const token = authHeader.split(' ')[1];
        let clerkUserId;

        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                clerkUserId = payload.sub || `user_${Date.now()}`;
            } else {
                clerkUserId = `dev_${Date.now()}`;
            }
            console.log('✅ User authenticated:', clerkUserId);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid authentication token.' });
        }

        // Check for existing DID
        const existingDidMapping = await DidMapping.findOne({ clerkUserId });
        if (existingDidMapping) {
            return res.status(409).json({ 
                message: 'DID already exists for this student.',
                existingDid: existingDidMapping.didId
            });
        }

        // Generate DID
        console.log('🔄 Generating cryptographic DID...');
        const { didId, didPublicKey, privateKey, didDocument, timestamp } = 
            await generateCryptographicDid(clerkUserId);

        // Prepare data for steganography
        const steganographyData = {
            did: didId,
            publicKey: didPublicKey.substring(0, 200), // Reduced size for steganography
            timestamp: timestamp,
            version: '1.0',
            university: 'Kalasalingam University',
            credentialType: 'Proof-of-Right'
        };

        console.log('📊 Steganography data size:', JSON.stringify(steganographyData).length, 'characters');

        let imageUrl, imageBuffer, metadata;

        try {
            // Download image from Cloudinary
            console.log('🎨 Processing Cloudinary image for steganography...');
            const cloudinaryUrl = 'https://res.cloudinary.com/dioirlnnn/image/upload/v1758909129/badge_auvzuk.png';
            
            // Download the image
            imageBuffer = await downloadImageFromCloudinary(cloudinaryUrl);
            
            // Embed data in the image using steganography
            console.log('🔐 Embedding data in image...');
            const result = await hideDataInImage(imageBuffer, steganographyData);
            
            // Upload the modified image back to Cloudinary
            console.log('☁️ Uploading modified image to Cloudinary...');
            imageUrl = await uploadImageToCloudinary(result.imageBuffer, didId);
            
            metadata = {
                ...result.metadata,
                source: 'cloudinary',
                originalUrl: cloudinaryUrl,
                processedUrl: imageUrl,
                steganography: true
            };
            
            console.log('✅ Steganography and Cloudinary upload completed successfully');

        } catch (stegoError) {
            console.error('❌ Steganography/Cloudinary failed, using fallback:', stegoError.message);
            
            // Fallback: Use Cloudinary URL directly without steganography
            const fallbackResult = getFallbackCloudinaryBadge(didId);
            imageUrl = fallbackResult.imageUrl;
            metadata = fallbackResult.metadata;
            
            console.log('✅ Using Cloudinary badge directly as fallback');
        }

        // Store in database (store Cloudinary URL instead of base64)
        console.log('💾 Saving to database...');
        const newMapping = await DidMapping.create({
            clerkUserId,
            didId,
            didPublicKey,
            didDocument,
            badgeImage: imageUrl, // Store Cloudinary URL instead of base64
            metadata: {
                imageHash: imageBuffer ? crypto.createHash('sha256').update(imageBuffer).digest('hex') : 'fallback',
                steganographyData: steganographyData,
                imageFormat: 'png',
                ...metadata
            },
            status: 'active',
            createdAt: new Date(timestamp),
            lastVerified: new Date()
        });

        console.log('✅ DID created successfully:', didId);

        // Send response
        return res.status(201).json({
            success: true,
            message: 'Cryptographic DID created successfully',
            did: {
                id: didId,
                publicKey: didPublicKey.substring(0, 100) + '...',
                timestamp: timestamp
            },
            badgeImage: {
                url: imageUrl, // Return URL instead of base64
                mimeType: 'image/png',
                metadata: metadata
            },
            security: {
                privateKey: privateKey,
                warning: 'STORE THIS PRIVATE KEY SECURELY. IT WILL NOT BE SHOWN AGAIN.',
                backupInstructions: 'Save this key in a secure password manager'
            }
        });

    } catch (error) {
        console.error('❌ DID Creation Error:', error);
        
        if (error.name === 'MongoServerError') {
            return res.status(500).json({ 
                success: false,
                message: 'Database error. Please check your MongoDB connection.',
                error: error.message
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Failed to create DID',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}