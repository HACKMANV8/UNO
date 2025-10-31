import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { initializeAuth } from "@/store/firebaseAuthStore";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignupSelectionPage from "./pages/SignupSelectionPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import FirebaseStudentSignupPage from "./pages/FirebaseStudentSignupPage";
import RecruiterSignupPage from "./pages/RecruiterSignupPage";
import FirebaseRecruiterSignupPage from "./pages/FirebaseRecruiterSignupPage";
import FirebaseIssuerSignupPage from "./pages/FirebaseIssuerSignupPage";
import IssuerSignupPage from "./pages/IssuerSignupPage";
import AuthoritySignupPage from "./pages/AuthoritySignupPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentResumeBuilderPage from "./pages/StudentResumeBuilderPage";
import StudentJobApplicationsPage from "./pages/StudentJobApplicationsPage";
import StudentInterviewPrepPage from "./pages/StudentInterviewPrepPage";
import StudentInterviewSimulationPage from "./pages/StudentInterviewSimulationPage";
import StudentAICoachPage from "./pages/StudentAICoachPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import StudentResumeEditorPage from "./pages/StudentResumeEditorPage";
import IssuerDashboardPage from "./pages/IssuerDashboardPage";
import IssuerIssuePage from "./pages/IssuerIssuePage";
import IssuerHistoryPage from "./pages/IssuerHistoryPage";
import RecruiterDashboardPage from "./pages/RecruiterDashboardPage";
import RecruiterVerifyPage from "./pages/RecruiterVerifyPage";
import AuthorizationDashboardPage from "./pages/AuthorizationDashboardPage";
import FirebaseAuthorityDashboard from "./pages/FirebaseAuthorityDashboard";
import FirebaseIssuerDashboard from "./pages/FirebaseIssuerDashboard";
import FirebaseStudentDashboard from "./pages/FirebaseStudentDashboard";
import AuthorizationStatusPage from "./pages/AuthorizationStatusPage";
import NotFound from "./pages/NotFound";
import StudentPricingPage from "./pages/StudentPricingPage";
import RecruiterPricingPage from "./pages/RecruiterPricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import SubscriptionPage from "./pages/SubscriptionPage";

const queryClient = new QueryClient();

// Layout wrapper for authenticated pages
function AuthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Home redirect based on role
function DashboardRedirect() {
  const { isLoggedIn, user } = useAuth();

  // Debug logging to see what user data we have
  console.log('DashboardRedirect - isLoggedIn:', isLoggedIn);
  console.log('DashboardRedirect - user:', user);
  console.log('DashboardRedirect - user role:', user?.role);

  if (!isLoggedIn) {
    console.log('Not logged in, redirecting to HomePage');
    return <HomePage />;
  }

  if (user?.role === 'issuer_staff' || user?.role === 'issuer_admin') {
    console.log('Issuer user, redirecting to issuer dashboard');
    return <Navigate to="/issuer/dashboard" replace />;
  }

  if (user?.role === 'recruiter') {
    console.log('Recruiter user, redirecting to recruiter dashboard');
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  if (user?.role === 'authority') {
    console.log('Authority user, redirecting to authorization dashboard');
    return <Navigate to="/authorization" replace />;
  }

  console.log('Default redirect to student dashboard');
  return <Navigate to="/student/dashboard" replace />;
}

const App = () => {
  useEffect(() => {
    // Initialize Firebase auth on app start
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/select" element={<SignupSelectionPage />} />
          <Route path="/signup/student" element={<StudentSignupPage />} />
          <Route path="/signup/firebase-student" element={<FirebaseStudentSignupPage />} />
          <Route path="/signup/recruiter" element={<RecruiterSignupPage />} />
          <Route path="/signup/firebase-recruiter" element={<FirebaseRecruiterSignupPage />} />
          <Route path="/signup/issuer" element={<IssuerSignupPage />} />
          <Route path="/signup/firebase-issuer" element={<FirebaseIssuerSignupPage />} />
          <Route path="/signup/authority" element={<AuthoritySignupPage />} />
          <Route path="/authorization-status" element={<AuthorizationStatusPage />} />
          
          {/* Pricing routes - accessible to all users */}
          <Route path="/pricing/student" element={<StudentPricingPage />} />
          <Route path="/pricing/recruiter" element={<RecruiterPricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Protected routes with layout */}
          <Route element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }>
            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <FirebaseStudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/resume" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResumeBuilderPage />
              </ProtectedRoute>
            } />
            <Route path="/student/job-applications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentJobApplicationsPage />
              </ProtectedRoute>
            } />
            <Route path="/student/interview" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentInterviewSimulationPage />
              </ProtectedRoute>
            } />
            <Route path="/student/ai-coach" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAICoachPage />
              </ProtectedRoute>
            } />
            <Route path="/student/resume/editor/:templateId?" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResumeEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/student/resume/edit/:resumeId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResumeEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/student/settings" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSettingsPage />
              </ProtectedRoute>
            } />

            {/* Subscription Management - accessible to all authenticated users */}
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Issuer routes */}
            <Route path="/issuer/dashboard" element={
              <ProtectedRoute allowedRoles={['issuer_staff', 'issuer_admin']}>
                <FirebaseIssuerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/issuer/issue" element={
              <ProtectedRoute allowedRoles={['issuer_staff', 'issuer_admin']}>
                <IssuerIssuePage />
              </ProtectedRoute>
            } />
            <Route path="/issuer/history" element={
              <ProtectedRoute allowedRoles={['issuer_staff', 'issuer_admin']}>
                <IssuerHistoryPage />
              </ProtectedRoute>
            } />

            {/* Recruiter routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/verify" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterVerifyPage />
              </ProtectedRoute>
            } />

            {/* Authority routes */}
            <Route path="/authorization" element={
              <ProtectedRoute allowedRoles={['authority']}>
                <FirebaseAuthorityDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<DashboardRedirect />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
