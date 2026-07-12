const ERROR_CODES = require("../constants/errorCode");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { Category, Transaction } = require("../models");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// create new category
const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create({
        userId: req.user.id,
        ...req.body
    });

    return successResponse(res, "Create category successfully", category, 201);
});

// get all category
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch categories successfully", categories);
});

// update category
const updateCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    const category = await Category.findOne({
        where: { id: categoryId, userId: req.user.id }
    });
    if (!category) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
    }

    await category.update(req.body);

    return successResponse(res, "Update category successfully", category);
});

// delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findOne({
        where: { id, userId: req.user.id }
    });
    if (!category) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
    }

    const transactions = await Transaction.findAll({ where: { categoryId: id }});
    if (transactions.length > 0) {
        throw new AppError(ERROR_CODES.EXIST, "This category is used in transactions", 409);
    }

    await category.destroy();
    
    return successResponse(res, "Delete category successfully", category);
});

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}
