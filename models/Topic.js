const mongoose = require('mongoose');
const slugify = require('slugify');

const TopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [50, 'Title can not be more than 50 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    route: {
        type: String,
        unique: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create topic slug from the title
// Create topic slug from the title
TopicSchema.pre('save', async function () {
    if (!this.route) {
        this.route = slugify(this.title, { lower: true });
    }
});

// Reverse populate with virtuals
TopicSchema.virtual('headings', {
    ref: 'Heading',
    localField: '_id',
    foreignField: 'topicId',
    justOne: false,
    options: { sort: { order: 1 } }
});

// Cascade delete headings when a topic is deleted
// Cascade delete headings when a topic is deleted
TopicSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log(`Headings being removed from topic ${this._id}`);
    await this.model('Heading').deleteMany({ topicId: this._id });
});

module.exports = mongoose.model('Topic', TopicSchema);
