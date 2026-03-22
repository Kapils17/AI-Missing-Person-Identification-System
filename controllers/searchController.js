const Person = require('../models/Person');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.searchPerson = async (req, res) => {
    console.log('--- Search Request Received ---');
    try {
        if (!req.file) {
            console.error('No file uploaded in request');
            return res.status(400).json({ success: false, message: 'Reference image file is required.' });
        }

        const queryImagePath = path.resolve(req.file.path);
        console.log(`Uploaded image saved at: ${queryImagePath}`);
        
        // Query database for missing persons
        const allPersons = await Person.find({ Status: 'Missing' });
        console.log(`Found ${allPersons.length} missing person records to compare.`);
        
        let matchedPerson = null;
        let matchedConfidence = 0;

        for (const person of allPersons) {
            try {
                // Construct absolute path for stored image
                // person.ImageURL is like 'backend\uploads\123.jpg'
                // We need to make sure we point to the project root properly
                const absoluteImagePath = path.resolve(person.ImageURL);
                
                if (!fs.existsSync(absoluteImagePath)) {
                    console.warn(`Record image not found on disk: ${absoluteImagePath}`);
                    continue;
                }

                console.log(`Sending images to AI Service for comparison: ${path.basename(queryImagePath)} vs ${path.basename(absoluteImagePath)}`);
                
                const formData = new FormData();
                formData.append('image1', fs.createReadStream(queryImagePath));
                formData.append('image2', fs.createReadStream(absoluteImagePath));

                // Call AI microservice using 127.0.0.1 as requested
                const response = await axios.post('http://127.0.0.1:8000/verify', formData, {
                    headers: {
                        ...formData.getHeaders()
                    },
                    timeout: 10000 // 10s timeout
                });

                console.log(`AI Response for ${person.Name}: match = ${response.data.match}, confidence = ${response.data.confidence}`);

                if (response.data.match === true) {
                    console.log(`✅ MATCH FOUND: ${person.Name} (${response.data.confidence * 100}%)`);
                    matchedPerson = person;
                    matchedConfidence = response.data.confidence;
                    break; // Stop at first match
                }
            } catch (err) {
                console.error(`AI Service call failed for person ${person.Name} (${person._id}):`);
                if (err.response) {
                    console.error('Data:', err.response.data);
                    console.error('Status:', err.response.status);
                } else {
                    console.error('Error Message:', err.message);
                }
            }
        }

        if (matchedPerson) {
            console.log(`Matching process finished. Found match: ${matchedPerson.Name}`);
            return res.json({
                success: true,
                match: {
                    id: matchedPerson._id,
                    name: matchedPerson.Name,
                    age: matchedPerson.Age,
                    disabilityType: matchedPerson.DisabilityType,
                    guardianContact: matchedPerson.GuardianContact,
                    imageUrl: `/uploads/${path.basename(matchedPerson.ImageURL)}`
                },
                confidence: Math.round(matchedConfidence * 100)
            });
        }

        console.log('Matching process finished. No match found.');
        return res.json({ 
            success: true, 
            message: 'No biological match found in the database.',
            match: null 
        });

    } catch (error) {
        console.error('Search route CRITICAL error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error processing face search.' });
    }
};
