import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';
import { hideDataInSVG } from '../../../components/utils/steganography';
import crypto from 'crypto';

// Generate cryptographic DID (same as before)
const generateCryptographicDid = async (clerkUserId) => {
    try {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('🔐 Starting DID creation with SVG steganography...');

    try {
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
            publicKey: didPublicKey.substring(0, 200),
            timestamp: timestamp,
            version: '1.0',
            university: 'Kalasalingam University',
            credentialType: 'Proof-of-Right',
            clerkUserId: clerkUserId
        };

        console.log('📊 Steganography data size:', JSON.stringify(steganographyData).length, 'characters');

        // Create SVG with embedded data
        console.log('🎨 Creating SVG badge with steganography...');
        const svgResult = hideDataInSVG(steganographyData);
        
        // Store in database
        console.log('💾 Saving to database...');
        const newMapping = await DidMapping.create({
            clerkUserId,
            didId,
            didPublicKey,
            didDocument,
            badgeSVG: svgResult.svg,
            metadata: {
                svgHash: crypto.createHash('sha256').update(svgResult.svg).digest('hex'),
                steganographyData: steganographyData,
                format: 'svg',
                ...svgResult.metadata
            },
            status: 'active',
            createdAt: new Date(timestamp),
            lastVerified: new Date()
        });

        console.log('✅ DID created successfully:', didId);

        // Send response with SVG data
        return res.status(201).json({
            success: true,
            message: 'Cryptographic DID created successfully',
            did: {
                id: didId,
                publicKey: didPublicKey.substring(0, 100) + '...',
                timestamp: timestamp
            },
            badgeSVG: {
                data: svgResult.svg, // Full SVG content
                mimeType: 'image/svg+xml',
                metadata: svgResult.metadata
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