import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import PublicLayout from './components/PublicLayout';
import AuthLayout from './components/AuthLayout';

import Home from './pages/Home';
import DynamicPage from './pages/DynamicPage';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Actualites from './pages/Actualites';
import ActualitePost from './pages/ActualitePost';
import Agenda from './pages/Agenda';
import Contact from './pages/Contact';
import MemberSpace from './pages/MemberSpace';
import MyAccount from './pages/MyAccount';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import PagesList from './admin/PagesList';
import PageEditor from './admin/PageEditor';
import ArticlesList from './admin/ArticlesList';
import ArticleEditor from './admin/ArticleEditor';
import CategoriesAdmin from './admin/CategoriesAdmin';
import MembersAdmin from './admin/MembersAdmin';
import MenusAdmin from './admin/MenusAdmin';
import MediaAdmin from './admin/MediaAdmin';
import SettingsAdmin from './admin/SettingsAdmin';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Site public (avec header/footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/presentation" element={<DynamicPage fixedSlug="presentation" />} />
              <Route path="/pages/:slug" element={<DynamicPage />} />
              <Route path="/membres" element={<Members />} />
              <Route path="/membres/:slug" element={<MemberProfile />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/actualites/:slug" element={<ActualitePost />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/espace-membre"
                element={<ProtectedRoute><MemberSpace /></ProtectedRoute>}
              />
              <Route
                path="/mon-compte"
                element={<ProtectedRoute><MyAccount /></ProtectedRoute>}
              />
            </Route>

            {/* Pages d'authentification : sans header ni footer */}
            <Route element={<AuthLayout />}>
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
              <Route path="/verifier-email" element={<VerifyEmail />} />
            </Route>

            {/* Back office admin */}
            <Route
              path="/admin"
              element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}
            >
              <Route index element={<Dashboard />} />
              <Route path="pages" element={<PagesList />} />
              <Route path="pages/:id" element={<PageEditor />} />
              <Route path="articles" element={<ArticlesList />} />
              <Route path="articles/:id" element={<ArticleEditor />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="membres" element={<MembersAdmin />} />
              <Route path="menus" element={<MenusAdmin />} />
              <Route path="medias" element={<MediaAdmin />} />
              <Route path="parametres" element={<SettingsAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
