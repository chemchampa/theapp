import styled from "styled-components";

export const GanttContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
`;

export const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
`;

/*
export const ScrollControls = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

export const ScrollButton = styled.button`
  margin: 0 5px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;
*/

export const SVGContainer = styled.svg`
  height: 100%;
`;

export const ZoomControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

export const ZoomButton = styled.button`
  margin-left: 5px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;
