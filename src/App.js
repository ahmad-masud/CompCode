import React, { useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AlertsProvider } from "./context/alertscontext";
import { UserProvider } from "./context/usercontext";
import Navbar from "./components/navbar";
import Alerts from "./components/alerts";
import Footer from "./components/footer";
import Settings from "./components/settings";
import Report from "./components/report";
import ScrollToTop from "./utils/scrolltotop";
import "./styles/app.css";

import Home from "./pages/home";
import Companies from "./pages/companies";
import Roadmap from "./pages/roadmap";
import Lessons from "./pages/lessons";
import Lesson from "./pages/lesson";
import Quiz from "./pages/quiz";
import Problems from "./pages/problems";
import Premium from "./pages/premium";
import Policy from "./pages/policy";
import Terms from "./pages/terms";
import NotFound from "./pages/notfound";

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
                      <Route key={key || path} path={path} element={element} />
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
        </UserProvider>
      </AlertsProvider>
    </div>
  );
};

export default App;
