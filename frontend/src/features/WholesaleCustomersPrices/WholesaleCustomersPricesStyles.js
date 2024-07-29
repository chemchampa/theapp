import styled from 'styled-components';
import { colors } from '../../components/GlobalStyle';

export const WholesaleCustomersPricesContainer = styled.div`
  padding: 20px 0;
  width: 100%;
`;

export const StyledInput = styled.input`
  // width: 25%;
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const StyledSelect = styled.select` // This creates a styled <select> element
  // width: 100%;
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  color: grey;
  // background-color: #ffffff;
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// export const ColumnSelectorOverlay = styled.div`
//   position: absolute;
//   top: 100%;
//   right: 0;
//   background-color: white;
//   border: 1px solid #ccc;
//   box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//   z-index: 1000;
//   min-width: 300px;
// `;

export const ColumnSelectorOverlay = styled.div`
  position: absolute;
  bottom: auto;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 300px;
  margin-bottom: 5px;
`;

export const ColumnSelectorContent = styled.div`
  padding: 15px;
`;

export const ColumnSelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
`;

export const Button = styled.button`
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

export const ColumnList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

export const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const CloseButton = styled(Button)`
  margin-top: 15px;
  width: 100%;
`;

export const SortIcon = styled.span`
  font-size: 10px;
  margin-left: 5px;
`;

export const ThContent = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover span {
        opacity: 1 !important;
    }
`;

export const StatusDropdown = styled(StyledSelect)`
  width: 100%;
  padding: 5px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  background-color: ${props => {
    switch(props.value) {
      case 'Active': return '#e6f4ea';
      case 'Prospect': return '#fff0e0';
      case 'Archived': return '#f1f3f4';
      case 'Lost': return '#fce8e6';
      default: return 'white';
    }
  }};
`;
