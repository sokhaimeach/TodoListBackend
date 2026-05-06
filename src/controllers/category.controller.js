const ERROR_CODES = require("../constants/errorCode");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { Category, User, Transaction } = require("../models");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// create new category
const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);

    return successResponse(res, "Create Category successfylly", category);
});

// get all category
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    if (categories.length === 0) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
    }

    return successResponse(res, "Fetch categories successfully", categories);
});

// update category
const updateCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { userId, name, icon, color} = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
    }

    category.name = name;
    category.icon = icon;
    category.color = color;

    await category.save();

    return successResponse(res, "Update category successfully", category);
});

// delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
    }

    const transactions = await Transaction.findAll({ where: { categoryId: id }});
    if (transactions.length > 0) {
        throw new AppError(ERROR_CODES.EXIST, "This category contain in transactions", 401);
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