const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Age: { type: Number, required: true },
    DisabilityType: { type: String, default: 'None' },
    GuardianContact: { type: String, required: true },
    ImageURL: { type: String, required: true },
    faceDescriptor: {
        type: [Number], // Array of 128 numbers
        required: true,
        validate: [arrayLimit, '{PATH} exceeds the limit of 128']
    },
    ReportDate: { type: Date, default: Date.now },
    Status: { type: String, enum: ['Missing', 'Found'], default: 'Missing' }
});

function arrayLimit(val) {
    return val.length === 128;
}

module.exports = mongoose.model('Person', personSchema);
