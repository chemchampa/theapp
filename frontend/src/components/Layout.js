import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Sidebar from './Sidebar';
import {
    AppContainer,
    MainContentWrapper,
    MainContent,
    ContentContainer,
    GlobalStyle,
    CustomScrollbar, 
    ToggleSidebarButton,
    TopBar,
    SearchContainer,
    SearchBar,
    UserProfile,
    UserAvatar,
} from './GlobalStyle';


const Layout = ({ children }) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const { user } = useContext(UserContext);

    console.log('Layout render - user:', user);

  
    const toggleSidebar = () => {
      setIsSidebarVisible(!isSidebarVisible);
    };
  
    return (
      <>
        <GlobalStyle />
        <CustomScrollbar />
        <AppContainer>
          <Sidebar isVisible={isSidebarVisible} user={user} />
          <MainContentWrapper isSidebarVisible={isSidebarVisible}>
            <MainContent>
              <ToggleSidebarButton onClick={toggleSidebar} isSidebarVisible={isSidebarVisible}>
                {isSidebarVisible ? '◀' : '▶'}
              </ToggleSidebarButton>
              <TopBar>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
                <SearchContainer>
                  <SearchBar placeholder="Search orders..." />
                </SearchContainer>
                <UserProfile>
                  <UserAvatar />
                  <span>John Doe</span>
                </UserProfile>
              </TopBar>
              <ContentContainer isSidebarVisible={isSidebarVisible}>
                {children}
              </ContentContainer>
            </MainContent>
          </MainContentWrapper>
        </AppContainer>
      </>
    );
  };
  
  export default Layout;


  