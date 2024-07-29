import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import DatePicker from "react-datepicker";

export const colors = {
    background: '#f6f6f7',
    tableHeader: '#f9fafb',
    tableRowEven: '#ffffff',
    tableRowOdd: '#f9f9f9',
    tableRowHover: '#f1f8ff',
    text: '#414446',
    textLight: '#6d7175',
    border: '#eff1f2',
};

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${colors.background};
    color: ${colors.text};
  }
`;

// v.1
// export const AppContainer = styled.div`
//   display: flex;
//   height: 100vh;
// `;
// v.2
export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow-x: auto;
`;

// export const SidebarContainer = styled.div`
//   width: ${props => props.isVisible ? '240px' : '0'};
//   background-color: #ebebeb;
//   color: #414446;
//   padding: ${props => props.isVisible ? '20px' : '0'};
//   transition: all 0.3s ease;
//   overflow: hidden;
//   height: 100vh;
//   position: fixed;
//   left: 0;
//   top: 0;
//   z-index: 1000;
// `;

export const SidebarContainer = styled.div`
  width: ${props => props.isVisible ? '180px' : '0'};
  background-color: #ebebeb;
  color: #414446;
  padding: ${props => props.isVisible ? '20px' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  font-size: 14px;

  h2 {
    font-size: 16px;
    margin-bottom: 15px;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 10px;
  }
`;


export const ToggleSidebarButton = styled.button`
  position: fixed;
  left: ${props => props.isSidebarVisible ? '180px' : '0'};
  top: 10px;
  background-color: #ebebeb;
  color: #202223;
  border: none;
  padding: 10px;
  cursor: pointer;
  transition: left 0.3s ease;
  z-index: 1001;
`;

export const SubMenu = styled.ul`
    list-style-type: none;
    padding-left: 20px;
    max-height: ${props => props.isOpen ? '1000px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-out;
`;

export const SubMenuToggle = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    //padding: 5px 0;
    padding: 5px 0 5px 10px;
    &:hover {
      background-color: #dddddd;
      border-radius: 5px;
    }
`;

export const SidebarLink = styled(Link)`
  color: #414446;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
  display: block;
  padding: 5px 0 5px 10px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #dddddd; //#f0f0f0
    border-radius: 5px;
  }
  
  ${SubMenu} & {
    font-size: 12px;
    font-weight: normal;
    padding: 5px 0px 5px 20px;
    &:hover {
      background-color: #dddddd;
      border-radius: 5px;
    }
      &:active {
      background-color: #cdcdcd;
    }
  }

  &:active {
    background-color: #cdcdcd;
  }
`;


export const MainContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: ${props => props.isSidebarVisible ? '240px' : '0'};
  overflow: auto;
`;

// export const MainContent = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   min-width: 800px;
//   max-width: 100%;
//   transition: margin-left 0.3s ease;
//   padding: 0px 40px 0px 40px;
//   overflow-x: hidden;
// `;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 80px); // Subtracting left and right padding
  min-width: 800px;
  transition: margin-left 0.3s ease;
  padding: 0px 40px 0px 40px;
  overflow-x: hidden;
`;

export const ContentContainer = styled.div`
  width: 100%;
  padding: 20px 20px 20px 0px;
  // Remove horizontal scrollbar by default
  overflow-x: hidden;
  overflow-y: hidden;
  max-height: calc(100vh - 60px); // Adjust based on your TopBar height
  
  // Add horizontal scrollbar only when content width exceeds viewport width
  @media (max-width: 800px) { // Adjust this value based on your content's minimum width
    overflow-x: auto;
  }
`;


export const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #eff1f2;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid ${colors.border};
  width: 100%;
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

export const SearchBar = styled.input`
  padding: 8px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  width: 300px;
`;

export const UserProfile = styled.div`
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 10px;
`;

export const StyledDatePicker = styled(DatePicker)`
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
`;

export const DatePickerContainer = styled.div`
  position: relative;
`;

export const ActionButton = styled.button`
  background-color: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
  // font-size: 13px;
  &:hover {
    background-color: #e0e0e0;
  }
`;

export const CustomScrollbar = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: #cfcccc;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: #cfcccc #f1f1f1;
  }
`;

// export const FunctionalityBar = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 10px 20px;
//   background-color: #f9fafb;
//   border-bottom: 1px solid ${colors.border};
//   margin-bottom: 16px;
//   position: sticky;
// `;

export const FunctionalityBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9fafb;
  // border-bottom: 1px solid ${colors.border};
  // margin-bottom: 16px;
  position: relative;
  width: 100%; // Ensure it takes full width
  box-sizing: border-box; // Include padding in the width calculation
`;

export const FixedFunctionalityBar = styled(FunctionalityBar)`
  position: sticky;
  top: 0;
  z-index: 10;
  // background-color: ${colors.background};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%; // Ensure it takes full width
  box-sizing: border-box; // Include padding in the width calculation
`;


//////////////////////////

export const TableHeader = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

export const Table = styled.table`
  table-layout: fixed;
  width: 100%;
  min-width: 1200px;
  max-width: 100%; // Ensures table doesn't exceed container width
  border-collapse: separate;
  border-spacing: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: ${colors.tableRowEven};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
`;

export const TableScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin-right: -40px; // This compensates for the right padding of MainContent
  padding-right: 40px; // This adds the padding back to the scrollable area
`;

export const Th = styled.th`
  background-color: ${colors.tableHeader};
  color: ${colors.text};
  font-weight: 600;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid ${colors.border};
  position: relative;
  font-size: 13px;
`;

export const ThMain = styled(Th)`
  border-bottom: none;
`;

export const ThSub = styled(Th)`
  font-weight: normal;
  padding-top: 4px;
`;

export const ThContent = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover span {
    opacity: 1 !important;
  }
`;

export const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.text};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CustomerRow = styled.tr`
  background-color: ${colors.tableRowEven};
  &:nth-child(odd) {
    background-color: ${colors.tableRowOdd};
  }
  &:hover {
    background-color: ${colors.tableRowHover};
  }
  height: 32px;
`;

export const ItemRow = styled.tr`
  background-color: ${props => props.even ? colors.tableRowEven : colors.tableRowOdd};
  &:hover {
    background-color: ${colors.tableRowHover};
  }
  height: 32px;
`;

export const CustomerHeaderRow = styled(CustomerRow)`
  && {
    background-color: #e3e9f4;
    font-weight: bold;
    height: 40px;
    cursor: pointer;
  }
`;

/*
export const ResizeHandle = styled.div`
  position: absolute;
  right: -5px;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  user-select: none;
  &:hover {
    background-color: #0000ff33;
  }
`;
*/

export const ResizeHandle = styled.div`
  position: absolute;
  right: -5px;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  z-index: 1;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const ToggleButton = styled.span`
  margin-right: 8px;
  transition: transform 0.3s;
  display: inline-block;
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
`;


// export const Button = styled.button`
//   background-color: #4CAF50;
//   color: white;
//   padding: 10px 15px;
//   border: none;
//   cursor: pointer;
//   margin-top: 10px;
// `;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  color: grey;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;
