import styled from 'styled-components';

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-X: hidden;
  overflow-y: auto;
  height: calc(100vh - 230px); // Adjust this value based on the height of your FixedFunctionalityBar
  margin-bottom: 100px;
`;


