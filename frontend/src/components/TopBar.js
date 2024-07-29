import React from 'react';
import {
    ToggleSidebarButton,
    SearchContainer,
    SearchBar,
    UserProfile,
    UserAvatar,
    TopBarContainer,
} from './GlobalStyle';

const TopBar = ({ toggleSidebar, isSidebarVisible }) => (
    <TopBarContainer>
      <ToggleSidebarButton onClick={toggleSidebar} isSidebarVisible={isSidebarVisible}>
        {isSidebarVisible ? '◀' : '▶'}
      </ToggleSidebarButton>
      <SearchContainer>
        <SearchBar placeholder="Search orders..." />
      </SearchContainer>
      <UserProfile>
        <UserAvatar />
        <span>John Doe</span>
      </UserProfile>
    </TopBarContainer>
  );

export default TopBar;
