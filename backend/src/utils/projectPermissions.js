const WORKSPACE_ADMIN_ROLES = ["owner", "admin"];

export function projectRoleFor(project, userId, workspaceRole) {
  if (WORKSPACE_ADMIN_ROLES.includes(workspaceRole)) return "editor";

  const override = project.memberRoles?.find((m) => String(m.user) === String(userId));
  if (override) return override.role;

  if (workspaceRole === "viewer" || workspaceRole === "guest") return "viewer";
  return "editor";
}

export function canEditProject(project, userId, workspaceRole) {
  return projectRoleFor(project, userId, workspaceRole) === "editor";
}
