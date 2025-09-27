import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await connectMongo();

        // Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization required' });
        }

        const token = authHeader.split(' ')[1];
        let clerkUserId;

        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                clerkUserId = payload.sub;
            }
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Find user's DID
        const didMapping = await DidMapping.findOne({ clerkUserId });
        
        if (!didMapping) {
            return res.status(200).json({
                accessAllowed: true, // Allow access if no DID exists
            });
        }

        // Check if badge has been downloaded - BLOCK access if downloaded
        const badgeDownloaded = didMapping.metadata?.badgeDownloaded || false;
        
        return res.status(200).json({
            accessAllowed: !badgeDownloaded, // Block if downloaded
        });

    } catch (error) {
        console.error('Error checking dashboard access:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to check access permission',
            error: error.message
        });
    }
}