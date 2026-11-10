// Import any needed model functions
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

// Define any controller functions
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res, next) => {
    const organizationId = req.params.id;

    // Validate the route parameter: it must be a whole number
    const organizationDetails = /^\d+$/.test(organizationId)
        ? await getOrganizationDetails(organizationId)
        : null;

    // No matching organization: forward a 404 error to the global error handler
    if (!organizationDetails) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';
    res.render('organization', { title, organizationDetails, projects });
};

// Export any controller functions
export { showOrganizationsPage, showOrganizationDetailsPage };
