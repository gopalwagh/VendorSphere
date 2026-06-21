export const ROLES = Object.freeze({
  USER: "user",
  SELLER: "seller",
  SUPER_ADMIN: "superAdmin",
});

const ROLE_ALIASES = Object.freeze({
  admin: ROLES.SELLER,
  superadmin: ROLES.SUPER_ADMIN,
  "super-admin": ROLES.SUPER_ADMIN,
});

export const normalizeRole = (role) => {
  if (!role) return role;

  const trimmedRole = String(role).trim();
  const alias = ROLE_ALIASES[trimmedRole.toLowerCase()];

  if (alias) {
    return alias;
  }

  const lowerRole = trimmedRole.toLowerCase();

  if (lowerRole === ROLES.USER) return ROLES.USER;
  if (lowerRole === ROLES.SELLER) return ROLES.SELLER;
  if (lowerRole === ROLES.SUPER_ADMIN.toLowerCase()) return ROLES.SUPER_ADMIN;

  return trimmedRole;
};

export const getRoleLabel = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.SELLER:
      return "Seller";
    default:
      return "User";
  }
};

export const getRoleHomePath = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.SUPER_ADMIN:
      return "/super-admin";
    case ROLES.SELLER:
      return "/dashboard";
    default:
      return "/";
  }
};

