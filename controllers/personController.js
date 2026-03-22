const Person = require('../models/Person');

exports.addPerson = async (req, res) => {
    try {
        const { Name, Age, DisabilityType, GuardianContact, faceDescriptor } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        }
        
        let descriptorArray;
        try {
            // Check if faceDescriptor is passed as JSON string
            descriptorArray = typeof faceDescriptor === 'string' ? JSON.parse(faceDescriptor) : faceDescriptor;
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid faceDescriptor format. Must be a valid JSON array of 128 numbers.' });
        }

        if (!descriptorArray || !Array.isArray(descriptorArray) || descriptorArray.length !== 128) {
             return res.status(400).json({ success: false, message: 'faceDescriptor array of exactly 128 numbers is required.' });
        }

        const newPerson = new Person({
            Name,
            Age,
            DisabilityType,
            GuardianContact,
            ImageURL: req.file.path,
            faceDescriptor: descriptorArray
        });

        await newPerson.save();

        res.status(201).json({ success: true, message: 'Missing person reported successfully.', data: newPerson });

    } catch (error) {
        console.error('Add person error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

exports.deletePerson = async (req, res) => {
    try {
        const personId = req.params.id;
        const deletedPerson = await Person.findByIdAndDelete(personId);
        
        if (!deletedPerson) {
            return res.status(404).json({ success: false, message: 'Person not found.' });
        }

        res.json({ success: true, message: 'Person record deleted successfully by authorized personnel.' });
    } catch (error) {
        console.error('Delete person error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

exports.getAllPersons = async (req, res) => {
    try {
        const persons = await Person.find().sort({ createdAt: -1 });
        res.json({ success: true, persons });
    } catch (error) {
        console.error('Fetch persons error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
