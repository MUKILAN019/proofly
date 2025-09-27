import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';
import { extractDataFromSVG } from '../../../components/utils/steganography';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('🔐 Starting login with SVG steganographic badge...');

    try {
        await connectMongo();

        const { svgData, clerkUserId } = req.body;

        if (!svgData || !clerkUserId) {
            return res.status(400).json({ 
                message: 'SVG data and user ID are required' 
            });
        }

        console.log('🔄 Extracting data from SVG badge...');
        
        const extractedData = await extractDataFromSVG(svgData);

        if (!extractedData.did || !extractedData.publicKey) {
            return res.status(400).json({ 
                message: 'Invalid badge SVG: No identity data found' 
            });
        }

        console.log('🔍 Checking database for DID:', extractedData.did);
        
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

        // Update last login timestamp
        await DidMapping.updateOne(
            { clerkUserId },
            { lastLogin: new Date() }
        );

        const badgeDownloaded = storedMapping.metadata?.badgeDownloaded || false;

        const authToken = jwt.sign(
            { 
                did: extractedData.did,
                clerkUserId: clerkUserId,
                verified: true,
                badgeDownloaded: badgeDownloaded,
                timestamp: new Date().toISOString()
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful for DID:', extractedData.did);

        // ALWAYS redirect to mainoffer after SVG login
        return res.status(200).json({
            success: true,
            message: 'Login successful using steganographic SVG badge',
            did: extractedData.did,
            authToken: authToken,
            badgeDownloaded: badgeDownloaded,
            redirectTo: '/mainoffer', // Always go to mainoffer after SVG login
            badgeSVG: {
                verified: true,
                data: svgData
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