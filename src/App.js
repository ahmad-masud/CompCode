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

const Home = React.lazy(() => import("./pages/home"));
const Companies = React.lazy(() => import("./pages/companies"));
const Roadmap = React.lazy(() => import("./pages/roadmap"));
const Lessons = React.lazy(() => import("./pages/lessons"));
const Lesson = React.lazy(() => import("./pages/lesson"));
const Quiz = React.lazy(() => import("./pages/quiz"));
const Problems = React.lazy(() => import("./pages/problems"));
const Premium = React.lazy(() => import("./pages/premium"));
const Policy = React.lazy(() => import("./pages/policy"));
const Terms = React.lazy(() => import("./pages/terms"));
const NotFound = React.lazy(() => import("./pages/notfound"));

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const App = () => {
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displayReport, setDisplayReport] = useState(false);

  const routes = [
    { path: "/", element: <Home /> },
    { path: "/companies", element: <Companies /> },
    { path: "/roadmap", element: <Roadmap /> },
    { path: "/lessons", element: <Lessons /> },
    { path: "/lesson/:lessonId", element: <Lesson /> },
    { path: "/quiz/:quizId", element: <Quiz /> },
    { path: "/companies/:Id", element: <Problems page="companies" /> },
    { path: "/roadmap/:Id", element: <Problems page="roadmap" /> },
    { path: "/premium", element: <Premium /> },
    { path: "/policy", element: <Policy /> },
    { path: "/terms", element: <Terms /> },
    { path: "*", element: <NotFound /> },
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
