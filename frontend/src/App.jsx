import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

import MyBusinesses from "./pages/business/MyBusinesses";
import BusinessWorkspace from "./pages/business/business_advisory/BusinessWorkspace";
import BusinessAnalysis from "./pages/business/business_advisory/BusinessAnalysis";
import FinancialAnalysis from "./pages/business/business_advisory/FinancialAnalysis";
import GovernmentSchemes from "./pages/business/business_advisory/GovernmentSchemes";

import PopulationAnalysis from "./pages/business/business_advisory/business_analysis/PopulationAnalysis";
import CompetitionAnalysis from "./pages/business/business_advisory/business_analysis/CompetitionAnalysis";
import SeasonalityAnalysis from "./pages/business/business_advisory/business_analysis/SeasonalityAnalysis";
import MarketPrices from "./pages/business/business_advisory/business_analysis/MarketPrices";
import SupplyChainAnalysis from "./pages/business/business_advisory/business_analysis/SupplyChainAnalysis";
import TransportationAnalysis from "./pages/business/business_advisory/business_analysis/TransportationAnalysis";

import Dashboard from "./pages/Dashboard";

import BusinessDetails from "./pages/business/business_detail/BusinessDetails";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <MainLayout>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/businesses" element={<MyBusinesses />} />
              <Route
                path="/businesses/:businessId"
                element={<BusinessWorkspace />}
              />

              <Route
                path="/businesses/:businessId/analysis"
                element={<BusinessAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/population"
                element={<PopulationAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/competitors"
                element={<CompetitionAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/seasonality"
                element={<SeasonalityAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/supply-chain"
                element={<SupplyChainAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/transportation"
                element={<TransportationAnalysis />}
              />
              <Route
                path="/businesses/:businessId/analysis/market-prices"
                element={<MarketPrices />}
              />

              <Route
                path="/businesses/:businessId/financial-analysis"
                element={<FinancialAnalysis />}
              />

              <Route
                path="/businesses/:businessId/government-schemes"
                element={<GovernmentSchemes />}
              />

              <Route path="/businesses/details" element={<BusinessDetails />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </MainLayout>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  </Router>
);
}
