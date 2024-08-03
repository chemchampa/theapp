import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Td,
  CustomerRow,
  FunctionalityBar,
  ActionButton,
  TableHeader,
  TableScrollContainer,
  ResizeHandle,
  ThMain,
  ThSub,
  ThContent,
  FixedFunctionalityBar,
} from '../../components/GlobalStyle';
import {
  RoastedCoffeePricesContainer,
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
} from './RoastedCoffeePricesStyles';

const RoastedCoffeePrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [statusFilter, setStatusFilter] = useState('Live');
    // const [visibleColumns, setVisibleColumns] = useState([
    //     'CoffeeProduct', 'ProductCategory', 'Status', 'Cost 200g', 'Cost 1kg', 'Cost 4kg',
    //     'Retail200g.Price', 'Retail1kg.Price',
    //     'Wholesale200g.Price', 'Wholesale1kg.Price', 'Wholesale4kg.Price'
    // ]);

    
    const [visibleColumns, setVisibleColumns] = useState([
        'Coffee Product', 'Status', 
        'Cost 200g', 'Cost 1kg', 'Cost 4kg',
        'Retail 200g.Price', 'Retail 200g.Profit', 'Retail 200g.Profit Margin',
        'Retail 1kg.Price', 'Retail 1kg.Profit', 'Retail 1kg.Profit Margin',
        'Wholesale 200g.Price', 'Wholesale 200g.Profit', 'Wholesale 200g.Profit Margin',
        'Wholesale 1kg.Price', 'Wholesale 1kg.Profit', 'Wholesale 1kg.Profit Margin',
        'Wholesale 4kg.Price', 'Wholesale 4kg.Profit', 'Wholesale 4kg.Profit Margin',
        'Include In Clusters'
    ]);

    /*
        It always render columns in the order defined in allColumns below.
        When a column is toggled visible, it will appear in its correct position as defined in allColumns below.
    */
    const allColumns = [
        'SKU', 'Coffee Product', 'Components', 'Product Category', 'Status', 
        'Cost 200g', 'Cost 1kg', 'Cost 4kg',
        'Retail 200g.Price', 'Retail 200g.Profit', 'Retail 200g.Profit Margin',
        'Retail 1kg.Price', 'Retail 1kg.Profit', 'Retail 1kg.Profit Margin',
        'Wholesale 200g.Price', 'Wholesale 200g.Profit', 'Wholesale 200g.Profit Margin',
        'Wholesale 1kg.Price', 'Wholesale 1kg.Profit', 'Wholesale 1kg.Profit Margin',
        'Wholesale 4kg.Price', 'Wholesale 4kg.Profit', 'Wholesale 4kg.Profit Margin',
        'Include In Clusters'
    ];

    const [columnWidths, setColumnWidths] = useState({
        checkbox: { width: 30, isResizable: false },
        SKU: { width: 80, isResizable: true },
        'Coffee Product': { width: 150, isResizable: true },
        'Status': { width: 80, isResizable: false },
        'Product Category': { width: 100, isResizable: true },



    });

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/roasted-coffee-prices', { withCredentials: true });
            setPrices(response.data);
            setStatusFilter('Live'); // Set the default filter to 'Live' after fetching data
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch roasted coffee prices');
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
    const NeutralIcon = () => <SortIcon>▲▼</SortIcon>

    const filteredPrices = prices.filter(price =>
        (statusFilter === 'All' || price.Status === statusFilter) &&
        price['Coffee Product'].toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* 
        This function not only updates the search term but also adjusts the status filter based on whether there's a search term or not:
        - The search term is updated as the user types.
        - The status filter is set to 'All' when there's a search term.
        - The status filter is set to 'Live' when the search term is cleared.
    */
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        if (event.target.value !== '') {
          setStatusFilter('All');
        } else {
          setStatusFilter('Live');
        }
    };

    const sortedPrices = [...filteredPrices].sort((a, b) => {
        if (!sortColumn) return 0;
        const aValue = sortColumn.split('.').reduce((obj, key) => obj[key], a);
        const bValue = sortColumn.split('.').reduce((obj, key) => obj[key], b);
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleCheckboxChange = (sku) => {
        setSelectedRows(prev => ({
        ...prev,
        [sku]: !prev[sku]
        }));
        setSelectAll(false);
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        setSelectAll(isChecked);
        const newSelectedRows = {};
        sortedPrices.forEach(price => {
          newSelectedRows[price.SKU] = isChecked;
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
        + visibleColumns.join(",") + "\n"
        + sortedPrices.map(price => 
            visibleColumns.map(column => 
                column.includes('.') 
                ? `"${price[column.split('.')[0]][column.split('.')[1]]}"`
                : `"${price[column]}"`
            ).join(",")
            ).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "roasted_coffee_prices.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const printContent = sortedPrices
          .filter(price => selectedRows[price.SKU])
          .map(price => 
            visibleColumns.map(column => 
              `${column}: ${column.includes('.') 
                ? price[column.split('.')[0]][column.split('.')[1]] 
                : price[column]}`
            ).join(", ")
          )
          .join("\n\n");
      
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
            <head><title>Roasted Coffee Prices</title></head>
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
        <RoastedCoffeePricesContainer>
          <TableHeader>Roasted Coffee Prices</TableHeader>
          <FixedFunctionalityBar>
            <FunctionalityBar>
              <div style={{ display: "flex", alignItems: "center" }}>
                <StyledInput
                  type="text"
                  placeholder="Search coffee products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ width: "200px", marginRight: "10px" }}
                />
                <StatusSelector currentStatus={statusFilter} setStatus={setStatusFilter} />
                {showColumnSelector && (
                  <ColumnSelector
                  //   columns={Object.keys(columnWidths).filter(col => col !== 'checkbox')}
                    columns={Object.keys(prices[0] || {})}
                    visibleColumns={visibleColumns}
                    toggleColumnVisibility={toggleColumnVisibility}
                    setVisibleColumns={setVisibleColumns}
                    onClose={() => setShowColumnSelector(false)}
                    allColumns={allColumns}  // Passing allColumns as a prop
                  />
                )}
              </div>
              <div>
                <ActionButton onClick={() => setShowColumnSelector(!showColumnSelector)}>
                  Select Columns
                </ActionButton>
                <ActionButton onClick={handleExport}>Export to CSV</ActionButton>
                <ActionButton onClick={handlePrint}>Print Selected</ActionButton>
                <ActionButton onClick={fetchPrices}>Refresh Data</ActionButton>
              </div>
            </FunctionalityBar>
          </FixedFunctionalityBar>
          <ScrollableContent>
            <TableScrollContainer>
              <Table>
                  <thead>
                      <tr>
                      <ThMain rowSpan="2" style={{ width: `${columnWidths.checkbox.width}px` }}>
                          <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          />
                      </ThMain>
                      {allColumns.map((column) => {
                          if (visibleColumns.includes(column)) {
                          const [mainHeader, subHeader] = column.split('.');
                          return (
                              <ThMain
                              key={column}
                              colSpan={subHeader ? "1" : "1"}
                              style={{ width: `${columnWidths[column]?.width || 100}px`, position: "relative" }}
                              >
                              <ThContent onClick={() => handleSort(column)}>
                                  {mainHeader}
                                  {column === 'Coffee Product' && (
                                  sortColumn === column 
                                      ? (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)
                                      : <NeutralIcon />
                                  )}
                                  {column !== 'Coffee Product' && column !== 'checkbox' && (
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
                              </ThMain>
                          );
                          }
                          return null;
                      })}
                      </tr>
                      <tr>
                      {allColumns.map((column) => {
                          if (visibleColumns.includes(column)) {
                          const [, subHeader] = column.split('.');
                          return (
                              <ThSub key={`sub-${column}`}>
                              {subHeader || ''}
                              </ThSub>
                          );
                          }
                          return null;
                      })}
                      </tr>
                  </thead>
                  <tbody>
                      {sortedPrices.map((price) => (
                      <CustomerRow key={price.SKU}>
                          <Td style={{ width: `${columnWidths.checkbox.width}px` }}>
                          <input
                              type="checkbox"
                              checked={selectedRows[price.SKU] || false}
                              onChange={() => handleCheckboxChange(price.SKU)}
                          />
                          </Td>
                          {allColumns.map((column) => {
                          if (visibleColumns.includes(column)) {
                              return (
                              <Td key={column} style={{ width: `${columnWidths[column]?.width || 100}px`}}>
                                  {column.includes(".")
                                  ? (price[column.split(".")[0]] &&
                                      price[column.split(".")[0]][
                                          column.split(".")[1]
                                      ]) ||
                                      "N/A"
                                  : price[column] || "N/A"}
                              </Td>
                              );
                          }
                          return null;
                          })}
                      </CustomerRow>
                      ))}
                  </tbody>
              </Table>
            </TableScrollContainer>
          </ScrollableContent>
        </RoastedCoffeePricesContainer>
    );
};

const ColumnSelector = ({ visibleColumns, toggleColumnVisibility, setVisibleColumns, onClose, allColumns }) => {
    const getColumnLabel = (column) => {
      const [mainHeader, subHeader] = column.split('.');
      if (subHeader) {
        const formattedMainHeader = mainHeader.replace(/(\d+)/, ' $1');
        return `${formattedMainHeader} ${subHeader}`;
      }
      return column.replace(/(\d+)/, ' $1');
    };

    const priceColumns = [
        'Coffee Product', 'Components', 'Product Category', 'Status', 
        'Cost 200g', 'Cost 1kg', 'Cost 4kg',
        'Retail 200g.Price', 'Retail 1kg.Price', 'Retail 4kg.Price',
        'Wholesale 200g.Price', 'Wholesale 1kg.Price', 'Wholesale 4kg.Price'
      ];
      
      const profitColumns = [
        'Coffee Product', 'Components', 'Product Category', 'Status', 
        'Cost 200g', 'Cost 1kg', 'Cost 4kg',
        'Retail 200g.Profit', 'Retail 1kg.Profit', 'Retail 4kg.Profit',
        'Wholesale 200g.Profit', 'Wholesale 1kg.Profit', 'Wholesale 4kg.Profit'
      ];
      
      const marginColumns = [
        'Coffee Product', 'Components', 'Product Category', 'Status', 
        'Cost 200g', 'Cost 1kg', 'Cost 4kg',
        'Retail 200g.Profit Margin', 'Retail 1kg.Profit Margin', 'Retail 4kg.Profit Margin',
        'Wholesale 200g.Profit Margin', 'Wholesale 1kg.Profit Margin', 'Wholesale 4kg.Profit Margin'
      ];
  
    return (
      <ColumnSelectorOverlay>
        <ColumnSelectorContent>
          <ColumnSelectorHeader>
            <h3>Display sets:</h3>
            <ButtonGroup>
                <Button onClick={() => setVisibleColumns(allColumns)}>Show all</Button>
                <Button onClick={() => setVisibleColumns([])}>Hide all</Button>
                <Button onClick={() => setVisibleColumns(allColumns)}>Restore defaults</Button>
                <Button onClick={() => setVisibleColumns(priceColumns)}>Prices</Button>
                <Button onClick={() => setVisibleColumns(profitColumns)}>Profits</Button>
                <Button onClick={() => setVisibleColumns(marginColumns)}>Margins</Button>
            </ButtonGroup>
          </ColumnSelectorHeader>
          <ColumnList>
            {allColumns.map(column => (
              <ColumnItem key={column}>
                <input
                  type="checkbox"
                  id={column}
                  checked={visibleColumns.includes(column)}
                  onChange={() => toggleColumnVisibility(column)}
                />
                <label htmlFor={column}>{getColumnLabel(column)}</label>
              </ColumnItem>
            ))}
          </ColumnList>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </ColumnSelectorContent>
      </ColumnSelectorOverlay>
    );
  };

const StatusSelector = ({ currentStatus, setStatus }) => (
    <StyledSelect 
      value={currentStatus} 
      onChange={(e) => setStatus(e.target.value)}
      style={{ height: '30px', marginLeft: '10px' }}
    >
      <option value="Live">Live</option>
      <option value="All">All</option>
      <option value="Archived">Archived</option>
      <option value="Upcoming">Upcoming</option>
    </StyledSelect>
);

export default RoastedCoffeePrices;