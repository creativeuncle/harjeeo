import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import TasksPage from "@/pages/tasks/TasksPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import DocsPage from "@/pages/docs/DocsPage";

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
          { path: "docs", element: <DocsPage /> },
        ],
      },
    ],
  },
]);
