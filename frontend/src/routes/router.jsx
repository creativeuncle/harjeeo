import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import TasksPage from "@/pages/tasks/TasksPage";
import TaskDetailPage from "@/pages/tasks/TaskDetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import DocsPage from "@/pages/docs/DocsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import WorkspaceSettingsPage from "@/pages/workspace/WorkspaceSettingsPage";
import AcceptInvitePage from "@/pages/workspace/AcceptInvitePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:id", element: <ProjectDetailPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "tasks/:id", element: <TaskDetailPage /> },
          { path: "docs", element: <DocsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "workspace/:id/settings", element: <WorkspaceSettingsPage /> },
          { path: "invites/accept", element: <AcceptInvitePage /> },
        ],
      },
    ],
  },
]);
