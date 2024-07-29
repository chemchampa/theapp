///////////////////////////////////////////////////////////////////


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Th,
    Td,
    CustomerRow,
    FunctionalityBar,
    ActionButton,
    TableHeader,
    TableScrollContainer,
    ResizeHandle
} from '../../components/GlobalStyle';

import {
    WholesaleCustomersPricesContainer,
    StyledInput,
    StyledSelect,
    ColumnSelectorOverlay,
    ColumnSelectorContent,
    ColumnSelectorHeader,
    ButtonGroup,
    Button,
    ColumnList,
    ColumnItem,
    CloseButton,
    SortIcon,
    ThContent,
    StatusDropdown
} from './WholesaleCustomersPricesStyles';

const WholesaleCustomersPrices = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [statusFilter, setStatusFilter] = useState('Active');
    const [productColumns] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');


    const [visibleColumns, setVisibleColumns] = useState([
        'Business Name', 
        'Status', 
        // We'll add the product columns dynamically after fetching the data
    ]);

    const [columnWidths, setColumnWidths] = useState({
        checkbox: { width: 30, isResizable: false },
        ID: { width: 80, isResizable: true },
        'Business Name': { width: 150, isResizable: true },
        'Bells 200g': { width: 100, isResizable: true },
        'Bells 1kg': { width: 100, isResizable: true },
        'Bells 4kg': { width: 100, isResizable: true },
        'Brazil 200g': { width: 100, isResizable: true },
        'Brazil 1kg': { width: 100, isResizable: true },
        'Brazil 4kg': { width: 100, isResizable: true },
        'Up Hill 200g': { width: 100, isResizable: true },
        'Up Hill 1kg': { width: 100, isResizable: true },
        'Up Hill 4kg': { width: 100, isResizable: true },
        'Pivot 200g': { width: 100, isResizable: true },
        'Pivot 1kg': { width: 100, isResizable: true },
        'Pivot 4kg': { width: 100, isResizable: true },
        // ... add other coffee types and sizes
    });    
    

    useEffect(() => {
    fetchCustomers();
    }, []);

    useEffect(() => {
        const newColumnWidths = {
            checkbox: { width: 30, isResizable: false },
            ID: { width: 80, isResizable: true },
            'Business Name': { width: 150, isResizable: true },
            'Status': { width: 100, isResizable: true },
            ...productColumns.reduce((acc, column) => {
                acc[column] = { width: 100, isResizable: true };
                return acc;
            }, {})
        };
        setColumnWidths(newColumnWidths);
    }, [productColumns]);

    const fetchCustomers = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/whcustomer-prices', { withCredentials: true });
          setCustomers(response.data.customers);
          
          // Update visibleColumns with product columns
          const productColumns = response.data.productColumns || [];
          setVisibleColumns(prevColumns => [
            'Business Name',
            'Status',
            ...productColumns
          ]);
          
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch customers');
          setLoading(false);
        }
    };
      

    const handleSort = (column) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const AscIcon = () => <SortIcon>▲</SortIcon>;
    const DescIcon = () => <SortIcon>▼</SortIcon>;
    const NeutralIcon = () => <SortIcon>▲▼</SortIcon>;

    const sortedCustomers = [...customers].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredCustomers = sortedCustomers.filter(customer =>
        customer['Status'] === statusFilter &&
        Object.values(customer).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    const handleCheckboxChange = (customerId) => {
        setSelectedRows(prev => {
            const newSelectedRows = { ...prev, [customerId]: !prev[customerId] };
            const allSelected = Object.values(newSelectedRows).every(isSelected => isSelected);
            setSelectAll(allSelected);
            return newSelectedRows;
        });
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const newSelectedRows = {};
        filteredCustomers.forEach(customer => {
            newSelectedRows[customer.ID] = newSelectAll;
        });
        setSelectedRows(newSelectedRows);
    };

    const fixedColumnOrder = ['ID', 'Business Name', 'Status'];
    const toggleColumnVisibility = (column) => {
        setVisibleColumns(prev => {
          let newColumns;
          if (prev.includes(column)) {
            newColumns = prev.filter(col => col !== column);
          } else {
            newColumns = [...prev, column];
          }
          
          // Sort the columns according to the fixed order, then add the rest
          return [
            ...fixedColumnOrder.filter(col => newColumns.includes(col)),
            ...newColumns.filter(col => !fixedColumnOrder.includes(col))
          ];
        });
      };
      

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + Object.keys(customers[0]).join(",") + "\n"
            + customers.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wholesale_customers_prices.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handlePrint = () => {
        const printContent = customers
            .filter(customer => selectedRows[customer.ID])
            .map(customer => Object.values(customer).join(", "))
            .join("\n");

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head><title>Wholesale Customers Prices</title></head>
            <body>
                <pre>${printContent}</pre>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const startResize = (column) => (e) => {
        if (!columnWidths[column].isResizable) return;
        e.preventDefault();
        e.stopPropagation(); // Adding this line to prevent event bubbling
        const startX = e.pageX;
        const startWidth = columnWidths[column].width;
      
        const onMouseMove = (moveEvent) => {
            const diff = moveEvent.pageX - startX;
            const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
            setColumnWidths(prev => ({
            ...prev,
            [column]: { ...prev[column], width: newWidth }
            }));
        };
      
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
      
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const handleCellClick = (customerId, column) => {
        setEditingCell({ customerId, column });
        setEditValue(customers.find(c => c.ID === customerId)[column]);
      };
    
      const handleCellEdit = async (customerId, column, newValue) => {
        try {
          console.log('Sending update:', { customerId, column, newValue });
          await axios.post('/api/update-customer-price', {
            customerId,
            column,
            newValue
          }, { withCredentials: true });
      
          setCustomers(prevCustomers => prevCustomers.map(customer => 
            customer.ID === customerId ? { ...customer, [column]: newValue } : customer
          ));
      
          setEditingCell(null);
        } catch (error) {
          console.error('Failed to update cell:', error);
          throw error; // Rethrow the error so it can be caught by the calling function
        }
      };
      
      
      
    
      const validateEdit = (column, value) => {
        if (column === 'Status') {
          return ['Active', 'Prospect', 'Archived', 'Lost'].includes(value);
        }
        if (column.includes('200g') || column.includes('1kg') || column.includes('4kg')) {
          return /^£?\d+(\.\d{1,2})?$/.test(value);
        }
        return true;
      };

      const StatusCell = ({ status, customerId, onStatusChange }) => {
        const handleChange = (e) => {
          e.stopPropagation(); // Prevent the click from propagating to the cell
          onStatusChange(customerId, 'Status', e.target.value);
        };
      
        return (
          <StatusDropdown 
            value={status} 
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()} // Prevent clicks on the dropdown from triggering the cell's onClick
          >
            <option value="Active">Active</option>
            <option value="Prospect">Prospect</option>
            <option value="Archived">Archived</option>
            <option value="Lost">Lost</option>
          </StatusDropdown>
        );
      };
      

      const handleStatusChange = async (customerId, column, newValue) => {
        try {
          await handleCellEdit(customerId, column, newValue);
          // If the API call is successful, update the local state
          setCustomers(prevCustomers => 
            prevCustomers.map(customer => 
              customer.ID === customerId ? { ...customer, [column]: newValue } : customer
            )
          );
        } catch (error) {
          console.error('Failed to update status:', error);
          // Optionally, show an error message to the user
        }
      };
      
      

    return (
        <WholesaleCustomersPricesContainer>
            <TableHeader>Wholesale Customers Prices</TableHeader>
            <FunctionalityBar>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StyledInput
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '200px', marginRight: '10px' }}
                    />
                    <StatusSelector currentStatus={statusFilter} setStatus={setStatusFilter} />
                    {showColumnSelector && (
                        <ColumnSelector 
                            columns={['ID', 'Business Name', 'Status', ...productColumns]}
                            visibleColumns={visibleColumns}
                            toggleColumnVisibility={toggleColumnVisibility}
                            onClose={() => setShowColumnSelector(false)}
                        />
                    )}
                </div>
                <div>
                    <ActionButton onClick={() => setShowColumnSelector(!showColumnSelector)}>
                        Select Columns
                    </ActionButton>
                    <ActionButton onClick={handleExport}>Export to CSV</ActionButton>
                    <ActionButton onClick={handlePrint}>Print Selected</ActionButton>
                </div>
            </FunctionalityBar>
            <TableScrollContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th style={{ width: `${columnWidths.checkbox.width}px` }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </Th>
                            {visibleColumns.map(column => (
                                <Th 
                                    key={column} 
                                    style={{ width: `${columnWidths[column]?.width || 100}px`, position: 'relative' }} 
                                >
                                    <ThContent onClick={() => handleSort(column)}>
                                        {column}
                                        {column === 'Business Name' && (
                                            sortColumn === column 
                                                ? (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)
                                                : <NeutralIcon />
                                        )}
                                        {column !== 'Business Name' && column !== 'checkbox' && (
                                            <span style={{ opacity: sortColumn === column ? 1 : 0, transition: 'opacity 0.2s' }}>
                                                {sortColumn === column 
                                                    ? (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)
                                                    : <NeutralIcon />
                                                }
                                            </span>
                                        )}
                                    </ThContent>
                                    {columnWidths[column]?.isResizable && (
                                        <ResizeHandle 
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                startResize(column)(e);
                                            }}
                                        />
                                    )}
                                </Th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <CustomerRow key={customer.ID}>
                                <Td style={{ width: `${columnWidths.checkbox.width}px` }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows[customer.ID] || false}
                                        onChange={() => handleCheckboxChange(customer.ID)}
                                    />
                                </Td>
                                {visibleColumns.map(column => (
                                    <Td 
                                        key={column} 
                                        onClick={() => column !== 'Status' && handleCellClick(customer.ID, column)}
                                        style={{ width: `${columnWidths[column]?.width || 100}px` }}
                                    >
                                        {column === 'Status' ? (
                                            <StatusCell 
                                                status={customer[column]} 
                                                customerId={customer.ID} 
                                                onStatusChange={handleStatusChange}
                                            />
                                        ) : editingCell?.customerId === customer.ID && editingCell?.column === column ? (
                                            <input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => {
                                                    if (validateEdit(column, editValue)) {
                                                        handleCellEdit(customer.ID, column, editValue);
                                                    } else {
                                                        setEditingCell(null);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && validateEdit(column, editValue)) {
                                                        handleCellEdit(customer.ID, column, editValue);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            customer[column]
                                        )}
                                    </Td>
                                ))}
                            </CustomerRow>
                        ))}
                    </tbody>


                </Table>
            </TableScrollContainer>
        </WholesaleCustomersPricesContainer>
    );
};

