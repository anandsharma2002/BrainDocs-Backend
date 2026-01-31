const mongoose = require('mongoose');
const slugify = require('slugify');

const SubHeadingSchema = new mongoose.Schema({
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
    headingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Heading',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from the title
SubHeadingSchema.pre('save', async function () {
    if (!this.route) {
        this.route = slugify(this.title, { lower: true });
    }
});

module.exports = mongoose.model('SubHeading', SubHeadingSchema);
