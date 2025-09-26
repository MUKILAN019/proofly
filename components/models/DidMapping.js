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
    badgeImage: {
        type: String, // Base64 encoded image with steganography
        required: true,
    },
    metadata: {
        imageHash: String,
        steganographyData: {
            did: String,
            publicKey: String,
            timestamp: Date,
            version: String
        },
        imageFormat: {
            type: String,
            default: 'png'
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
});

export default mongoose.models.DidMapping || mongoose.model('DidMapping', DidMappingSchema);