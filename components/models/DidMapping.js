// models/DidMapping.js
import mongoose from 'mongoose';

const DidMappingSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: [true, 'Clerk User ID is required'],
        unique: true,
        trim: true,
        index: true,
    },
    didId: {
        type: String,
        required: [true, 'Decentralized Identifier is required'],
        unique: true,
        trim: true,
    },
    didPublicKey: {
        type: String,
        required: true,
    },
    didDocument: {
        type: String,
        required: true,
    },
    badgeSVG: {
        type: String,
        required: true,
    },
    metadata: {
        svgHash: String,
        steganographyData: {
            did: String,
            publicKey: String,
            timestamp: Date,
            version: String
        },
        format: {
            type: String,
            default: 'svg'
        },
        badgeDownloaded: {
            type: Boolean,
            default: false
        },
        downloadTimestamp: Date,
        accessRestricted: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['active', 'revoked', 'suspended'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastVerified: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.DidMapping || mongoose.model('DidMapping', DidMappingSchema);