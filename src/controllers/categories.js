// Import any needed model functions
import {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';

// Helper: a route id must be a whole number
const isValidId = (id) => /^\d+$/.test(id);

// Helper: build a 404 error for the global error handler
const createNotFoundError = (message) => {
    const err = new Error(message);
    err.status = 404;
    return err;
};

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';
    res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res, next) => {
    const categoryId = req.params.id;

    // Validate the route parameter: it must be a whole number
    const categoryDetails = isValidId(categoryId)
        ? await getCategoryDetails(categoryId)
        : null;

    // No matching category: forward a 404 error to the global error handler
    if (!categoryDetails) {
        return next(createNotFoundError('Category Not Found'));
    }

    const projects = await getProjectsByCategoryId(categoryId);
    const title = 'Category Details';
    res.render('category', { title, categoryDetails, projects });
};

const showAssignCategoriesForm = async (req, res, next) => {
    const projectId = req.params.projectId;

    const projectDetails = isValidId(projectId)
        ? await getProjectDetails(projectId)
        : null;

    if (!projectDetails) {
        return next(createNotFoundError('Service Project Not Found'));
    }

    const categories = await getAllCategories();
    const assignedCategories = await getCategoriesByProjectId(projectId);
    const title = 'Assign Categories to Project';

    res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];

    // A single checked box arrives as a string, so make sure we always have an array
    const categoryIdsArray = Array.isArray(selectedCategoryIds)
        ? selectedCategoryIds
        : [selectedCategoryIds];

    await updateCategoryAssignments(projectId, categoryIdsArray);

    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

// Export any controller functions
export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};
