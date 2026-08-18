import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminWorkspacesPage from "@/pages/admin/AdminWorkspacesPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/chat/ChatPage";
import NotesListPage from "@/pages/notes/NotesListPage";
import NoteDetailPage from "@/pages/notes/NoteDetailPage";
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
import SharedContentPage from "@/pages/share/SharedContentPage";
import TrashPage from "@/pages/trash/TrashPage";
import ReadingListPage from "@/pages/reading/ReadingListPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MeetingsPage from "@/pages/meetings/MeetingsPage";
import AiChatPage from "@/pages/ai/AiChatPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/share/:type/:id", element: <SharedContentPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "chat", element: <ChatPage /> },
          { path: "notes", element: <NotesListPage /> },
          { path: "notes/:id", element: <NoteDetailPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:id", element: <ProjectDetailPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "tasks/:id", element: <TaskDetailPage /> },
          { path: "docs", element: <DocsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "workspace/:id/settings", element: <WorkspaceSettingsPage /> },
          { path: "invites/accept", element: <AcceptInvitePage /> },
          { path: "trash", element: <TrashPage /> },
          { path: "reading-list", element: <ReadingListPage /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "meetings", element: <MeetingsPage /> },
          { path: "ai-chat", element: <AiChatPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "users", element: <AdminUsersPage /> },
              { path: "workspaces", element: <AdminWorkspacesPage /> },
              { path: "analytics", element: <AdminAnalyticsPage /> },
              { path: "settings", element: <AdminSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
