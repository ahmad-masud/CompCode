import React, { useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AlertsProvider } from "./context/alertscontext";
import { ThemeProvider } from "./context/themecontext";
import { UserProvider } from "./context/usercontext";
import Navbar from "./components/navbar";
import Alerts from "./components/alerts";
import Footer from "./components/footer";
import Settings from "./components/settings";
import Report from "./components/report";
import ScrollToTop from "./utils/scrolltotop";
import "./styles/app.css";

const HomePage = React.lazy(() => import("./pages/home"));
const CompaniesPage = React.lazy(() => import("./pages/companies"));
const RoadmapPage = React.lazy(() => import("./pages/roadmap"));
const LessonsPage = React.lazy(() => import("./pages/lessons"));
const LessonPage = React.lazy(() => import("./pages/lesson"));
const QuizPage = React.lazy(() => import("./pages/quiz"));
const ProblemsPage = React.lazy(() => import("./pages/problems"));
const PremiumPage = React.lazy(() => import("./pages/premium"));
const PolicyPage = React.lazy(() => import("./pages/policy"));
const TermsPage = React.lazy(() => import("./pages/terms"));
const NotFoundPage = React.lazy(() => import("./pages/notfound"));

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const App = () => {
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displayReport, setDisplayReport] = useState(false);

  const routes = [
    { path: "/", element: <HomePage /> },
    { path: "/companies", element: <CompaniesPage /> },
    { path: "/roadmap", element: <RoadmapPage /> },
    { path: "/lessons", element: <LessonsPage /> },
    { path: "/lesson/:lessonId", element: <LessonPage /> },
    { path: "/quiz/:quizId", element: <QuizPage /> },
    { path: "/companies/:Id", element: <ProblemsPage page="companies" /> },
    { path: "/roadmap/:Id", element: <ProblemsPage page="roadmap" /> },
    { path: "/premium", element: <PremiumPage /> },
    { path: "/policy", element: <PolicyPage /> },
    { path: "/terms", element: <TermsPage /> },
    { path: "*", element: <NotFoundPage /> },
  ];

  return (
    <div className="app">
      <AlertsProvider>
        <UserProvider>
          <ThemeProvider>
            <Alerts />
            {displaySettings && (
              <Settings onClose={() => setDisplaySettings(false)} />
            )}
            <Report
              onClose={() => setDisplayReport(false)}
              onOpen={() => setDisplayReport(true)}
              open={displayReport}
            />
            <Router>
              <Navbar onSettingsOpen={() => setDisplaySettings(true)} />
              <Suspense>
                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <ScrollToTop />
                    <Routes>
                      {routes.map(({ path, element, key }) => (
                        <Route
                          key={key || path}
                          path={path}
                          element={element}
                        />
                      ))}
                    </Routes>
                  </Elements>
                ) : (
                  <Routes>
                    {routes.map(({ path, element, key }) => (
                      <Route key={key || path} path={path} element={element} />
                    ))}
                  </Routes>
                )}
              </Suspense>
              <Footer />
            </Router>
          </ThemeProvider>
        </UserProvider>
      </AlertsProvider>
    </div>
  );
};

export default App;
