const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    referenceId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        required: true,
        enum: ['Topic', 'Heading', 'SubHeading']
    },
    blocks: [{
        type: {
            type: String,
            enum: ['paragraph', 'code', 'image', 'video', 'heading', 'table', 'links'],
            required: true
        },
        content: {
            type: mongoose.Schema.Types.Mixed, // Text content, Code string, Image/Video URL, or Table object
            default: ''
        },
        language: {
            type: String, // For code blocks
            default: 'javascript'
        },
        level: {
            type: Number, // For heading blocks (1-6)
            default: 2,
            min: 1,
            max: 6
        },
        color: {
            type: String, // Custom color for headings
            default: null
        },
        order: {
            type: Number,
            required: true
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one content document per reference item
PageContentSchema.index({ referenceId: 1 }, { unique: true });

module.exports = mongoose.model('PageContent', PageContentSchema);
