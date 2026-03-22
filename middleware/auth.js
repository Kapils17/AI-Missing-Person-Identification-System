const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'A token is required for authentication' });
    }

    try {
        // Expecting "Bearer <token>"
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'safefind_police_secret');
        req.user = decoded;
        
        // Ensure user has Police role
        if (req.user.role !== 'Police') {
            return res.status(403).json({ success: false, message: 'Unauthorized role. Police access required.' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid Token' });
    }
    return next();
};

module.exports = verifyToken;
