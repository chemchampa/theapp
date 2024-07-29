import styled from 'styled-components';
import { Table, ActionButton, colors } from '../../components/GlobalStyle';
  

// export const PlaceOrderContainer = styled.div`
//   max-width: 800px;
//   margin-top: 20px;
//   padding: 0px 20px 20px 0px;
// `;

// export const OrderForm = styled.div`
//   display: column;
//   gap: 0px;
//   background-color: #ededed;
//   border-radius: 8px;
//   width: 70%
// `;

// export const LeftColumn = styled.div`
//   flex: 0 0 50%; // This sets the column to 50% of the container width
//   max-width: 50%; // This ensures the column doesn't grow beyond 50%
// `;

// export const RightColumn = styled.div`
//   flex: 0 0 50%; // This sets the column to 50% of the container width
//   max-width: 50%; // This ensures the column doesn't grow beyond 50%
// `;


// export const FormGroup = styled.div`
//   margin: 15px 20px 15px 20px;
// `;

// export const Label = styled.label`
//   display: block;
//   margin-bottom: 5px;
//   font-weight: bold;
// `;

// export const ButtonGroup = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-top: 20px;
// `;

// export const OrderSummary = styled.div`
//   margin-top: 30px;
//   border-top: 1px solid lightgrey;
//   padding-top: 20px;
// `;

// export const OrderSummaryTable = styled(Table)`
//   margin-top: 20px;
//   width: 100%;
//   min-width: 600px; // Adjust this value as needed
// `;

// export const SubmitOrderButton = styled(ActionButton)`
//   background-color: grey;
// //   border: 1px solid #ccc;
//   color: white;
//   font-weight: bold;
//   border-radius: 4px;
//   padding: 5px 10px;
//   margin: 20px 0px 0px 10px;
//   cursor: pointer;
//   &:hover {
//     background-color: #e0e0e0;
//     color: grey;
//   }
// `;

// export const IconButton = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   padding: 5px;
//   margin-right: 5px;
//   color: #999;
//   transition: color 0.3s ease;

//   &:hover {
//     color: #666;
//   }
// `;

// export const StyledInput = styled.input`
//   width: 30%;
//   padding: 5px;
//   border: 1px solid ${colors.border};
//   border-radius: 4px;
//   font-size: 13px;
// `;

// export const StyledSelect = styled.select`
//   width: 100%;
//   padding: 5px;
//   border: 1px solid ${colors.border};
//   color: grey;
//   border-radius: 4px;
//   font-size: 13px;
// `;


/////////////////////////////



export const MainContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

export const PlaceOrderContainer = styled.div`
  width: 25%;
  padding: 0px 20px 20px 0px;
`;

export const OrderForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #ededed;
  border-radius: 8px;
  padding: 15px;
  width: 90%
`;

export const FormGroup = styled.div`
  margin: 7px 20px 7px 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const OrderSummaryContainer = styled.div`
  width: 70%;
`;

export const OrderSummary = styled.div`
  // border-top: 1px solid lightgrey;
  //padding-top: 20px;
`;

export const OrderSummaryTable = styled(Table)`
  margin-top: 20px;
  width: 100%;
`;

export const SubmitOrderButton = styled(ActionButton)`
  background-color: grey;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 20px 0px 0px 10px;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
    color: grey;
  }
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin-right: 5px;
  color: #999;
  transition: color 0.3s ease;

  &:hover {
    color: #666;
  }
`;

export const StyledInput = styled.input`
  width: 25%;
  padding: 5px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 5px;
  border: 1px solid ${colors.border};
  color: grey;
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;