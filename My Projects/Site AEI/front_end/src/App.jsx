import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";

import HomePage from "./pages/home";
import CoursPage from "./pages/cours";
import FavoritePage from "./pages/favorite";
import ChatbotAIPage from "./pages/chatbot";
import MyAnnoncePage from "./pages/annonce";
import EventsPage from "./pages/events";
import ForumPage from "./pages/forum";
import StagePage from "./pages/stage";
import ProjetsPage from "./pages/my-projets";
import PublicitePage from "./pages/publs";
import ColocationPage from "./pages/colocation";
import MarketPlacePage from "./pages/marketplace";
import ProfilePage from "./pages/profile";
import ClubsPage from "./pages/clubs";

import DiscoverProjectsPage from "./pages/projets/discover";
import ProjectDetailPage from "./pages/projets/project-detail";
import ProjectCreateEditPage from "./pages/projets/project-create-edit";

import ConnexionPage from "./pages/connexion";
import RegisterPage from "./pages/register";
import ForgotPasswordPage from "./pages/forgot-password";
import ResetPasswordPage from "./pages/reset-password";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProjectDraftProvider } from "./context/ProjectDraftContext";
import { HousingProvider } from "./context/HousingContext";
import CreateListingModal from "./components/housing/CreateListingModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
            <ProjectDraftProvider>
              <HousingProvider>
                <Router>
                  <Layout>
                <Routes>
                  {/* Authentification Routes */}
                  <Route path="/connexion" element={<ConnexionPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cours" element={<CoursPage />} />
                  <Route path="/evenements" element={<EventsPage />} />
                  <Route path="/forum-communaute" element={<ForumPage />} />
                  <Route path="/stages-opportunites" element={<StagePage />} />
                  <Route path="/publicites" element={<PublicitePage />} />
                  <Route path="/colocation" element={<ColocationPage />} />
                  <Route path="/marketplace" element={<MarketPlacePage />} />
                  <Route path="/projets" element={<DiscoverProjectsPage />} />
                  <Route path="/projets/:slug" element={<ProjectDetailPage />} />
                  <Route path="/clubs" element={<ClubsPage />} />

                  {/* Protected Routes (Authenticated only) */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favori"
                    element={
                      <ProtectedRoute>
                        <FavoritePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chatbot"
                    element={
                      <ProtectedRoute>
                        <ChatbotAIPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mes-annonces"
                    element={
                      <ProtectedRoute>
                        <MyAnnoncePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mes-projets"
                    element={
                      <ProtectedRoute>
                        <ProjetsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projets/create"
                    element={
                      <ProtectedRoute>
                        <ProjectCreateEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projets/edit/:id"
                    element={
                      <ProtectedRoute>
                        <ProjectCreateEditPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
              <CreateListingModal />
            </Router>
            </HousingProvider>
            </ProjectDraftProvider>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

