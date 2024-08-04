import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../components/GlobalStyle';

export const FormContainer = styled.div`
  width: 100%;
  transition: all 0.3s ease;
  overflow: ${props => props.isVisible ? 'visible' : 'hidden'};
  padding: ${props => props.isVisible ? '20px' : '0'};
  position: relative;
  z-index: 10;
`;

export const TableContentContainer = styled.div`
  overflow: hidden; // Prevents the extra scrollbar
  // padding-bottom: 20px;
  border-radius: 4px;
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 60px); // Adjust this value based on the height of your FixedFunctionalityBar
  margin-bottom: 100px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const Input = styled.input`
  width: 80%;
  padding: 8px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: grey;
`;

export const SubmitButton = styled.button`
  background-color: grey;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 20px 0px 0px 10px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #e0e0e0;
    color: grey;
  }
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const ErrorMessage = styled.span`
  color: red;
  font-size: 12px;
  margin-top: 5px;
  display: block;
  padding: 10px;
  text-align: center;
`;

export const SuccessMessage = styled.div`
  color: green;
  margin-top: 20px;
  text-align: center;
`;

export const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: ${props => props.size === 'small' ? '10px' : '20px'};
  height: ${props => props.size === 'small' ? '10px' : '20px'};
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px; // Reduced from 10px
`;

export const SwitchLabel = styled.span`
  margin-right: 5px; // Reduced from 10px
  font-size: 14px;   // Reduced font size
`;

export const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 30px;  // Reduced from 60px
  height: 17px; // Reduced from 34px
  margin-right: 5px; // Reduced from 10px

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 17px; // Adjusted to match new height

    &:before {
      position: absolute;
      content: "";
      height: 13px; // Reduced from 26px
      width: 13px;  // Reduced from 26px
      left: 2px;    // Adjusted from 4px
      bottom: 2px;  // Adjusted from 4px
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #2196F3;
  }

  input:checked + span:before {
    transform: translateX(13px); // Adjusted from 26px
  }
`;

export const TableContainer = styled.div`
  transition: all 0.3s ease;
`;

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden; // This prevents the main container from scrolling
  padding-top: 20px;
`;

export const StyledInput = styled.input`
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
`;

export const MultipliersInput = styled.input`
  padding: 5px 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  max-width: 40px;
  color: #625df5;
  background: transparent;
  
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

export const ColumnSelectorContainer = styled.div`
  position: relative;
`;

export const ColumnSelectorOverlay = styled.div`
  position: absolute;
  bottom: auto;
  top: 100%; // Position it right below the button
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 600px;
  margin-top: 5px;
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

export const ThContent = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  ${props => props.isFirstColumn ? `
    .sort-icon {
      opacity: 1;
    }
  ` : `
    .sort-icon {
      opacity: 0;
      transition: opacity 0.2s;
    }
    &:hover .sort-icon {
      opacity: 1;
    }
  `}
`;

export const SortIcon = styled.span`
  font-size: 10px;
  margin-left: 5px;
`;

export const ConfirmationPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 400px;
  width: 100%;
`;

export const PopupTitle = styled.h2`
  margin-top: 0;
  color: ${colors.text};
`;

export const PopupContent = styled.p`
  margin-bottom: 20px;
  color: ${colors.text};
`;

export const PopupButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const PopupButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &.confirm {
    background-color: ${colors.danger};
    color: white;
    &:hover {
      background-color: ${colors.dangerHover};
    }
  }

  &.cancel {
    background-color: ${colors.secondary};
    color: ${colors.text};
    &:hover {
      background-color: ${colors.secondaryHover};
    }
  }
`;

////////////// * Editing Product Pricing ///////////////////////////////////////////////

export const ClickableProductName = styled.span`
  cursor: pointer;
  color: #0066cc;
  &:hover {
    text-decoration: underline;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const EditFormContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const FormTitle = styled.h2`
  margin-bottom: 20px;
`;

// export const ButtonGroup = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   margin-top: 20px;
// `;

