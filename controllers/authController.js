const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { password } = req.body;
    
    // Hardcoded password for hackathon demo purposes
    if (password === 'admin123') {
        const token = jwt.sign(
            { role: 'Police' }, 
            process.env.JWT_SECRET || 'safefind_police_secret',
            { expiresIn: '24h' }
        );
        return res.json({ success: true, token });
    }
    
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
};