const ColumnSelector = ({ columns, visibleColumns, toggleColumnVisibility, onClose }) => (
    <ColumnSelectorOverlay>
      <ColumnSelectorContent>
        <ColumnSelectorHeader>
          <h3>Display sets:</h3>
          <ButtonGroup>
            <Button onClick={() => columns.forEach(col => toggleColumnVisibility(col, true))}>Show all</Button>
            <Button onClick={() => columns.forEach(col => toggleColumnVisibility(col, false))}>Hide all</Button>
            <Button onClick={() => {/* Implement restore defaults */}}>Restore defaults</Button>
          </ButtonGroup>
        </ColumnSelectorHeader>
        <ColumnList>
          {columns.map(column => (
            <ColumnItem key={column}>
              <input
                type="checkbox"
                id={column}
                checked={visibleColumns.includes(column)}
                onChange={() => toggleColumnVisibility(column)}
              />
              <label htmlFor={column}>{column}</label>
            </ColumnItem>
          ))}
        </ColumnList>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ColumnSelectorContent>
    </ColumnSelectorOverlay>
);
  
const StatusSelector = ({ currentStatus, setStatus }) => (
    <StyledSelect 
      value={currentStatus} 
      onChange={(e) => setStatus(e.target.value)}
      style={{ height: '30px', marginLeft: '10px' }}
    >
      <option value="Active">Active</option>
      <option value="Prospect">Prospect</option>
      <option value="Archived">Archived</option>
      <option value="Lost">Lost</option>
    </StyledSelect>
);

export default WholesaleCustomersPrices;
