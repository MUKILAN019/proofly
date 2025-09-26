import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';
import { extractDataFromImage } from '../../../components/utils/steganography';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('🔐 Starting login with steganographic badge...');

    try {
        await connectMongo();

        const { cloudinaryUrl, clerkUserId } = req.body;

        if (!cloudinaryUrl || !clerkUserId) {
            return res.status(400).json({ 
                message: 'Cloudinary URL and user ID are required' 
            });
        }

        console.log('📥 Downloading image from Cloudinary...');
        
        // Download image from Cloudinary
        const imageResponse = await fetch(cloudinaryUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to download image from Cloudinary');
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        console.log('🔄 Extracting data from badge image...');
        
        // Extract data from steganographic image
        const extractedData = await extractDataFromImage(imageBuffer);

        // Verify extracted data
        if (!extractedData.did || !extractedData.publicKey) {
            return res.status(400).json({ 
                message: 'Invalid badge image: No identity data found' 
            });
        }

        console.log('🔍 Checking database for DID:', extractedData.did);
        
        // Check database for DID
        const storedMapping = await DidMapping.findOne({ 
            clerkUserId, 
            didId: extractedData.did 
        });

        if (!storedMapping) {
            return res.status(404).json({ 
                message: 'DID not found in university records' 
            });
        }

        // Verify public key match
        const publicKeyMatch = storedMapping.didPublicKey.includes(extractedData.publicKey);
        if (!publicKeyMatch) {
            return res.status(401).json({ 
                message: 'Public key verification failed' 
            });
        }

        // Generate authentication token
        const authToken = jwt.sign(
            { 
                did: extractedData.did,
                clerkUserId: clerkUserId,
                verified: true,
                timestamp: new Date().toISOString()
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        // Update last verification timestamp
        await DidMapping.updateOne(
            { clerkUserId },
            { lastVerified: new Date() }
        );

        console.log('✅ Login successful for DID:', extractedData.did);

        return res.status(200).json({
            success: true,
            message: 'Login successful using steganographic badge',
            did: extractedData.did,
            authToken: authToken,
            badgeImage: {
                url: cloudinaryUrl,
                verified: true
            },
            userProfile: {
                did: extractedData.did,
                university: extractedData.university || 'Kalasalingam University',
                credentialType: extractedData.credentialType || 'Proof-of-Right',
                issueDate: extractedData.timestamp
            },
            verification: {
                steganography: true,
                database: true,
                publicKey: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
}