export const FormLayout = styled.div`
  display: flex;
  gap: 20px;
`;

export const Column = styled.div`
  flex: 1;
`;

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h3`
  font-size: 24px;
  margin: 30px 0;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

export const EditProductFormLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  // padding-bottom: 5px;
  font-weight: bold;
  font-size: 13px;
`;

export const RowLabel = styled.span`
  font-weight: bold;
  font-size: 13px;
  min-width: 150px;
  display: inline-block;
`;

export const EditFormStyledInput = styled.input`
  padding: 5px 10px;
  margin-right: 30px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  width: 50px;
`;

export const FormGroupProduct = styled.div`
  margin-bottom: 20px;
`;

export const FormGroupPrices = styled.div`
  margin-bottom: 20px;
  margin-left: 20px;
`;




/////////////////////////////////////////////////////////////

export const Switch = ({ isOn, handleToggle }) => {
  return (
    <SwitchWrapper>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <span className="react-switch-button" />
    </SwitchWrapper>
  );
};


// export const EditableCell = ({ value, onValueChange, isUpdating }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(value);

//   const handleBlur = () => {
//     setIsEditing(false);
//     if (editValue !== value) {
//       onValueChange(editValue);
//     }
//   };

//   return isEditing ? (
    // <Input
    //   type="number"
    //   value={editValue}
    //   onChange={(e) => setEditValue(e.target.value)}
    //   onBlur={handleBlur}
    //   autoFocus
    //   disabled={isUpdating}
    // />
//   ) : (
//     <span onClick={() => setIsEditing(true)}>
//       {isUpdating ? <LoadingSpinner size="small" /> : value}
//     </span>
//   );
// };

// v.2
// export const  EditableCell = ({ value, onValueChange, isUpdating, editor, row }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(value);

//   const handleBlur = () => {
//     setIsEditing(false);
//     if (editValue !== value) {
//       onValueChange(editValue);
//     }
//   };

//   if (editor) {
//     return editor({
//       value: value,
//       onChange: onValueChange,
//       row: row
//     });
//   }

//   return isEditing ? (
//     <MultipliersInput
//       value={editValue}
//       onChange={(e) => setEditValue(e.target.value)}
//       onBlur={handleBlur}
//       autoFocus
//       disabled={isUpdating}
//     />
//   ) : (
//     <div onClick={() => setIsEditing(true)}>
//       {isUpdating ? <LoadingSpinner size="small" /> : value}
//     </div>
//   );
// };

// v.3
// export const EditableCell = ({ value, onValueChange, isUpdating, editor, row }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(value);

//   // Synchronize local state with prop value
//   useEffect(() => {
//     setEditValue(value);
//   }, [value]);

//   const handleBlur = () => {
//     setIsEditing(false);
//     if (editValue !== value) {
//       onValueChange(editValue);
//     }
//   };

//   if (editor) {
//     return editor({
//       value: editValue, // Use editValue here to reflect the local state
//       onChange: (newVal) => setEditValue(newVal),
//       row: row
//     });
//   }

//   return isEditing ? (
//     <MultipliersInput
//       value={editValue}
//       onChange={(e) => setEditValue(e.target.value)}
//       onBlur={handleBlur}
//       autoFocus
//       disabled={isUpdating}
//     />
//   ) : (
//     <div onClick={() => setIsEditing(true)}>
//       {isUpdating ? <LoadingSpinner size="small" /> : value}
//     </div>
//   );
// };


// v.4 - working - but with that flickering intermediate state
export const EditableCell = ({ value, onValueChange, isUpdating, editor, row }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Effect to synchronize editValue with value when it changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onValueChange(editValue);
    }
  };

  if (editor) {
    return editor({
      value: value,
      onChange: onValueChange,
      row: row
    });
  }

  return isEditing ? (
    <MultipliersInput
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      autoFocus
      disabled={isUpdating}
    />
  ) : (
    <div onClick={() => setIsEditing(true)}>
      {isUpdating ? <LoadingSpinner size="small" /> : value}
    </div>
  );
};





