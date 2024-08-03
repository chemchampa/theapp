import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateTaskDates } from "./taskSlice";
import {
    GanttContainer,
    ScrollContainer,
    // ScrollControls,
    // ScrollButton,
    SVGContainer,
    ZoomControls,
    ZoomButton
} from './CustomGanttStyles';


const CustomGantt = ({ tasks }) => {
  const [visibleStartDate, setVisibleStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 6, 1); // Start from 6 months ago
  });
  const [visibleEndDate, setVisibleEndDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 6, 0); // End 6 months from now
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
      week: 20,
      month: 5,
    }),
    []
  );

  /*
  const visibleDays = 365; // Adjust this to change the initial visible range

  useEffect(() => {
    const end = new Date(visibleStartDate);
    end.setDate(end.getDate() + visibleDays);
    setVisibleEndDate(end);
  }, [visibleStartDate, visibleDays]);

  useEffect(() => {
    if (tasks.length > 0) {
      const minDate = new Date(
        Math.min(...tasks.map((t) => new Date(t.startDate)))
      );
      const maxDate = new Date(
        Math.max(...tasks.map((t) => new Date(t.endDate)))
      );
      setVisibleStartDate(minDate);

      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      const calculatedWidth = Math.max(
        daysDiff * pixelsPerDay[zoomLevel],
        1000
      ); // Ensure minimum width
      setTimelineWidth(calculatedWidth);
    }
  }, [tasks, zoomLevel, pixelsPerDay]);
  */

  /*
  const dateToPixels = useCallback(
    (date) => {
      return (
        ((date - visibleStartDate) / (1000 * 60 * 60 * 24)) *
        pixelsPerDay[zoomLevel]
      );
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );
  */
  const dateToPixels = useCallback(
    (date) => {
      const daysDiff = (date - visibleStartDate) / (1000 * 60 * 60 * 24);
      return daysDiff * pixelsPerDay[zoomLevel];
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );

  /*
  const pixelsToDate = useCallback(
    (pixels) => {
      return new Date(
        visibleStartDate.getTime() +
          (pixels / pixelsPerDay[zoomLevel]) * 24 * 60 * 60 * 1000
      );
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );
  */

  const pixelsToDate = useCallback(
    (pixels) => {
      const daysDiff = pixels / pixelsPerDay[zoomLevel];
      return new Date(
        visibleStartDate.getTime() + daysDiff * 24 * 60 * 60 * 1000
      );
    },
    [visibleStartDate, zoomLevel, pixelsPerDay]
  );

  /*
  // v.1
  const extendTimeline = useCallback((direction) => {
    const visibleDuration = visibleEndDate - visibleStartDate;
    const extendDuration = visibleDuration / 2; // Extend by 50% of visible duration

    let newStart = new Date(visibleStartDate);
    let newEnd = new Date(visibleEndDate);

    if (direction === "left") {
      newStart = new Date(newStart.getTime() - extendDuration);
    } else {
      newEnd = new Date(newEnd.getTime() + extendDuration);
    }

    setVisibleStartDate(newStart);
    setVisibleEndDate(newEnd);

    // Update timeline width
    const totalDays = (newEnd - newStart) / (1000 * 60 * 60 * 24);
    const newWidth = totalDays * pixelsPerDay[zoomLevel];
    setTimelineWidth(newWidth);
  }, [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]);
  */

  /*
  // v.2
  const [timelineExtended, setTimelineExtended] = useState(false);
  const extendTimeline = useCallback(
    (direction) => {
      const visibleDuration = visibleEndDate - visibleStartDate;
      const extendDuration = visibleDuration / 2; // Extend by 50% of visible duration

      let newStart = new Date(visibleStartDate);
      let newEnd = new Date(visibleEndDate);

      if (direction === "left") {
        newStart = new Date(newStart.getTime() - extendDuration);
      } else {
        newEnd = new Date(newEnd.getTime() + extendDuration);
      }

      setVisibleStartDate(newStart);
      setVisibleEndDate(newEnd);

      // Update timeline width
      const totalDays = (newEnd - newStart) / (1000 * 60 * 60 * 24);
      const newWidth = totalDays * pixelsPerDay[zoomLevel];
      setTimelineWidth(newWidth);

      setTimelineExtended(true);
    },
    [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]
  );
  */

  /*
  // v.3
  const [timelineExtended, setTimelineExtended] = useState(false);
  const extendTimeline = useCallback(
    (direction) => {
      const currentViewPixel = scrollContainerRef.current?.scrollLeft || 0;
      const visibleDuration = visibleEndDate - visibleStartDate;
      const extendDuration = visibleDuration / 2; // Extend by 50% of visible duration

      let newStart = new Date(visibleStartDate);
      let newEnd = new Date(visibleEndDate);

      if (direction === "left") {
        newStart = new Date(newStart.getTime() - extendDuration);
      } else {
        newEnd = new Date(newEnd.getTime() + extendDuration);
      }

      setVisibleStartDate(newStart);
      setVisibleEndDate(newEnd);

      // Update timeline width
      const totalDays = (newEnd - newStart) / (1000 * 60 * 60 * 24);
      const newWidth = totalDays * pixelsPerDay[zoomLevel];
      setTimelineWidth(newWidth);

      setTimelineExtended(true);

      // After updating dates and width
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const newScrollLeft =
            direction === "left"
              ? currentViewPixel +
                (extendDuration / (24 * 60 * 60 * 1000)) *
                  pixelsPerDay[zoomLevel]
              : currentViewPixel;
          scrollContainerRef.current.scrollLeft = newScrollLeft;
        }
      });
    },
    [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]
  );
  */

  // v.4
  const [timelineExtended, setTimelineExtended] = useState(false);
  const extendTimeline = useCallback(
    (direction) => {
      const currentViewPixel = scrollContainerRef.current?.scrollLeft || 0;
      const visibleDuration = visibleEndDate - visibleStartDate;
      const extendDuration = visibleDuration / 2; // Extend by 50% of visible duration

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
      const totalDays = (newEnd - newStart) / (1000 * 60 * 60 * 24);
      const newWidth = totalDays * pixelsPerDay[zoomLevel];
      setTimelineWidth(newWidth);

      setTimelineExtended(true);

      // After updating dates and width
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const newScrollLeft =
            direction === "left"
              ? currentViewPixel +
                (extendDuration / (24 * 60 * 60 * 1000)) *
                  pixelsPerDay[zoomLevel]
              : currentViewPixel;
          scrollContainerRef.current.scrollLeft = newScrollLeft;
        }
      });
    },
    [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleMouseDown = useCallback((e, task, action) => {
    setDraggingTask(task);
    setDragStartX(e.clientX);
    setDragAction(action);
  }, []);

  const handleMouseMove = (e) => {
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

      // Update the task visually
      const taskElement = svgRef.current.querySelector(
        `g[data-task-id="${draggingTask.id}"]`
      );
      if (taskElement) {
        const newX = dateToPixels(newStartDate);
        const newWidth = dateToPixels(newEndDate) - newX;

        const mainRect = taskElement.querySelector("rect:nth-child(1)");
        const progressRect = taskElement.querySelector("rect:nth-child(2)");
        const taskNameText = taskElement.querySelector("text");
        const leftHandle = taskElement.querySelector("rect:nth-child(4)");
        const rightHandle = taskElement.querySelector("rect:nth-child(5)");

        if (
          mainRect &&
          progressRect &&
          taskNameText &&
          leftHandle &&
          rightHandle
        ) {
          mainRect.setAttribute("x", newX);
          mainRect.setAttribute("width", newWidth);
          progressRect.setAttribute("x", newX);
          progressRect.setAttribute(
            "width",
            newWidth * (draggingTask.progress / 100)
          );
          taskNameText.setAttribute("x", newX + 5);

          // Update resize handles
          leftHandle.setAttribute("x", newX - 5);
          rightHandle.setAttribute("x", newX + newWidth - 5);
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    if (draggingTask) {
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

      // Dispatch action to update task dates
      dispatch(
        updateTaskDates({
          taskId: draggingTask.id,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        })
      );
    }
    setDraggingTask(null);
    setDragStartX(0);
    setDragAction(null);
  };
  ///////////////////////////////////////////////////////////////////

  /*
  // v.1
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);

      if (scrollRatio < 0.2) {
        extendTimeline("left");
        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = clientWidth / 2;
          }
        });
      } else if (scrollRatio > 0.8) {
        extendTimeline("right");
        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollWidth - clientWidth * 1.5;
          }
        });
      }
    }
  }, [extendTimeline]);
  */

  /*
  // v.2
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);

      if (scrollRatio < 0.2 && !timelineExtended) {
        extendTimeline("left");
        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollLeft = scrollLeft + (scrollWidth - clientWidth) / 2;
            scrollContainerRef.current.scrollLeft = newScrollLeft;
          }
        });
      } else if (scrollRatio > 0.8 && !timelineExtended) {
        extendTimeline("right");
        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollLeft = scrollLeft - (scrollWidth - clientWidth) / 2;
            scrollContainerRef.current.scrollLeft = newScrollLeft;
          }
        });
      } else {
        setTimelineExtended(false);
      }
    }
  }, [extendTimeline, timelineExtended]);
  */

  /*
  // v.3
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);

      if (scrollRatio < 0.2 && !timelineExtended) {
        extendTimeline("left");
      } else if (scrollRatio > 0.8 && !timelineExtended) {
        extendTimeline("right");
      } else {
        setTimelineExtended(false);
      }
    }
  }, [extendTimeline, timelineExtended]);
  */

  /*
  // v.4
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
      const centerPixel = scrollLeft + clientWidth / 2;
      const centerDate = pixelsToDate(centerPixel);
      setLastCenteredDate(centerDate);

      if (scrollRatio < 0.2 && !timelineExtended) {
        extendTimeline("left");
      } else if (scrollRatio > 0.8 && !timelineExtended) {
        extendTimeline("right");
      } else {
        setTimelineExtended(false);
      }
    }
  }, [extendTimeline, timelineExtended, pixelsToDate]);
  */

  // v.6
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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


  /*
  // v.1
  const renderTimeScale = useCallback(() => {
    const scale = [];
    let currentDate = new Date(visibleStartDate);

    while (currentDate <= visibleEndDate) {
      const x = dateToPixels(currentDate);

      if (zoomLevel === "month") {
        scale.push(
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
      } else if (zoomLevel === "week") {
        scale.push(
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
              Week{" "}
              {Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}
            </text>
            <text x={x} y={45} textAnchor="middle" fontSize="12px">
              {currentDate.toLocaleDateString()}
            </text>
          </g>
        );
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        scale.push(
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
    return scale;
  }, [visibleStartDate, visibleEndDate, zoomLevel, dateToPixels]);
  */

  // v.2
  const renderTimeScale = useCallback(() => {
    const scale = [];
    let currentDate = new Date(visibleStartDate);
    const endDate = new Date(visibleEndDate);
  
    while (currentDate <= endDate) {
      const x = dateToPixels(currentDate);
  
      if (zoomLevel === "month") {
        if (currentDate.getDate() === 1) {
          scale.push(
            <g key={currentDate.toISOString()}>
              <line x1={x} y1={50} x2={x} y2="100%" stroke="#eee" strokeDasharray="2,2" />
              <text x={x} y={25} textAnchor="middle" fontSize="12px" fontWeight="bold">
                {currentDate.toLocaleString("default", { month: "short" })}
              </text>
              <text x={x} y={45} textAnchor="middle" fontSize="12px">
                {currentDate.getFullYear()}
              </text>
            </g>
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (zoomLevel === "week") {
        if (currentDate.getDay() === 0) {
          scale.push(
            <g key={currentDate.toISOString()}>
              <line x1={x} y1={50} x2={x} y2="100%" stroke="#eee" strokeDasharray="2,2" />
              <text x={x} y={25} textAnchor="middle" fontSize="12px" fontWeight="bold">
                Week {Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}
              </text>
              <text x={x} y={45} textAnchor="middle" fontSize="12px">
                {currentDate.toLocaleDateString()}
              </text>
            </g>
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        scale.push(
          <g key={currentDate.toISOString()}>
            <line x1={x} y1={50} x2={x} y2="100%" stroke="#eee" strokeDasharray="2,2" />
            <text x={x} y={25} textAnchor="middle" fontSize="12px" fontWeight="bold">
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
    return scale;
  }, [visibleStartDate, visibleEndDate, zoomLevel, dateToPixels]);

  const renderTasks = useCallback(() => {
    return tasks.map((task, index) => {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);

      // Only render if the task is within or overlapping the visible range
      if (taskEndDate >= visibleStartDate && taskStartDate <= visibleEndDate) {
        const x = Math.max(dateToPixels(taskStartDate), 0);
        const endX = Math.min(dateToPixels(taskEndDate), timelineWidth);
        const width = Math.max(endX - x, 0);
        const y = index * 40 + 60;

        if (width > 0) {
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
                onMouseDown={(e) => handleMouseDown(e, task, "move")}
                style={{ cursor: "move" }}
              />
              <rect
                x={x}
                y={y}
                width={width * (task.progress / 100)}
                height={30}
                fill="#007399"
                rx={5}
                ry={5}
                style={{ pointerEvents: "none" }}
              />
              <text
                x={x + 5}
                y={y + 15}
                fill="white"
                fontSize="12px"
                style={{ pointerEvents: "none" }}
              >
                {task.taskName}
              </text>
              <text
                x={x + 5}
                y={y + 28}
                fill="white"
                fontSize="10px"
                style={{ pointerEvents: "none" }}
              >
                {task.assignee} - {task.progress}%
              </text>
              {/* Resize handles */}
              <rect
                x={x - 5}
                y={y}
                width={10}
                height={30}
                fill="transparent"
                style={{ cursor: "w-resize" }}
                onMouseDown={(e) => handleMouseDown(e, task, "resize-start")}
              />
              <rect
                x={x + width - 5}
                y={y}
                width={10}
                height={30}
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
  ]);

  /*
  // v.1
  useEffect(() => {
    const totalDays = (visibleEndDate - visibleStartDate) / (1000 * 60 * 60 * 24);
    const minWidth = scrollContainerRef.current?.clientWidth * 3 || 3000; // At least three times the container width
    const newWidth = Math.max(totalDays * pixelsPerDay[zoomLevel], minWidth);
    setTimelineWidth(newWidth);
  }, [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]);
  */

  // v.2
  useEffect(() => {
    const totalDays =
      (visibleEndDate - visibleStartDate) / (1000 * 60 * 60 * 24);
    const minWidth = scrollContainerRef.current?.clientWidth * 3 || 3000; // At least three times the container width
    const newWidth = Math.max(totalDays * pixelsPerDay[zoomLevel], minWidth);
    setTimelineWidth(newWidth);
  }, [visibleStartDate, visibleEndDate, zoomLevel, pixelsPerDay]);

  /*
  // Add this function to handle manual scrolling
  const handleManualScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };
  */

  const centerOnCurrentDate = useCallback(() => {
    const today = new Date();
    const middleX = dateToPixels(today);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        middleX - scrollContainerRef.current.clientWidth / 2;
    }
  }, [dateToPixels]);

  /*
  // v,1
  // Call this function after the component mounts
  useEffect(() => {
    centerOnCurrentDate();
  }, [centerOnCurrentDate]);
  */

  // v,2
  /* This change ensures that the centering only happens once when the component first mounts, and not on subsequent re-renders. */
  const [initialCenteringDone, setInitialCenteringDone] = useState(false);
  useEffect(() => {
    if (!initialCenteringDone) {
      centerOnCurrentDate();
      setInitialCenteringDone(true);
    }
  }, [centerOnCurrentDate, initialCenteringDone]);

  /*
  // v.1
  const handleZoom = (newZoomLevel) => {
    setZoomLevel(newZoomLevel);
    if (tasks.length > 0) {
      const minDate = new Date(
        Math.min(...tasks.map((t) => new Date(t.startDate)))
      );
      const maxDate = new Date(
        Math.max(...tasks.map((t) => new Date(t.endDate)))
      );
      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      const newWidth = Math.max(daysDiff * pixelsPerDay[newZoomLevel], 1000);
      setTimelineWidth(newWidth);
    }
  };
  */

  /*
  // v.2
  const [lastCenteredDate, setLastCenteredDate] = useState(new Date());
  const handleZoom = useCallback(
    (newZoomLevel) => {
      if (scrollContainerRef.current) {
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const centerPixel = scrollLeft + clientWidth / 2;
        const centerDate = pixelsToDate(centerPixel);
        setLastCenteredDate(centerDate);
      }

      setZoomLevel(newZoomLevel);

      if (tasks.length > 0) {
        const minDate = new Date(
          Math.min(...tasks.map((t) => new Date(t.startDate)))
        );
        const maxDate = new Date(
          Math.max(...tasks.map((t) => new Date(t.endDate)))
        );

        // Extend the visible range to include a buffer on both sides
        const bufferDays = 30; // Adjust as needed
        const newStartDate = new Date(minDate);
        newStartDate.setDate(newStartDate.getDate() - bufferDays);
        const newEndDate = new Date(maxDate);
        newEndDate.setDate(newEndDate.getDate() + bufferDays);

        setVisibleStartDate(newStartDate);
        setVisibleEndDate(newEndDate);

        const daysDiff = (newEndDate - newStartDate) / (1000 * 60 * 60 * 24);
        const newWidth = Math.max(daysDiff * pixelsPerDay[newZoomLevel], 1000);
        setTimelineWidth(newWidth);

        // Center on the last centered date after changing zoom level
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newCenterPixel = dateToPixels(lastCenteredDate);
            scrollContainerRef.current.scrollLeft =
              newCenterPixel - scrollContainerRef.current.clientWidth / 2;
          }
        });
      }
    },
    [tasks, pixelsPerDay, dateToPixels, pixelsToDate, lastCenteredDate]
  );
  */

  /*
  // v.3
  const [lastCenteredDate, setLastCenteredDate] = useState(new Date());

  const handleZoom = useCallback(
    (newZoomLevel) => {
      if (scrollContainerRef.current) {
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const centerPixel = scrollLeft + clientWidth / 2;
        const centerDate = pixelsToDate(centerPixel);
        setLastCenteredDate(centerDate);
      }

      setZoomLevel(newZoomLevel);

      if (tasks.length > 0) {
        const minDate = new Date(
          Math.min(...tasks.map((t) => new Date(t.startDate)))
        );
        const maxDate = new Date(
          Math.max(...tasks.map((t) => new Date(t.endDate)))
        );

        // Extend the visible range to include a buffer on both sides
        const bufferDays = 30; // Adjust as needed
        const newStartDate = new Date(minDate);
        newStartDate.setDate(newStartDate.getDate() - bufferDays);
        const newEndDate = new Date(maxDate);
        newEndDate.setDate(newEndDate.getDate() + bufferDays);

        setVisibleStartDate(newStartDate);
        setVisibleEndDate(newEndDate);

        const daysDiff = (newEndDate - newStartDate) / (1000 * 60 * 60 * 24);
        const newWidth = Math.max(daysDiff * pixelsPerDay[newZoomLevel], 1000);
        setTimelineWidth(newWidth);

        // Center on the last centered date after changing zoom level
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newCenterPixel = dateToPixels(lastCenteredDate);
            scrollContainerRef.current.scrollLeft =
              newCenterPixel - scrollContainerRef.current.clientWidth / 2;
          }
        });
      }
    },
    [tasks, pixelsPerDay, dateToPixels, pixelsToDate, lastCenteredDate]
  );
  */

  // v.4
  const handleZoom = useCallback((newZoomLevel) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const centerPixel = scrollLeft + clientWidth / 2;
      const centerDate = pixelsToDate(centerPixel);
  
      setZoomLevel(newZoomLevel);
  
      // Recalculate the visible date range based on the new zoom level
      const daysVisible = clientWidth / pixelsPerDay[newZoomLevel];
      const halfDaysVisible = daysVisible / 2;
      const newStartDate = new Date(centerDate.getTime() - halfDaysVisible * 24 * 60 * 60 * 1000);
      const newEndDate = new Date(centerDate.getTime() + halfDaysVisible * 24 * 60 * 60 * 1000);
  
      setVisibleStartDate(newStartDate);
      setVisibleEndDate(newEndDate);
  
      // Update timeline width
      const totalDays = (newEndDate - newStartDate) / (1000 * 60 * 60 * 24);
      const newWidth = Math.max(totalDays * pixelsPerDay[newZoomLevel], clientWidth);
      setTimelineWidth(newWidth);
  
      // Recenter on the same date after changing zoom level
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const newCenterPixel = dateToPixels(centerDate);
          scrollContainerRef.current.scrollLeft = newCenterPixel - clientWidth / 2;
        }
      });
    }
  }, [pixelsPerDay, dateToPixels, pixelsToDate]);


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
