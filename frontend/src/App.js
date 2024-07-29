import React, { useContext } from 'react';
import { UserContext } from './contexts/UserContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import WholesaleOrderPicking from './features/WholesaleOrderPicking/WholesaleOrderPicking';
import PlaceOrder from './features/PlaceOrder/PlaceOrder';
import WholesaleCustomersDetails from './features/WholesaleCustomersDetails/WholesaleCustomersDetails';
import WholesaleCustomersPrices from './features/WholesaleCustomersPrices/WholesaleCustomersPrices';
import CustomerForm from './features/WholesaleCustomersDetails/CustomerForm';
import RoastedCoffeePrices from './features/RoastedCoffeePrices/RoastedCoffeePrices';
import PricesCalculator from './features/PricesCalculator/PricesCalculator';
import SelectOrganization from './components/SelectOrganization';
import RegisterPage from './components/RegisterPage';
import AdminPanel from './components/AdminPanel';
// Import other feature components when neccessary

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/wholesale-order-picking" element={<WholesaleOrderPicking />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/" element={<WholesaleOrderPicking />} />
            <Route path="/wholesale-customers-details" element={<WholesaleCustomersDetails />} />
            <Route path="/wholesale-customers-prices" element={<WholesaleCustomersPrices />} />
            <Route path="/add-customer" element={<CustomerForm />} />
            <Route path="/roasted-coffee-prices" element={<RoastedCoffeePrices />} />
            <Route path="/prices-calculator" element={<PricesCalculator />} />
            <Route path="/select-organization" element={<SelectOrganization />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/debug" element={<Debug />} />
            {/* Add routes for other features */}
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

const Debug = () => {
  const { user } = useContext(UserContext);
  return (
    <div>
      <h2>Debug Info</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};


export default App;
