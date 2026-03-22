const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/auth');
const searchController = require('../controllers/searchController');
const personController = require('../controllers/personController');
const authController = require('../controllers/authController');

// Public search endpoint
router.post('/search', upload.single('image'), searchController.searchPerson);

// Auth Endpoints
router.post('/auth/login', authController.login);

// Protected Police Endpoints
router.get('/persons', verifyToken, personController.getAllPersons);
router.post('/person', verifyToken, upload.single('image'), personController.addPerson);
router.delete('/person/:id', verifyToken, personController.deletePerson);

module.exports = router;
