import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateTaskDates } from "./taskSlice";
import {
    GanttContainer,
    ScrollContainer,
    SVGContainer,
    ZoomControls,
    ZoomButton
} from './CustomGanttStyles';


const CustomGantt = ({ tasks }) => {
  const [visibleStartDate, setVisibleStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 12, 1); // Start from 6 months ago
  });
  const [visibleEndDate, setVisibleEndDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 12, 0); // End 6 months from now
  });
  const [timelineWidth, setTimelineWidth] = useState(1000);
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
      week: 30,
      month: 5,
      quarter: 2,
    }),
    []
  );

  const dateToPixels = useCallback(
    (date) => {
      const daysDiff = (date - visibleStartDate) / (1000 * 60 * 60 * 24);
      return daysDiff * pixelsPerDay[zoomLevel];
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );

  const pixelsToDate = useCallback(
    (pixels) => {
      const daysDiff = pixels / pixelsPerDay[zoomLevel];
      return new Date(
        visibleStartDate.getTime() + daysDiff * 24 * 60 * 60 * 1000
      );
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );


  // v.6
  const [timelineExtended, setTimelineExtended] = useState(false);
  const extendTimeline = useCallback(
    (direction) => {
      const currentViewPixel = scrollContainerRef.current?.scrollLeft || 0;
      const visibleDuration = visibleEndDate - visibleStartDate;
      let extendDuration;
      let pixelsToExtend;

      switch (zoomLevel) {
        case "quarter":
          extendDuration = 3 * 30 * 24 * 60 * 60 * 1000; // Approximately 3 months
          pixelsToExtend = 90 * pixelsPerDay[zoomLevel];
          break;
        default:
          extendDuration = visibleDuration / 2; // Extend by 50% of visible duration for other zoom levels
          pixelsToExtend =
            (visibleDuration / 2 / (24 * 60 * 60 * 1000)) *
            pixelsPerDay[zoomLevel];
      }

      let newStart = new Date(visibleStartDate);
      let newEnd = new Date(visibleEndDate);

      if (direction === "left") {
        newStart = new Date(newStart.getTime() - extendDuration);
      } else {
        newEnd = new Date(newEnd.getTime() + extendDuration);
      }

      // Check if the new range is already covered
      if (newStart >= visibleStartDate && newEnd <= visibleEndDate) {
        return; // No need to extend
      }

      setVisibleStartDate(newStart);
      setVisibleEndDate(newEnd);

      // Update timeline width
      const newWidth = timelineWidth + pixelsToExtend;
      setTimelineWidth(newWidth);

      setTimelineExtended(true);

      // After updating dates and width
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const newScrollLeft =
            direction === "left"
              ? currentViewPixel + pixelsToExtend
              : currentViewPixel;
          scrollContainerRef.current.scrollLeft = newScrollLeft;
        }
      });
    },
    [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay, timelineWidth]
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const [tempTaskChanges, setTempTaskChanges] = useState(null);

  const handleMouseDown = useCallback((e, task, action) => {
    setDraggingTask(task);
    setDragStartX(e.clientX);
    setDragAction(action);
  }, []);

  // v.2
  const handleMouseMove = useCallback(
    (e) => {
      if (draggingTask && svgRef.current) {
        const dx = e.clientX - dragStartX;
        let newStartDate = new Date(draggingTask.startDate);
        let newEndDate = new Date(draggingTask.endDate);

        if (dragAction === "move") {
          newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
          newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
        } else if (dragAction === "resize-start") {
          newStartDate = pixelsToDate(dateToPixels(newStartDate) + dx);
        } else if (dragAction === "resize-end") {
          newEndDate = pixelsToDate(dateToPixels(newEndDate) + dx);
        }

        // Ensure end date is not before start date
        if (newEndDate < newStartDate) {
          if (dragAction === "resize-start") {
            newStartDate = newEndDate;
          } else {
            newEndDate = newStartDate;
          }
        }

        setTempTaskChanges({
          taskId: draggingTask.id,
          startDate: newStartDate,
          endDate: newEndDate,
        });
      }
    },
    [draggingTask, dragStartX, dragAction, dateToPixels, pixelsToDate]
  );

  // v.2
  const handleMouseUp = useCallback(() => {
    if (draggingTask && tempTaskChanges) {
      // Dispatch action to update task dates
      dispatch(
        updateTaskDates({
          taskId: tempTaskChanges.taskId,
          startDate: tempTaskChanges.startDate.toISOString(),
          endDate: tempTaskChanges.endDate.toISOString(),
        })
      );
    }
    setDraggingTask(null);
    setDragStartX(0);
    setDragAction(null);
    setTempTaskChanges(null);
  }, [draggingTask, tempTaskChanges, dispatch]);

  ///////////////////////////////////////////////////////////////////

  // v.6
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
      //   const centerPixel = scrollLeft + clientWidth / 2;
      //   const centerDate = pixelsToDate(centerPixel);
      //   setLastCenteredDate(centerDate);

      if (scrollRatio < 0.2 && !timelineExtended) {
        extendTimeline("left");
      } else if (scrollRatio > 0.8 && !timelineExtended) {
        extendTimeline("right");
      } else {
        setTimelineExtended(false);
      }
    }
  }, [extendTimeline, timelineExtended]);

  ///////////////////////////////////////////////////////////////////

  // v.6
  const renderTimeScale = useCallback(() => {
    const scale = [];
    const gridLines = [];
    const weekendShading = [];
    let currentDate = new Date(visibleStartDate);
    const endDate = new Date(visibleEndDate);

    while (currentDate <= endDate) {
      const x = dateToPixels(currentDate);

      // Add vertical grid lines
      if (
        (zoomLevel === "quarter" && currentDate.getMonth() % 3 === 0) ||
        (zoomLevel === "month" && currentDate.getDate() === 1) || // Changed to first day of month
        (zoomLevel === "week" && currentDate.getDay() === 1) ||
        zoomLevel === "day"
      ) {
        gridLines.push(
          <line
            key={`grid-${currentDate.toISOString()}`}
            x1={x}
            y1={0}
            x2={x}
            y2="100%"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        );
      }

      // Add weekend shading for weekly and daily zoom levels
      if (
        (zoomLevel === "week" || zoomLevel === "day") &&
        (currentDate.getDay() === 0 || currentDate.getDay() === 6)
      ) {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextX = dateToPixels(nextDay);
        weekendShading.push(
          <rect
            key={`weekend-${currentDate.toISOString()}`}
            x={x}
            y={0}
            width={nextX - x}
            height="100%"
            fill="#f0f0f0"
          />
        );
      }

      // Render time scale labels
      if (zoomLevel === "quarter") {
        // Quarter zoom level rendering remains unchanged
        if (currentDate.getMonth() % 3 === 0) {
          const quarterNumber = Math.floor(currentDate.getMonth() / 3) + 1;
          scale.push(
            <g key={currentDate.toISOString()}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2="100%"
                stroke="#e0e0e0"
                strokeWidth="1"
              />
              <text x={x + 5} y={25} fontSize="14px" fontWeight="bold">
                Q{quarterNumber} {currentDate.getFullYear()}
              </text>
              <text x={x + 5} y={45} fontSize="12px">
                {currentDate.toLocaleString("default", { month: "short" })}
              </text>
            </g>
          );
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (zoomLevel === "month") {
        if (currentDate.getDate() === 1) {
          scale.push(
            <g key={`month-${currentDate.toISOString()}`}>
              <text
                x={x}
                y={10}
                textAnchor="middle"
                fontSize="12px"
                fontWeight="bold"
              >
                {currentDate.toLocaleString("default", { month: "short" })}{" "}
                {currentDate.getFullYear()}
              </text>
            </g>
          );
        }
        // Add Monday dates
        if (currentDate.getDay() === 1) {
          // Monday
          scale.push(
            <text
              key={`monday-${currentDate.toISOString()}`}
              x={x}
              y={28}
              textAnchor="middle"
              fontSize="10px"
            >
              {currentDate.getDate()}
            </text>
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (zoomLevel === "week") {
        // Show every day
        scale.push(
          <g key={currentDate.toISOString()}>
            {currentDate.getDate() === 1 && (
              <text
                x={x}
                y={10}
                textAnchor="middle"
                fontSize="12px"
                fontWeight="bold"
              >
                {currentDate.toLocaleString("default", { month: "short" })}
              </text>
            )}
            <text
              x={x}
              y={25}
              textAnchor="middle"
              fontSize="10px"
              fontWeight={currentDate.getDay() === 1 ? "bold" : "normal"}
            >
              {currentDate.getDate()}
            </text>
            <text x={x} y={45} textAnchor="middle" fontSize="10px">
              {currentDate.toLocaleString("default", { weekday: "short" })}
            </text>
          </g>
        );
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        // Day zoom level remains unchanged
        scale.push(
          <g key={currentDate.toISOString()}>
            <text
              x={x}
              y={25}
              textAnchor="middle"
              fontSize="12px"
              fontWeight="bold"
            >
              {currentDate.getDate()}
            </text>
            <text x={x} y={45} textAnchor="middle" fontSize="12px">
              {currentDate.toLocaleString("default", { month: "short" })}
            </text>
          </g>
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return (
      <g>
        {weekendShading}
        {gridLines}
        {scale}
      </g>
    );
  }, [visibleStartDate, visibleEndDate, zoomLevel, dateToPixels]);

  // v.3
  const renderTasks = useCallback(() => {
    return tasks.map((task, index) => {
      let taskStartDate = new Date(task.startDate);
      let taskEndDate = new Date(task.endDate);

      // Apply temporary changes if this task is being dragged
      if (tempTaskChanges && tempTaskChanges.taskId === task.id) {
        taskStartDate = tempTaskChanges.startDate;
        taskEndDate = tempTaskChanges.endDate;
      }

      // Only render if the task is within or overlapping the visible range
      if (taskEndDate >= visibleStartDate && taskStartDate <= visibleEndDate) {
        const x = Math.max(dateToPixels(taskStartDate), 0);
        const endX = Math.min(dateToPixels(taskEndDate), timelineWidth);
        const width = Math.max(endX - x, 0);
        const y = index * 40 + 60;

        // Adjust task appearance based on zoom level
        let taskHeight = 35;
        let fontSize = 12;
        let showDetails = true;

        switch (zoomLevel) {
          case "quarter":
            taskHeight = 35;
            fontSize = 12;
            showDetails = true;
            break;
          // 'month', 'week', and 'day' zoom levels remain unchanged
          default:
            break;
        }

        if (width > 0) {
          return (
            <g key={task.id} data-task-id={task.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={taskHeight}
                fill="#0099cc"
                rx={5}
                ry={5}
                onMouseDown={(e) => handleMouseDown(e, task, "move")}
                style={{ cursor: "move" }}
              />
              <rect
                x={x}
                y={y}
                width={width * (task.progress / 100)}
                height={taskHeight}
                fill="#007399"
                rx={5}
                ry={5}
                style={{ pointerEvents: "none" }}
              />
              {showDetails && (
                <>
                  <text
                    x={x + 5}
                    y={y + 15}
                    fill="white"
                    fontSize={`${fontSize}px`}
                    style={{ pointerEvents: "none" }}
                  >
                    {task.taskName}
                  </text>
                  <text
                    x={x + 5}
                    y={y + 28}
                    fill="white"
                    fontSize={`${fontSize - 2}px`}
                    style={{ pointerEvents: "none" }}
                  >
                    {task.assignee} - {task.progress}%
                  </text>
                </>
              )}
              {/* Resize handles */}
              <rect
                x={x - 5}
                y={y}
                width={10}
                height={taskHeight}
                fill="transparent"
                style={{ cursor: "w-resize" }}
                onMouseDown={(e) => handleMouseDown(e, task, "resize-start")}
              />
              <rect
                x={x + width - 5}
                y={y}
                width={10}
                height={taskHeight}
                fill="transparent"
                style={{ cursor: "e-resize" }}
                onMouseDown={(e) => handleMouseDown(e, task, "resize-end")}
              />
            </g>
          );
        }
      }
      return null;
    });
  }, [
    tasks,
    visibleStartDate,
    visibleEndDate,
    dateToPixels,
    timelineWidth,
    handleMouseDown,
    tempTaskChanges,
    zoomLevel, // Add zoomLevel to the dependency array
  ]);

  // v.2
  useEffect(() => {
    const totalDays =
      (visibleEndDate - visibleStartDate) / (1000 * 60 * 60 * 24);
    const minWidth = scrollContainerRef.current?.clientWidth * 3 || 3000; // At least three times the container width
    const newWidth = Math.max(totalDays * pixelsPerDay[zoomLevel], minWidth);
    setTimelineWidth(newWidth);
  }, [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]);

  const centerOnCurrentDate = useCallback(() => {
    const today = new Date();
    const middleX = dateToPixels(today);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        middleX - scrollContainerRef.current.clientWidth / 2;
    }
  }, [dateToPixels]);

  // v.2
  /* This change ensures that the centering only happens once when the component first mounts, and not on subsequent re-renders. */
  const [initialCenteringDone, setInitialCenteringDone] = useState(false);
  useEffect(() => {
    if (!initialCenteringDone) {
      centerOnCurrentDate();
      setInitialCenteringDone(true);
    }
  }, [centerOnCurrentDate, initialCenteringDone]);

  ///////////////////////////////////////////////////////////////////

  // v.4
  const handleZoom = useCallback(
    (newZoomLevel) => {
      if (scrollContainerRef.current) {
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const centerPixel = scrollLeft + clientWidth / 2;
        const centerDate = pixelsToDate(centerPixel);

        setZoomLevel(newZoomLevel);

        // Recalculate the visible date range based on the new zoom level
        const daysVisible = clientWidth / pixelsPerDay[newZoomLevel];
        const halfDaysVisible = daysVisible / 2;
        const newStartDate = new Date(
          centerDate.getTime() - halfDaysVisible * 24 * 60 * 60 * 1000
        );
        const newEndDate = new Date(
          centerDate.getTime() + halfDaysVisible * 24 * 60 * 60 * 1000
        );

        setVisibleStartDate(newStartDate);
        setVisibleEndDate(newEndDate);

        // Update timeline width
        const totalDays = (newEndDate - newStartDate) / (1000 * 60 * 60 * 24);
        const newWidth = Math.max(
          totalDays * pixelsPerDay[newZoomLevel],
          clientWidth
        );
        setTimelineWidth(newWidth);

        // Recenter on the same date after changing zoom level
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newCenterPixel = dateToPixels(centerDate);
            scrollContainerRef.current.scrollLeft =
              newCenterPixel - clientWidth / 2;
          }
        });
      }
    },
    [pixelsPerDay, dateToPixels, pixelsToDate]
  );

  const renderTodayMarker = () => {
    const today = new Date();
    if (today >= visibleStartDate && today <= visibleEndDate) {
      const x = dateToPixels(today);
      return (
        <line x1={x} y1={0} x2={x} y2="100%" stroke="red" strokeWidth="2" />
      );
    }
    return null;
  };

  return (
    <GanttContainer>
      <ZoomControls>
        <ZoomButton onClick={() => handleZoom("day")}>Day</ZoomButton>
        <ZoomButton onClick={() => handleZoom("week")}>Week</ZoomButton>
        <ZoomButton onClick={() => handleZoom("month")}>Month</ZoomButton>
        <ZoomButton onClick={() => handleZoom("quarter")}>Quarter</ZoomButton>
      </ZoomControls>
      <ScrollContainer
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ scrollBehavior: "auto" }} // Ensure smooth scrolling doesn't interfere
      >
        <SVGContainer
          ref={svgRef}
          width={timelineWidth}
          height="100%"
          style={{ minWidth: "100%" }}
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
