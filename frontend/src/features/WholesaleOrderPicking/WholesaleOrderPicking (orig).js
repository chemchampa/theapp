
/* 
    This version was working but I wanted to separate the common layout elements
    (like the Sidebar, TopBar, and MainContent container) from the specific feature content.
    Therefore I created a new version of this code. This code is now redundant.
*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import {
  GlobalStyle,
  Table,
  Th,
  Td,
  ItemRow,
  CustomerHeaderRow,
  ResizeHandle,
  ToggleButton,
  ContentContainer,
  AppContainer,
  Sidebar,
  ToggleSidebarButton,
  MainContent,
  MainContentWrapper,
  TopBar,
  SearchContainer,
  SearchBar,
  UserProfile,
  UserAvatar,
  FunctionalityBar,
  StyledDatePicker,
  ActionButton,
  CustomScrollbar,
  TableHeader
} from './WholesaleOrderPickingStyles';


function App() {
    const [data, setData] = useState([]);
    const [columnWidths, setColumnWidths] = useState({
      checkbox: { width: 30, isResizable: false },
      customer: { width: 100, isResizable: true },
      orderId: { width: 40, isResizable: false },
      product: { width: 100, isResizable: true },
      totalQty: { width: 30, isResizable: false },
      bagSize: { width: 40, isResizable: false },
      grindOption: { width: 80, isResizable: false },
      totalAmount: { width: 80, isResizable: false },
      orderStatus: { width: 80, isResizable: false },
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedRows, setSelectedRows] = useState({});
  
    const fetchData = async (date) => {
      try {
        const formattedDate = format(date, 'dd/MM/yyyy');
        console.log('Fetching data for date:', formattedDate);
        const response = await axios.get(`http://localhost:5000/api/picking-list?date=${formattedDate}`, { withCredentials: true });
        // const response = await axios.get('http://localhost:5000/api/picking-list', { withCredentials: true });
        console.log("Data received:", response.data);
  
        if (response.data.length === 0) {
          console.log('No data returned for the selected date');
        }
        
        // Group the data by customer and order
        const groupedData = response.data.reduce((acc, row) => {
          const [customer, orderId] = row;
          if (!acc[customer]) {
            acc[customer] = {};
          }
          if (!acc[customer][orderId]) {
            acc[customer][orderId] = {
              items: [],
              totalAmount: 0,
              orderStatus: row[7]
            };
          }
          acc[customer][orderId].items.push(row);
          acc[customer][orderId].totalAmount += parseFloat(row[6]);
          return acc;
        }, {});
        
        setData(groupedData);
  
        // Initialize expandedOrders state with all orders expanded
        const initialExpandedState = Object.keys(groupedData).reduce((acc, customer) => {
          acc[customer] = Object.keys(groupedData[customer]).reduce((orderAcc, orderId) => {
            orderAcc[orderId] = true;
            return orderAcc;
          }, {});
          return acc;
        }, {});
        
        setExpandedOrders(initialExpandedState);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    useEffect(() => {
      fetchData(selectedDate);
    }, [selectedDate]); // This will run when the component mounts and when selectedDate changes
  
    
  
    const startResize = (column) => (e) => {
      console.log('Resize started for column:', column);
      if (!columnWidths[column].isResizable) return;
      e.preventDefault();
      const startX = e.pageX;
      const startWidth = columnWidths[column].width;
    
      const onMouseMove = (moveEvent) => {
        const newWidth = startWidth + (moveEvent.pageX - startX);
        setColumnWidths(prev => ({
          ...prev,
          [column]: { ...prev[column], width: Math.max(20, newWidth) }
        }));
      };
    
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
  
    const [expandedOrders, setExpandedOrders] = useState({});
    const toggleOrderExpansion = (customer, orderId) => {
      setExpandedOrders(prev => ({
        ...prev,
        [customer]: {
          ...prev[customer],
          [orderId]: !prev[customer]?.[orderId]
        }
      }));
    };
  
    const expandAllOrders = () => {
      const allExpanded = Object.keys(data).reduce((acc, customer) => {
        acc[customer] = Object.keys(data[customer]).reduce((orderAcc, orderId) => {
          orderAcc[orderId] = true;
          return orderAcc;
        }, {});
        return acc;
      }, {});
      setExpandedOrders(allExpanded);
    };
    
    const collapseAllOrders = () => {
      setExpandedOrders({});
    };
  
    const handleCheckboxChange = (customer, orderId) => {
      setSelectedRows(prev => {
        const newSelectedRows = {
          ...prev,
          [customer]: {
            ...prev[customer],
            [orderId]: !prev[customer]?.[orderId]
          }
        };
        
        // Check if all rows are selected
        const allSelected = Object.values(newSelectedRows).every(customerOrders => 
          Object.values(customerOrders).every(isSelected => isSelected)
        );
        
        setSelectAll(allSelected);
        
        return newSelectedRows;
      });
    };
  
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const toggleSidebar = () => {
      setIsSidebarVisible(!isSidebarVisible);
    };
  
    const [selectAll, setSelectAll] = useState(false);
  
    const handleSelectAll = () => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      
      const newSelectedRows = {};
      Object.keys(data).forEach(customer => {
        newSelectedRows[customer] = {};
        Object.keys(data[customer]).forEach(orderId => {
          newSelectedRows[customer][orderId] = newSelectAll;
        });
      });
      setSelectedRows(newSelectedRows);
    };
  
    const handlePrint = (selectedDate) => {
    const printContent = Object.entries(selectedRows).flatMap(([customer, orders]) =>
      Object.entries(orders)
        .filter(([orderId, isSelected]) => isSelected)
        .map(([orderId]) => ({ customer, orderId, ...data[customer][orderId] }))
    );
  
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Wholesale Orders Picking</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #e0e0e0; 
            padding: 6px;
            text-align: left; 
          }
          th {
            background-color: #f3f3f3;
            font-weight: bold;
            font-size: 13px;
            padding: 20px 20px 20px 10px; /* Reduced padding to accommodate smaller font */
  
          }
          td {
            font-size: 11px;
            padding: 10px; /* Reduced padding to accommodate smaller font */
  
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:nth-child(odd) { background-color: #ffffff; }
          .customer-row {
            background-color: #d0d0d0;
            font-weight: bold;
          }
          .customer-row:nth-child(even),
          .customer-row:nth-child(odd) {
            background-color: #d0d0d0;
          }
          .customer-col { width: 10%; }
          .product-col { width: 30%; }
          .qty-col, .bag-size-col { width: 10%} 
          .grind-col { width: 20%; }
          .amount-col { width: 20%; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0;
          }
          .date {
            font-size: 12px;
            font-weight: normal;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <h1>Wholesale Orders Picking</h1>
          <span class="date">Orders Date: ${format(selectedDate, 'dd/MM/yyyy')}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th class="customer-col">Customer</th>
              <th class="product-col">Product</th>
              <th class="qty-col">Total Qty</th>
              <th class="bag-size-col">Bag Size</th>
              <th class="grind-col">Grind Option</th>
              <th class="amount-col">Total Amount Ordered, kg</th>
            </tr>
          </thead>
          <tbody>
      `);
  
      let currentCustomer = '';
      printContent.forEach(order => {
        if (order.customer !== currentCustomer) {
          printWindow.document.write(`
            <tr class="customer-row">
              <td colspan="5">${order.customer}</td>
              <td class="amount-col">${order.totalAmount.toFixed(2)} kg</td>
            </tr>
          `);
          currentCustomer = order.customer;
        }
        order.items.forEach(item => {
          printWindow.document.write(`
            <tr>
              <td class="customer-col"></td>
              <td class="product-col">${item[2]}</td>
              <td class="qty-col">${item[3]}</td>
              <td class="bag-size-col">${item[4]}</td>
              <td class="grind-col">${item[5]}</td>
              <td class="amount-col">${item[6]} kg</td>
            </tr>
          `);
        });
      });
    
      printWindow.document.write(`
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus(); // Required for IE
        printWindow.print();
      }, 250); // 250ms delay
      printWindow.onload = function() {
        printWindow.focus(); // Required for IE
        printWindow.print();
      };
    };
  
    return (
      <>
        <GlobalStyle />
        <CustomScrollbar />
        <AppContainer>
          <Sidebar isVisible={isSidebarVisible}>
            <h2 style={{ color: '#414446', marginBottom: '20px' }}>Home</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>Dashboard</li>
              <li style={{ marginBottom: '10px' }}>Wholesale Orders</li>
              <li style={{ marginBottom: '10px' }}>Retail Online Orders</li>
              <li style={{ marginBottom: '10px' }}>Dispatch Hub</li>
              <li style={{ marginBottom: '10px' }}>Products</li>
              <li style={{ marginBottom: '10px' }}>Wholesale Customers</li>
            </ul>
          </Sidebar>
          <MainContentWrapper isSidebarVisible={isSidebarVisible}>
            <MainContent>
              <ToggleSidebarButton onClick={toggleSidebar} isSidebarVisible={isSidebarVisible}>
                {isSidebarVisible ? '◀' : '▶'}
              </ToggleSidebarButton>
              <TopBar>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
                <SearchContainer>
                  <SearchBar placeholder="Search orders..." />
                </SearchContainer>
                <UserProfile>
                  <UserAvatar />
                  <span>John Doe</span>
                </UserProfile>
              </TopBar>
              <ContentContainer isSidebarVisible={isSidebarVisible}>
                <TableHeader>Wholesale Orders Picking</TableHeader>
                <FunctionalityBar>
                  <div>
                    <label htmlFor="datePicker">Select Date: </label>
                    <StyledDatePicker
                      id="datePicker"
                      selected={selectedDate}
                      onChange={(date) => {
                        console.log('Date selected:', date);
                        setSelectedDate(date);
                        fetchData(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="en-GB" // To ensure UK date format
                    />
                  </div>
                  <div>
                    <ActionButton onClick={expandAllOrders}>Expand All</ActionButton>
                    <ActionButton onClick={collapseAllOrders}>Collapse All</ActionButton>
                    <ActionButton onClick={() => handlePrint(selectedDate)}>
                      <span role="img" aria-label="print">🖨️</span> Print Selected
                    </ActionButton>
                  </div>
                  {/* We'll add more functionality buttons here later */}
                </FunctionalityBar>
                <Table>
                  <thead>
                    <tr>
                      {Object.entries(columnWidths).map(([column, { width, isResizable }]) => (
                        <Th key={column} style={{ width: `${width}px` }}>
                          {column === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          ) : (
                            column.charAt(0).toUpperCase() + column.slice(1)
                          )}
                          {isResizable && <ResizeHandle onMouseDown={startResize(column)} />}
                        </Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data).map(([customer, orders]) => (
                      <React.Fragment key={customer}>
                        {Object.entries(orders).map(([orderId, orderData]) => {
                          const isExpanded = expandedOrders[customer]?.[orderId];
                          return (
                            <React.Fragment key={orderId}>
                              <CustomerHeaderRow onClick={() => toggleOrderExpansion(customer, orderId)}>
                                <Td style={{ width: `${columnWidths.checkbox.width}px` }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedRows[customer]?.[orderId] || false}
                                    onChange={() => handleCheckboxChange(customer, orderId)}
                                    onClick={(e) => e.stopPropagation()} // Prevent row expansion when clicking checkbox
                                  />
                                </Td>
                                <Td style={{ width: `${columnWidths.customer.width}px` }}>
                                  <ToggleButton expanded={isExpanded}>▶</ToggleButton>
                                  {customer}
                                </Td>
                                <Td style={{ width: `${columnWidths.orderId.width}px` }}>{orderId}</Td>
                                <Td style={{ width: `${columnWidths.product.width}px` }}></Td>
                                <Td style={{ width: `${columnWidths.totalQty.width}px` }}></Td>
                                <Td style={{ width: `${columnWidths.bagSize.width}px` }}></Td>
                                <Td style={{ width: `${columnWidths.grindOption.width}px` }}></Td>
                                <Td style={{ width: `${columnWidths.totalAmount.width}px` }}>{orderData.totalAmount.toFixed(2)} kg</Td>
                                <Td style={{ width: `${columnWidths.orderStatus.width}px` }}>{orderData.orderStatus}</Td>
                              </CustomerHeaderRow>
                              {isExpanded && orderData.items.map((item, itemIndex) => (
                                <ItemRow key={`${orderId}-${itemIndex}`} even={itemIndex % 2 === 0}>
                                  <Td style={{ width: `${columnWidths.checkbox.width}px` }}></Td>
                                  <Td style={{ width: `${columnWidths.customer.width}px` }}></Td>
                                  <Td style={{ width: `${columnWidths.orderId.width}px` }}></Td>
                                  <Td style={{ width: `${columnWidths.product.width}px` }}>{item[2]}</Td>
                                  <Td style={{ width: `${columnWidths.totalQty.width}px` }}>{item[3]}</Td>
                                  <Td style={{ width: `${columnWidths.bagSize.width}px` }}>{item[4]}</Td>
                                  <Td style={{ width: `${columnWidths.grindOption.width}px` }}>{item[5]}</Td>
                                  <Td style={{ width: `${columnWidths.totalAmount.width}px` }}>{item[6]} kg</Td>
                                  <Td style={{ width: `${columnWidths.orderStatus.width}px` }}>{item[7] !== orderData.orderStatus ? item[7] : ''}</Td>
                                </ItemRow>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </ContentContainer>
            </MainContent>
          </MainContentWrapper>
        </AppContainer>
      </>
    );
  }
  
  export default App;