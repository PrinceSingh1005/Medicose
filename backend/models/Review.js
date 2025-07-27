const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Calculate average rating for the doctor after a new review is added
reviewSchema.statics.getAverageRating = async function (doctorId) {
    const obj = await this.aggregate([
        {
            $match: { doctor: doctorId },
        },
        {
            $group: {
                _id: '$doctor',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('DoctorProfile').findOneAndUpdate(
            { user: doctorId },
            {
                averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0, // Round to 1 decimal place
                numReviews: obj[0] ? obj[0].numReviews : 0,
            }
        );
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save and remove
reviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.doctor);
});

reviewSchema.post('remove', async function () {
    await this.constructor.getAverageRating(this.doctor);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
