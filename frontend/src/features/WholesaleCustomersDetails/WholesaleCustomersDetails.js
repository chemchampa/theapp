import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    ResizeHandle,
    FixedFunctionalityBar,
} from '../../components/GlobalStyle';

import {
    WholesaleCustomersDetailsContainer,
    ScrollableContent,
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
} from './WholesaleCustomersDetailsStyles';

const WholesaleCustomersDetails = () => {
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
    const [visibleColumns, setVisibleColumns] = useState([
        'Business Name', 'Status', 'Main Coffee', 'Preferred Packaging Size', 'Any retail bags?', 
        'Order Type', 'Ordering Frequency', 'Notes', 'Behaviour patterns', 'Part of Prep?', 
        'Prep Quantity, kg', 'Automatic Ordering', 'Ordering Cycle Starts on'
    ]);

    const [columnWidths, setColumnWidths] = useState({
        checkbox: { width: 30, isResizable: false },
        ID: { width: 80, isResizable: true },
        'Business Name': { width: 150, isResizable: true },
        'Contact Name': { width: 150, isResizable: true },
        'Email': { width: 200, isResizable: true },
        'Phone': { width: 120, isResizable: true },
        'Delivery Address': { width: 200, isResizable: true },
        'Main Coffee': { width: 150, isResizable: true },
        'Preferred Packaging Size': { width: 100, isResizable: true },
        'Quantity Estimate in KG': { width: 100, isResizable: true },
        'Fresh Roast or Rested?': { width: 100, isResizable: true },
        'Any retail bags?': { width: 100, isResizable: true },
        'Order Type': { width: 100, isResizable: true },
        'Ordering Frequency': { width: 100, isResizable: true },
        'Roast Days': { width: 100, isResizable: true },
        'Preferred Delivery Days': { width: 100, isResizable: true },
        'Ordering via': { width: 100, isResizable: true },
        'Notes': { width: 200, isResizable: true },
        'Behaviour patterns': { width: 200, isResizable: true },
        'Status': { width: 100, isResizable: true },
        'Part of Prep?': { width: 100, isResizable: true },
        'Prep Quantity, kg': { width: 100, isResizable: true },
        'Automatic Ordering': { width: 100, isResizable: true },
        'Ordering Cycle Starts on': { width: 100, isResizable: true },
        'Type': { width: 100, isResizable: true },
    });
    
    const navigate = useNavigate();

    useEffect(() => {
    fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/whcustomer-details', { withCredentials: true }); // or I can use this as well:   const response = await axios.get('http://localhost:5000/api/whcustomer-details', { withCredentials: true });
            setCustomers(response.data);
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

    const toggleColumnVisibility = (column) => {
        setVisibleColumns(prev => 
          prev.includes(column) 
            ? prev.filter(col => col !== column) 
            : [...prev, column]
        );
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + Object.keys(customers[0]).join(",") + "\n"
            + customers.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wholesale_customers.csv");
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
            <head><title>Wholesale Customers Details</title></head>
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

    return (
        <WholesaleCustomersDetailsContainer>
            <TableHeader>Wholesale Customers Details</TableHeader>
            <FixedFunctionalityBar>
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
                                columns={Object.keys(columnWidths).filter(col => col !== 'checkbox')}
                                visibleColumns={visibleColumns}
                                toggleColumnVisibility={toggleColumnVisibility}
                                onClose={() => setShowColumnSelector(false)}
                            />
                        )}
                        <ActionButton onClick={() => navigate('/add-customer')}>Add Customer</ActionButton>
                    </div>
                    <div>
                        <ActionButton onClick={() => setShowColumnSelector(!showColumnSelector)}>
                            Select Columns
                        </ActionButton>
                        <ActionButton onClick={handleExport}>Export to CSV</ActionButton>
                        <ActionButton onClick={handlePrint}>Print Selected</ActionButton>
                    </div>
                </FunctionalityBar>
            </FixedFunctionalityBar>
            <ScrollableContent>
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
                                        <Td key={column} style={{ width: `${columnWidths[column]?.width || 100}px` }}>
                                            {customer[column]}
                                        </Td>
                                    ))}
                                </CustomerRow>
                            ))}
                        </tbody>
                    </Table>
                </TableScrollContainer>
            </ScrollableContent>
        </WholesaleCustomersDetailsContainer>
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
      <option value="Archived">Archived</option>
      <option value="Prospect">Prospect</option>
      <option value="Lost">Lost</option>
    </StyledSelect>
);

export default WholesaleCustomersDetails;
