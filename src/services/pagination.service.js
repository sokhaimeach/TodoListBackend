/**
 * Helper to add pagination metadata to list queries.
 * Usage:
 *   const { page, limit, offset } = getPagination(req.query);
 *   const { rows, count } = await Model.findAndCountAll({ where, limit, offset, order });
 *   return successResponse(res, "message", rows, 200, getPaginationMeta(count, page, limit));
 */

const getPagination = (query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

const getPaginationMeta = (total, page, limit) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
    };
};

module.exports = { getPagination, getPaginationMeta };
