import  * as statsService from '../services/stats.service.js';

// GET /api/stats/dashboard/:year/:month
export const getDashboard = async (req, res, next) => {
    try {
        const data = await statsService.getDashboard(
            req.user.id,
            parseInt(req.params.year),
            parseInt(req.params.month)
        );
        res.json(data);
    }catch (err) {
        next(err);
    }
};

// GET /api/stats/annual/:year
export const getAnnualStats = async (req, res, next) => {
    try {
        const stats = await statsService.getAnnualStats(
            req.user.id,
            parseInt(req.params.year)
        );
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

// GET /api/stats/monthly/:year/:month
export const getMonthlyStats = async (req, res, next) => {
    try {
        const stats = await statsService.getMonthlyStats(
            req.user.id,
            parseInt(req.params.year),
            parseInt(req.params.month)
        );
        res.json(stats);
    } catch (err) {
        next(err);
    }
};