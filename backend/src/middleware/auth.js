import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
     
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No token provided. Please log in first.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({
            error: 'Token is valid or has expired. Please log in again.'
        });
    }
};

export default protect;