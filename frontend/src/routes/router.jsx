import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import TasksPage from "@/pages/tasks/TasksPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "tasks", element: <TasksPage /> },
        ],
      },
    ],
  },
]);
