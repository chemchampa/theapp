import styled from 'styled-components';
import { colors } from '../../components/GlobalStyle';

export const RoastedCoffeePricesContainer = styled.div`
  padding: 20px 0;
  width: 100%;
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-X: hidden;
  overflow-y: auto;
  height: calc(100vh - 230px); // Adjust this value based on the height of your FixedFunctionalityBar
  margin-bottom: 100px;
`;

export const StyledInput = styled.input`
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const StyledSelect = styled.select`
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  color: grey;
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const ColumnSelectorOverlay = styled.div`
  position: absolute;
  bottom: auto;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 600px;
  margin-bottom: 5px;
`;

export const ColumnSelectorContent = styled.div`
  padding: 15px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
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

  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    margin: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: 1px solid #ccc;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    position: relative;

    &:checked {
      background-color: #2196F3;
      border-color: #2196F3;

      &:after {
        content: '';
        position: absolute;
        left: 4px;
        top: 0px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
      }
    }
  }

  label {
    font-size: 14px;
    cursor: pointer;
  }
`;


export const CloseButton = styled(Button)`
  margin-top: 15px;
  width: 100%;
`;

export const SortIcon = styled.span`
  font-size: 10px;
  margin-left: 5px;
`;


