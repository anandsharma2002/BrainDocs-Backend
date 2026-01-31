const mongoose = require('mongoose');
const slugify = require('slugify');

const HeadingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    route: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    },
    topicId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Topic',
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

// Create slug from the title
// Create slug from the title
HeadingSchema.pre('save', async function () {
    if (!this.route) {
        this.route = slugify(this.title, { lower: true });
    }
});

// Reverse populate with virtuals
HeadingSchema.virtual('subHeadings', {
    ref: 'SubHeading',
    localField: '_id',
    foreignField: 'headingId',
    justOne: false,
    options: { sort: { order: 1 } }
});

// Cascade delete subheadings when a heading is deleted
// Cascade delete subheadings when a heading is deleted
HeadingSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log(`SubHeadings being removed from heading ${this._id}`);
    await this.model('SubHeading').deleteMany({ headingId: this._id });
});

module.exports = mongoose.model('Heading', HeadingSchema);
