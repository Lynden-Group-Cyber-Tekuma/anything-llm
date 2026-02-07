const { userFromSession } = require("../http");
const ROLES = {
  all: "<all>",
  admin: "admin",
  manager: "manager",
  default: "default",
};
const DEFAULT_ROLES = [ROLES.admin, ROLES.admin];

/**
 * Check that the requesting user has the appropriate role to access the route.
 * @param {string[]} allowedRoles - The roles that are allowed to access the route
 * @returns {function}
 */
function strictMultiUserRoleValid(allowedRoles = DEFAULT_ROLES) {
  return async (request, response, next) => {
    if (allowedRoles.includes(ROLES.all)) {
      next();
      return;
    }

    const user =
      response.locals?.user ?? (await userFromSession(request, response));
    if (allowedRoles.includes(user?.role)) {
      next();
      return;
    }
    return response.sendStatus(401).end();
  };
}

/**
 * Apply role permission checks for routes.
 * @param {string[]} allowedRoles - The roles that are allowed to access the route
 * @returns {function}
 */
function flexUserRoleValid(allowedRoles = DEFAULT_ROLES) {
  return async (request, response, next) => {
    if (allowedRoles.includes(ROLES.all)) {
      next();
      return;
    }

    const user =
      response.locals?.user ?? (await userFromSession(request, response));
    if (allowedRoles.includes(user?.role)) {
      next();
      return;
    }
    return response.sendStatus(401).end();
  };
}

module.exports = {
  ROLES,
  strictMultiUserRoleValid,
  flexUserRoleValid,
};
