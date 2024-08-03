import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from "styled-components";
import { useDispatch } from 'react-redux';
import { updateTaskDates } from './taskSlice';

const GanttContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
`;

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
`;

const SVGContainer = styled.svg`
  height: 100%;
`;

const ZoomControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

const ZoomButton = styled.button`
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

const CustomGantt = ({ tasks }) => {
  const [visibleStartDate, setVisibleStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Start of current month
  });
  const [timelineWidth, setTimelineWidth] = useState(1000); // Initial default width

  const [visibleEndDate, setVisibleEndDate] = useState(() => {
    const end = new Date(visibleStartDate);
    end.setFullYear(end.getFullYear() + 1);
    return end;
  });
  const [zoomLevel, setZoomLevel] = useState("month");
  const [draggingTask, setDraggingTask] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragAction, setDragAction] = useState(null);
  const svgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();

  const pixelsPerDay = useMemo(
    () => ({
      day: 60,
      week: 20,
      month: 5,
    }),
    []
  );

  const visibleDays = 365; // Adjust this to change the initial visible range

  useEffect(() => {
    const end = new Date(visibleStartDate);
    end.setDate(end.getDate() + visibleDays);
    setVisibleEndDate(end);
  }, [visibleStartDate, visibleDays]);

  useEffect(() => {
    if (tasks.length > 0) {
      const minDate = new Date(Math.min(...tasks.map(t => new Date(t.startDate))));
      const maxDate = new Date(Math.max(...tasks.map(t => new Date(t.endDate))));
      setVisibleStartDate(minDate);
      
      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      const calculatedWidth = Math.max(daysDiff * pixelsPerDay[zoomLevel], 1000); // Ensure minimum width
      setTimelineWidth(calculatedWidth);
    }
  }, [tasks, zoomLevel, pixelsPerDay]);
  
  

//   const timelineWidth = Math.max(visibleDays * pixelsPerDay[zoomLevel], scrollContainerRef.current?.clientWidth || 1000);

  const dateToPixels = (date) => {
    return (
      ((date - visibleStartDate) / (1000 * 60 * 60 * 24)) *
      pixelsPerDay[zoomLevel]
    );
  };

  const pixelsToDate = (pixels) => {
    return new Date(
      visibleStartDate.getTime() +
        (pixels / pixelsPerDay[zoomLevel]) * 24 * 60 * 60 * 1000
    );
  };

  const renderTimeScale = () => {
    const months = [];
    let currentDate = new Date(visibleStartDate);
    while (currentDate <= visibleEndDate) {
      const x = dateToPixels(currentDate);
      months.push(
        <g key={currentDate.toISOString()}>
          <line
            x1={x}
            y1={50}
            x2={x}
            y2="100%"
            stroke="#eee"
            strokeDasharray="2,2"
          />
          <text
            x={x}
            y={25}
            textAnchor="middle"
            fontSize="12px"
            fontWeight="bold"
          >
            {currentDate.toLocaleString("default", { month: "short" })}
          </text>
          <text x={x} y={45} textAnchor="middle" fontSize="12px">
            {currentDate.getFullYear()}
          </text>
        </g>
      );
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
  };

  const renderTasks = () => {
    return tasks.map((task, index) => {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      const x = dateToPixels(taskStartDate);
      const width = dateToPixels(taskEndDate) - x;
      const y = index * 40 + 60;
  
      return (
        <g key={task.id} data-task-id={task.id}>
          <rect
            x={x}
            y={y}
            width={width}
            height={30}
            fill="#0099cc"
            rx={5}
            ry={5}
            onMouseDown={(e) => handleMouseDown(e, task, 'move')}
            style={{ cursor: 'move' }}
          />
          <rect
            x={x}
            y={y}
            width={width * (task.progress / 100)}
            height={30}
            fill="#007399"
            rx={5}
            ry={5}
            style={{ pointerEvents: 'none' }}
          />
          <text x={x + 5} y={y + 15} fill="white" fontSize="12px" style={{ pointerEvents: 'none' }}>
            {task.taskName}
          </text>
          <text x={x + 5} y={y + 28} fill="white" fontSize="10px" style={{ pointerEvents: 'none' }}>
            {task.assignee} - {task.progress}%
          </text>
          {/* Resize handles */}
          <rect
            x={x - 5}
            y={y}
            width={10}
            height={30}
            fill="transparent"
            style={{ cursor: 'w-resize' }}
            onMouseDown={(e) => handleMouseDown(e, task, 'resize-start')}
          />
          <rect
            x={x + width - 5}
            y={y}
            width={10}
            height={30}
            fill="transparent"
            style={{ cursor: 'e-resize' }}
            onMouseDown={(e) => handleMouseDown(e, task, 'resize-end')}
          />
        </g>
      );
    });
  };
  

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
  
      if (scrollRatio < 0.2) {
        // Extend timeline to the past
        const newStart = new Date(visibleStartDate);
        newStart.setFullYear(newStart.getFullYear() - 1);
        setVisibleStartDate(newStart);
      } else if (scrollRatio > 0.8) {
        // Extend timeline to the future
        const newEnd = new Date(visibleEndDate);
        newEnd.setFullYear(newEnd.getFullYear() + 1);
        setVisibleEndDate(newEnd);
      }
    }
  };

  useEffect(() => {
    const totalDays = (visibleEndDate - visibleStartDate) / (1000 * 60 * 60 * 24);
    setTimelineWidth(totalDays * pixelsPerDay[zoomLevel]);
  }, [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]);
  

  const handleZoom = (newZoomLevel) => {
    setZoomLevel(newZoomLevel);
    if (tasks.length > 0) {
      const minDate = new Date(Math.min(...tasks.map(t => new Date(t.startDate))));
      const maxDate = new Date(Math.max(...tasks.map(t => new Date(t.endDate))));
      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      const newWidth = Math.max(daysDiff * pixelsPerDay[newZoomLevel], 1000);
      setTimelineWidth(newWidth);
    }
  };
  

  const renderTodayMarker = () => {
    const today = new Date();
    if (today >= visibleStartDate && today <= visibleEndDate) {
      const x = dateToPixels(today);
      return (
        <line
          x1={x}
          y1={0}
          x2={x}
          y2="100%"
          stroke="red"
          strokeWidth="2"
        />
      );
    }
    return null;
  };
  

  const handleMouseDown = (e, task, action) => {
    setDraggingTask(task);
    setDragStartX(e.clientX);
    setDragAction(action);
  };

  const handleMouseMove = (e) => {
    if (draggingTask) {
      const dx = e.clientX - dragStartX;
      let newStartDate = new Date(draggingTask.startDate);
      let newEndDate = new Date(draggingTask.endDate);
  
      if (dragAction === 'move') {
        newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
        newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
      } else if (dragAction === 'resize-start') {
        newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
      } else if (dragAction === 'resize-end') {
        newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
      }
  
      // Ensure end date is not before start date
      if (newEndDate < newStartDate) {
        if (dragAction === 'resize-start') {
          newStartDate = newEndDate;
        } else {
          newEndDate = newStartDate;
        }
      }
  
      // Update the task visually
      const taskElement = svgRef.current.querySelector(`g[data-task-id="${draggingTask.id}"]`);
      if (taskElement) {
        const newX = dateToPixels(newStartDate);
        const newWidth = dateToPixels(newEndDate) - newX;
        
        const mainRect = taskElement.querySelector('rect:nth-child(1)');
        const progressRect = taskElement.querySelector('rect:nth-child(2)');
        const taskNameText = taskElement.querySelector('text');
  
        mainRect.setAttribute('x', newX);
        mainRect.setAttribute('width', newWidth);
        progressRect.setAttribute('x', newX);
        progressRect.setAttribute('width', newWidth * (draggingTask.progress / 100));
        taskNameText.setAttribute('x', newX + 5);
  
        // Update resize handles
        const leftHandle = taskElement.querySelector('rect:nth-child(4)');
        const rightHandle = taskElement.querySelector('rect:nth-child(5)');
        leftHandle.setAttribute('x', newX - 5);
        rightHandle.setAttribute('x', newX + newWidth - 5);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (draggingTask) {
      const dx = e.clientX - dragStartX;
      let newStartDate = new Date(draggingTask.startDate);
      let newEndDate = new Date(draggingTask.endDate);
  
      if (dragAction === 'move') {
        newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
        newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
      } else if (dragAction === 'resize-start') {
        newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
      } else if (dragAction === 'resize-end') {
        newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
      }
  
      // Ensure end date is not before start date
      if (newEndDate < newStartDate) {
        if (dragAction === 'resize-start') {
          newStartDate = newEndDate;
        } else {
          newEndDate = newStartDate;
        }
      }
  
      // Dispatch action to update task dates
      dispatch(updateTaskDates({
        taskId: draggingTask.id,
        startDate: newStartDate.toISOString(),
        endDate: newEndDate.toISOString()
      }));
    }
    setDraggingTask(null);
    setDragStartX(0);
    setDragAction(null);
  };

  return (
    <GanttContainer>
      <ZoomControls>
        <ZoomButton onClick={() => handleZoom("day")}>Day</ZoomButton>
        <ZoomButton onClick={() => handleZoom("week")}>Week</ZoomButton>
        <ZoomButton onClick={() => handleZoom("month")}>Month</ZoomButton>
      </ZoomControls>
      <ScrollContainer ref={scrollContainerRef} onScroll={handleScroll}>
        <SVGContainer
          ref={svgRef}
          width={timelineWidth}
          height="100%"
          style={{ minWidth: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {renderTimeScale()}
          {renderTasks()}
          {renderTodayMarker()}
        </SVGContainer>
      </ScrollContainer>
    </GanttContainer>
  );
};

export default CustomGantt;
