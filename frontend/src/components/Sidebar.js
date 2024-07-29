import React, { useState } from 'react';
import {
  SidebarContainer,
  SidebarLink,
  SubMenu,
  SubMenuToggle
} from './GlobalStyle';

const Sidebar = ({ isVisible, user }) => {
  console.log('Sidebar user prop:', user);
  const [dispatchHubOpen, setDispatchHubOpen] = useState(false);
  const [wholesaleCustomersDetailsOpen, setwholesaleCustomersDetailsOpen] = useState(false);
  const [pricingOpen, setpricingOpen] = useState(false);

  return (
      <SidebarContainer isVisible={isVisible}>
          <h2>Home</h2>
          <ul>
              <li><SidebarLink to="/dashboard">Dashboard</SidebarLink></li>
              <li>
                  <SubMenuToggle onClick={() => setDispatchHubOpen(!dispatchHubOpen)}>
                      Dispatch Hub {dispatchHubOpen ? '▼' : '＋'}
                  </SubMenuToggle>
                  <SubMenu isOpen={dispatchHubOpen}>
                      <li><SidebarLink to="/wholesale-orders">Wholesale Orders</SidebarLink></li>
                      <li><SidebarLink to="/wholesale-order-picking">Wholesale Order Picking</SidebarLink></li>
                      <li><SidebarLink to="/place-order">Place Order</SidebarLink></li>
                  </SubMenu>
              </li>
              <li><SidebarLink to="/retail-online-orders">Retail Online Orders</SidebarLink></li>
              <li><SidebarLink to="/products">Products</SidebarLink></li>
              <li>
                  <SubMenuToggle onClick={() => setwholesaleCustomersDetailsOpen(!wholesaleCustomersDetailsOpen)}>
                      Wholesale Customers {wholesaleCustomersDetailsOpen ? '▼' : '＋'}
                  </SubMenuToggle>
                  <SubMenu isOpen={wholesaleCustomersDetailsOpen}>
                      <li><SidebarLink to="/wholesale-customers-details">Wholesale Customers Details</SidebarLink></li>
                      <li><SidebarLink to="/wholesale-customers-prices">Wholesale Customers Pricing</SidebarLink></li>
                  </SubMenu>
              </li>
              <li>
                  <SubMenuToggle onClick={() => setpricingOpen(!pricingOpen)}>
                      Prices {pricingOpen ? '▼' : '＋'}
                  </SubMenuToggle>
                  <SubMenu isOpen={pricingOpen}>
                      <li><SidebarLink to="/green-coffee-prices">Green Coffee Prices</SidebarLink></li>
                      <li><SidebarLink to="/roasted-coffee-prices">Roasted Coffee Prices</SidebarLink></li>
                      <li><SidebarLink to="/prices-calculator">Prices Calculator</SidebarLink></li>
                  </SubMenu>
              </li>
              {user && user.role === 'admin' && (
                <li><SidebarLink to="/admin">Admin Panel</SidebarLink></li>
              )}
          </ul>
      </SidebarContainer>
  );
};

export default Sidebar;
