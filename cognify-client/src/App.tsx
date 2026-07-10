import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../landingSettings/context/theme-provider";
import { Nav as Navbar } from "./pages/landingpage/Home";
import { Footer } from "../notusComponents/footer";

// Public Landing Page Components
import Home from "./pages/landingpage/Home";
import About from "./pages/landingpage/About";
import Blog from "./pages/landingpage/Blog";
import BlogPost from "./pages/landingpage/BlogPost";
import Careers from "./pages/landingpage/Careers";
import Contact from "./pages/landingpage/Contact";
import Playground from "./pages/landingpage/Playground";
import Pricing from "./pages/landingpage/Pricing";
import SignIn from "./pages/landingpage/SignIn";
import SignUp from "./pages/landingpage/SignUp";

// Private Dashboard Layout & Pages
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { ExecutiveDashboard } from "./pages/dashboard/ExecutiveDashboard";
import { AIChat } from "./pages/dashboard/AIChat";
import { Workspaces } from "./pages/dashboard/Workspaces";
import { Agents } from "./pages/dashboard/Agents";
import { Analytics } from "./pages/dashboard/Analytics";
import { Collaboration } from "./pages/dashboard/Collaboration";
import { Files } from "./pages/dashboard/Files";
import { Workflows } from "./pages/dashboard/Workflows";
import { Settings } from "./pages/dashboard/Settings";

// New Connected Pages
import { Prompts } from "./pages/dashboard/Prompts";
import { Integrations } from "./pages/dashboard/Integrations";
import { APIKeys } from "./pages/dashboard/APIKeys";
import { Billing } from "./pages/dashboard/Billing";
import { Memory } from "./pages/dashboard/Memory";
import { NotFound } from "./pages/NotFound";

// Public layout with marketing navbar & footer
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-foreground">
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Auth layout always forces dark mode
const AuthLayout = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Marketing Landing Pages */}
            <Route path="/" element={<Home />} />
            <Route element={<PublicLayout />}>
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* Auth Pages (Forced Dark Mode) */}
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Route>

            {/* Private SaaS Dashboard (AI Operations Platform) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="workspaces" element={<AIChat />} />
              <Route path="agents" element={<AIChat />} />
              <Route path="analytics" element={<AIChat />} />
              <Route path="prompts" element={<Prompts />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="memory" element={<Memory />} />
              <Route path="files" element={<Files />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="collaboration" element={<Collaboration />} />
              <Route path="apikeys" element={<APIKeys />} />
              <Route path="billing" element={<Navigate to="/dashboard/chat?plan=PRO" replace />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
