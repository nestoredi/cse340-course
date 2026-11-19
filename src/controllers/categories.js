import { body, validationResult } from 'express-validator';

// Import any needed model functions
import {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';

// Define validation rules for the category form (server-side)
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';
    res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res, next) => {
    const categoryId = req.params.id;

    // Validate the route parameter: it must be a whole number
    const categoryDetails = /^\d+$/.test(categoryId)
        ? await getCategoryDetails(categoryId)
        : null;

    // No matching category: forward a 404 error to the global error handler
    if (!categoryDetails) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err);
    }

    const projects = await getProjectsByCategoryId(categoryId);
    const title = 'Category Details';
    res.render('category', { title, categoryDetails, projects });
};

const showAssignCategoriesForm = async (req, res, next) => {
    const projectId = req.params.projectId;

    // Validate the route parameter: it must be a whole number
    const projectDetails = /^\d+$/.test(projectId)
        ? await getProjectDetails(projectId)
        : null;

    // No matching project: forward a 404 error to the global error handler
    if (!projectDetails) {
        const err = new Error('Service Project Not Found');
        err.status = 404;
        return next(err);
    }

    const categories = await getAllCategories();
    const assignedCategories = await getCategoriesByProjectId(projectId);
    const title = 'Assign Categories to Project';
    res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
};

const processAssignCategoriesForm = async (req, res, next) => {
    const projectId = req.params.projectId;

    // Validate the route parameter: it must be a whole number
    if (!/^\d+$/.test(projectId)) {
        const err = new Error('Service Project Not Found');
        err.status = 404;
        return next(err);
    }

    const selectedCategoryIds = req.body.categoryIds || [];

    // Ensure selectedCategoryIds is an array (a single checkbox arrives as a string)
    const categoryIdsArray = Array.isArray(selectedCategoryIds)
        ? selectedCategoryIds
        : [selectedCategoryIds];

    // Keep only whole-number ids before they reach the database
    const validCategoryIds = categoryIdsArray.filter((categoryId) => /^\d+$/.test(categoryId));

    await updateCategoryAssignments(projectId, validCategoryIds);

    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new category form
        return res.redirect('/new-category');
    }

    const { name } = req.body;

    try {
        const categoryId = await createCategory(name);

        req.flash('success', 'Category added successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', error.isDuplicate
            ? 'A category with that name already exists.'
            : 'There was an error creating the category.');
        res.redirect('/new-category');
    }
};

const showEditCategoryForm = async (req, res, next) => {
    const categoryId = req.params.id;

    // Validate the route parameter: it must be a whole number
    const categoryDetails = /^\d+$/.test(categoryId)
        ? await getCategoryDetails(categoryId)
        : null;

    // No matching category: forward a 404 error to the global error handler
    if (!categoryDetails) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err);
    }

    const title = 'Edit Category';
    res.render('edit-category', { title, categoryDetails });
};

const processEditCategoryForm = async (req, res, next) => {
    const categoryId = req.params.id;

    // Validate the route parameter: it must be a whole number
    if (!/^\d+$/.test(categoryId)) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err);
    }

    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit category form
        return res.redirect(`/edit-category/${categoryId}`);
    }

    const { name } = req.body;

    try {
        await updateCategory(categoryId, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', error.isDuplicate
            ? 'A category with that name already exists.'
            : 'There was an error updating the category.');
        res.redirect(`/edit-category/${categoryId}`);
    }
};

// Export any controller functions
export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
};
