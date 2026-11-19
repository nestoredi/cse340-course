/**
 * Flash Message Middleware
 *
 * Provides temporary message storage that survives redirects but is consumed on render.
 * Messages are stored in the session and organized by type (success, error, warning, info).
 *
 * Usage in controllers:
 *   req.flash('success', 'Message text')  // Store a message
 *   req.flash('error')                    // Get all error messages
 *   req.flash()                           // Get all messages (all types)
 */

const emptyFlash = () => ({
    success: [],
    error: [],
    warning: [],
    info: []
});

/**
 * Initialize flash message storage and provide access methods
 */
const flashMiddleware = (req, res, next) => {
    /**
     * The flash function handles both setting and getting messages
     * - Called with 2 args (type, message): stores a new message
     * - Called with 1 arg (type): retrieves and clears messages of that type
     * - Called with 0 args: retrieves and clears all messages
     */
    req.flash = (type, message) => {
        // Initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            req.session.flash = emptyFlash();
        }

        // SETTING: two arguments means we are storing a new message
        if (type && message) {
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            req.session.flash[type].push(message);
            return;
        }

        // GETTING ONE TYPE: one argument means retrieve messages of that type
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }

        // GETTING ALL: no arguments means retrieve all message types
        const allMessages = req.session.flash;
        req.session.flash = emptyFlash();
        return allMessages;
    };

    next();
};

/**
 * Make the flash function available to all templates via res.locals.
 * This middleware must run AFTER flashMiddleware.
 */
const flashLocals = (req, res, next) => {
    // The function is NOT called here; messages are consumed only when a template calls flash()
    res.locals.flash = req.flash;
    next();
};

/**
 * Combined flash middleware that runs both functions in the correct order
 */
const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;
