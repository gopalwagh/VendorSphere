export const USER_ROLE = "user";
export const SELLER_ROLE = "seller";
export const LEGACY_ADMIN_ROLE = "admin";
export const SUPER_ADMIN_ROLE = "superAdmin";

export const REGISTERABLE_ROLES = [USER_ROLE, SELLER_ROLE];
export const SELLER_ROLES = [SELLER_ROLE, LEGACY_ADMIN_ROLE];

export const normalizeRole = (role) => {
  if (!role) return role;

  const trimmedRole = String(role).trim();
  const lowerRole = trimmedRole.toLowerCase();

  if (lowerRole === LEGACY_ADMIN_ROLE) {
    return SELLER_ROLE;
  }

  if (lowerRole === SUPER_ADMIN_ROLE.toLowerCase() || lowerRole === "super-admin") {
    return SUPER_ADMIN_ROLE;
  }

  if (lowerRole === USER_ROLE) {
    return USER_ROLE;
  }

  if (lowerRole === SELLER_ROLE) {
    return SELLER_ROLE;
  }

  return trimmedRole;
};

export const isSellerRole = (role) => normalizeRole(role) === SELLER_ROLE;

export const isSuperAdminRole = (role) =>
  normalizeRole(role) === SUPER_ADMIN_ROLE;

export const isPrivilegedOrderRole = (role) =>
  isSellerRole(role) || isSuperAdminRole(role);
