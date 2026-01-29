const mongoose = require('mongoose');

const secondaryHeadingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    titleLevel: { type: String, default: 'h1' },
    content: { type: Array, default: [] },
    order: { type: Number, default: 0 }
});

const SubheadingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    titleLevel: { type: String, default: 'h1' },
    content: { type: Array, default: [] }, // Blocks: { type: 'text'|'code'|'img'|'video', content: '' }
    order: { type: Number, default: 0 },
    secondaryHeadings: [secondaryHeadingSchema]
});

const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    subheadings: [SubheadingSchema],
    order: { type: Number, default: 0 },
    // Ownership and Privacy Fields
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);
