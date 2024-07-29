import styled from 'styled-components';
import { colors } from '../../components/GlobalStyle';

export const FormContainer = styled.form`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 5px;
`;

export const SubmitButton = styled.button`
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

export const CustomPricingArea = styled.div`
  background-color: #f0f0f0;
  padding: 15px;
  margin-top: 10px;
  border-radius: 4px;
`;

export const NestedDropdown = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;

  select, input {
    flex: 1;
    padding: 5px 10px;
    border: 1px solid ${colors.border};
    border-radius: 4px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

export const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #45a049;
  }
`;