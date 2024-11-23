import React, { useState } from "react";
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
import lessons from "./content/lessons.json";
import quizzes from "./content/quizzes.json";
import importAllPages from "./utils/importallpages";
import "./styles/app.css";

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(String(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY))
  : null;

const pages = importAllPages(require.context("./pages", false, /\.js$/));

const App = () => {
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displayReport, setDisplayReport] = useState(false);

  const routes = [
    { path: "/", element: React.createElement(pages["home"]) },
    { path: "/companies", element: React.createElement(pages["companies"]) },
    { path: "/roadmap", element: React.createElement(pages["roadmap"]) },
    {
      path: "/lessons",
      element: React.createElement(pages["lessons"], { lessons }),
    },
    { path: "/premium", element: React.createElement(pages["premium"]) },
    { path: "/policy", element: React.createElement(pages["policy"]) },
    { path: "/terms", element: React.createElement(pages["terms"]) },
    ...lessons.map((lesson, index) => ({
      path: `/lesson/${lesson.title.replaceAll(" ", "-").toLowerCase()}`,
      element: React.createElement(pages["lesson"], { data: lesson }),
      key: `lesson-${lesson.id}-${index}`,
    })),
    ...quizzes.map((quiz, index) => ({
      path: `/quiz/${quiz.title.replaceAll(" ", "-").toLowerCase()}`,
      element: React.createElement(pages["quiz"], { data: quiz }),
      key: `quiz-${quiz.id}-${index}`,
    })),
    { path: "*", element: React.createElement(pages["notfound"]) },
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
              {stripePromise && (
                <Elements stripe={stripePromise}>
                  <ScrollToTop />
                  <Routes>
                    {routes.map((route) =>
                      route.key ? (
                        <Route
                          key={route.key}
                          path={route.path}
                          element={route.element}
                        />
                      ) : (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={route.element}
                        />
                      )
                    )}
                  </Routes>
                </Elements>
              )}
              <Footer />
            </Router>
          </ThemeProvider>
        </UserProvider>
      </AlertsProvider>
    </div>
  );
};

export default App;
