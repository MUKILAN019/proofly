import { connectMongo } from '../../../components/lib/mongodb';
import DidMapping from '../../../components/models/DidMapping';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        // Mark badge as downloaded and restrict access
        const result = await DidMapping.updateOne(
            { clerkUserId },
            { 
                $set: { 
                    'metadata.badgeDownloaded': true,
                    'metadata.downloadTimestamp': new Date(),
                    'metadata.accessRestricted': true
                } 
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'User not found or already marked as downloaded' });
        }

        return res.status(200).json({
            success: true,
            message: 'Badge download status updated successfully. Dashboard access restricted.'
        });

    } catch (error) {
        console.error('Error marking badge as downloaded:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to update badge download status',
            error: error.message
        });
    }
}