import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import TasksPage from "@/pages/tasks/TasksPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "tasks", element: <TasksPage /> },
    ],
  },
]);
