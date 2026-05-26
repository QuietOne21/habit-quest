import rateLimit, { ipKeyGenerator}  from 'express-rate-limit';

/** 
 * auth limiter (strict)
 * protects login & register endpoints
 * 10 requests per 15 mins per IP
*/

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes',
        statusCode: 429,
    },
    standardHeaders: true,

    legacyHeaders: false,

    skipSuccessfulRequests: false,

    keyGenerator: (key) => ipKeyGenerator(req, { trustProxy: true }),
});

/**
 * register limiter (very strict)
 * prevents spam account creation
 * 5 accounts per hour per IP
 */

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many accounts created. Please try again in 1 hour.',
        statusCode: 429,
    },
    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (key) => ipKeyGenerator(req, { trustProxy: true }),
});

/**
 * api limiter (moderate)
 * for authenticated api routes
 * 100 requests per 15 minutes per IP
 */

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests. Please slow down.',
        statusCode: 429,
    },
    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (key) => ipKeyGenerator(req, { trustProxy: true }),
});

/**
 * global limiter (loose safety net)
 * catches anything not covered above
 * 200 requests per 15 minutes per IP
 */

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Too many requests from this IP.',
        statusCode: 429,
    },
    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (key) => ipKeyGenerator(req, { trustProxy: true }),
});