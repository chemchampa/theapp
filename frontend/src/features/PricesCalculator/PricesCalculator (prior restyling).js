import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProductForm from './AddProductForm';
import {
  MainContainer,
  FormContainer,
  TableContainer,
  StyledInput,
  EditableCell,
  LoadingSpinner,
  ErrorMessage,
  // StyledSelect,
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
} from './PricesCalculatorStyles';

import {
  Table,
  Th,
  Td,
  ItemRow,
  FunctionalityBar,
  ActionButton,
  // TableHeader,
  TableScrollContainer,
  ResizeHandle
} from '../../components/GlobalStyle';

const PricesCalculator = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [updatingCells, setUpdatingCells] = useState({});

  useEffect(() => {
    fetchTableData();
  }, []);

  const columns = [
    { key: 'coffeeProduct', label: 'Coffee Product' },
    { key: 'greenCoffeePrice', label: 'Green Coffee Price' },
    { key: 'batchSize', label: 'Batch Size' },
    { key: 'weightLoss', label: 'Weight Loss %' },
    { key: 'postRoastCost', label: 'Post Roast Cost of 1kg' },
    { key: 'labelUnitPrice', label: 'Label Unit Price' },
    { key: 'packagingUnitPrice', label: 'Packaging Unit Price' },
    { key: 'packed1kgCost', label: 'Packed 1kg cost' },
    { key: 'packed200gCost', label: 'Packed 200g cost' },
    { key: 'markupMultiplier200g', label: 'Markup Multiplier for 200g', editable: true },
    { key: 'retail200gPrice', label: 'Retail 200g price', editable: true },
    { key: 'markupMultiplier1kg', label: 'Markup Multiplier for 1kg', editable: true },
    { key: 'retail1kgPrice', label: 'Retail 1kg price', editable: true },
    { key: 'markupMultiplierWholesale200g', label: 'Markup Multiplier for 200g Wholesale', editable: true },
    { key: 'wholesale200gPrice', label: 'Wholesale 200g price', editable: true },
    { key: 'wholesaleTier1', label: 'Wholesale Price: Tier 1 (75KG+)', editable: true },
    { key: 'wholesaleTier2', label: 'Wholesale Price: Tier 2 (20-75kg)', editable: true },
    { key: 'wholesaleTier3', label: 'Wholesale Price: Tier 3 (1-20kg)', editable: true },
    { key: 'wholesaleListPrice', label: 'Wholesale list 1kg price', editable: true },
  ];
  

  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const [columnWidths, setColumnWidths] = useState({
    'Coffee Product': { width: 150, isResizable: true },
    'Green Coffee Price': { width: 120, isResizable: true },
    'Batch Size': { width: 80, isResizable: true },
    'Weight Loss %': { width: 80, isResizable: true },
    'Post Roast Cost of 1kg': { width: 80, isResizable: true },
    'Label Unit Price': { width: 80, isResizable: true },
    'Packaging Unit Price': { width: 80, isResizable: true },
    'Packed 1kg cost': { width: 120, isResizable: true },
    'Packed 200g cost': { width: 120, isResizable: true },
    'Markup Multiplier for 200g': { width: 150, isResizable: true },
    'Retail 200g price': { width: 120, isResizable: true },
    'Markup Multiplier for 1kg': { width: 150, isResizable: true },
    'Retail 1kg price': { width: 120, isResizable: true },
    'Markup Multiplier for 200g Wholesale': { width: 120, isResizable: true },
    'Wholesale 200g price': { width: 120, isResizable: true },
    'Wholesale Price: Tier 1 (75KG+)': { width: 120, isResizable: true },
    'Wholesale Price: Tier 2 (20-75kg)': { width: 120, isResizable: true },
    'Wholesale Price: Tier 3 (1-20kg)': { width: 120, isResizable: true },
    'Wholesale list 1kg price': { width: 120, isResizable: true },
  });

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/prices-calculator');
      
      const dataWithIds = response.data.map((item, index) => {
        if (!item.id) {
          console.warn(`Item ${index} is missing an ID:`, item);
          item.id = `temp-${index}`; // Temporary fallback
        }
        return item;
      });
      
      setTableData(dataWithIds);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = tableData.filter(item =>
    item.coffeeProduct && item.coffeeProduct.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // const handleCellEdit = async (rowIndex, columnKey, value) => {
  //   setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
  //   try {
  //     const updatedData = [...tableData];
  //     updatedData[rowIndex][columnKey] = value;
  
  //     if (columnKey === 'markupMultiplier200g') {
  //       updatedData[rowIndex].retail200gPrice = (updatedData[rowIndex].packed200gCost * value).toFixed(2);
  //     } else if (columnKey === 'retail200gPrice') {
  //       updatedData[rowIndex].markupMultiplier200g = (value / updatedData[rowIndex].packed200gCost).toFixed(2);
  //     }
  
  //     const rowData = updatedData[rowIndex];

  //     if (!rowData.id) {
  //       console.error('No ID found for row:', rowData);
  //       throw new Error('No ID found for row');
  //     }
  //     await updateBackend(rowData);
  //     setTableData(updatedData);
  //   } catch (error) {
  //     setError(`Failed to update cell: ${error.message}`);
  //   } finally {
  //     setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
  //   }
  // };

  // const handleCellEdit = async (rowIndex, columnKey, value) => {
  //   setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
  //   try {
  //     const updatedData = [...tableData];
  //     updatedData[rowIndex][columnKey] = value;
  
  //     // Perform calculations based on the edited column
  //     switch (columnKey) {
  //       case 'markupMultiplier200g':
  //         updatedData[rowIndex].retail200gPrice = (updatedData[rowIndex].packed200gCost * value).toFixed(2);
  //         break;
  //       case 'retail200gPrice':
  //         updatedData[rowIndex].markupMultiplier200g = (value / updatedData[rowIndex].packed200gCost).toFixed(2);
  //         break;
  //       case 'markupMultiplier1kg':
  //         updatedData[rowIndex].retail1kgPrice = (updatedData[rowIndex].packed1kgCost * value).toFixed(2);
  //         break;
  //       case 'retail1kgPrice':
  //         updatedData[rowIndex].markupMultiplier1kg = (value / updatedData[rowIndex].packed1kgCost).toFixed(2);
  //         break;
  //       case 'markupMultiplierWholesale200g':
  //         updatedData[rowIndex].wholesale200gPrice = (updatedData[rowIndex].packed200gCost * value).toFixed(2);
  //         break;
  //       case 'wholesale200gPrice':
  //         updatedData[rowIndex].markupMultiplierWholesale200g = (value / updatedData[rowIndex].packed200gCost).toFixed(2);
  //         break;
  //       case 'wholesaleListPrice':
  //         {
  //           // Wholesale list price is based on packed1kgCost
  //           const listMarkup = value / updatedData[rowIndex].packed1kgCost;
  //           updatedData[rowIndex].wholesaleTier1 = (updatedData[rowIndex].packed1kgCost * listMarkup * 0.95).toFixed(2); // 5% discount
  //           updatedData[rowIndex].wholesaleTier2 = (updatedData[rowIndex].packed1kgCost * listMarkup * 0.90).toFixed(2); // 10% discount
  //           updatedData[rowIndex].wholesaleTier3 = (updatedData[rowIndex].packed1kgCost * listMarkup * 0.85).toFixed(2); // 15% discount
  //         }
  //         break;
  //       case 'wholesaleTier1':
  //       case 'wholesaleTier2':
  //       case 'wholesaleTier3':
  //         {
  //           // When any tier is manually edited, update the list price and other tiers
  //           const basePrice = updatedData[rowIndex].packed1kgCost;
  //           let tierMarkup;
  //           if (columnKey === 'wholesaleTier1') {
  //             tierMarkup = value / (basePrice * 0.95);
  //           } else if (columnKey === 'wholesaleTier2') {
  //             tierMarkup = value / (basePrice * 0.90);
  //           } else {
  //             tierMarkup = value / (basePrice * 0.85);
  //           }
  //           updatedData[rowIndex].wholesaleListPrice = (basePrice * tierMarkup).toFixed(2);
  //           updatedData[rowIndex].wholesaleTier1 = (basePrice * tierMarkup * 0.95).toFixed(2);
  //           updatedData[rowIndex].wholesaleTier2 = (basePrice * tierMarkup * 0.90).toFixed(2);
  //           updatedData[rowIndex].wholesaleTier3 = (basePrice * tierMarkup * 0.85).toFixed(2);
  //           // Overwrite the manually edited tier with the original value
  //           updatedData[rowIndex][columnKey] = value;
  //         }
  //         break;
  //       default:
  //         console.log(`No special calculation for column: ${columnKey}`);
  //     }
  
  //     const rowData = updatedData[rowIndex];
  
  //     if (!rowData.id) {
  //       console.error('No ID found for row:', rowData);
  //       throw new Error('No ID found for row');
  //     }
  //     await updateBackend(rowData);
  //     setTableData(updatedData);
  //   } catch (error) {
  //     setError(`Failed to update cell: ${error.message}`);
  //   } finally {
  //     setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
  //   }
  // };
  


  const handleCellEdit = async (rowIndex, columnKey, value) => {
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
    try {
      const updatedData = [...tableData];
      updatedData[rowIndex][columnKey] = value;
  
      // Ensure packed1kgCost is available or calculate it if necessary
      let packed1kgCost = parseFloat(updatedData[rowIndex].packed1kgCost);
      if (isNaN(packed1kgCost)) {
        // If packed1kgCost is not available, we might need to calculate it
        // This is a placeholder calculation - adjust according to your actual business logic
        const greenCoffeePrice = parseFloat(updatedData[rowIndex].greenCoffeePrice);
        const weightLoss = parseFloat(updatedData[rowIndex].weightLoss) / 100;
        const labelUnitPrice = parseFloat(updatedData[rowIndex].labelUnitPrice);
        const packagingUnitPrice = parseFloat(updatedData[rowIndex].packagingUnitPrice);
        packed1kgCost = (greenCoffeePrice / (1 - weightLoss)) + labelUnitPrice + packagingUnitPrice;
        updatedData[rowIndex].packed1kgCost = packed1kgCost.toFixed(2);
      }
  
      // Perform calculations based on the edited column
      switch (columnKey) {
        case 'markupMultiplier200g':
          updatedData[rowIndex].retail200gPrice = (updatedData[rowIndex].packed200gCost * value).toFixed(2);
          break;
        case 'retail200gPrice':
          updatedData[rowIndex].markupMultiplier200g = (value / updatedData[rowIndex].packed200gCost).toFixed(2);
          break;
        case 'markupMultiplier1kg':
          updatedData[rowIndex].retail1kgPrice = (updatedData[rowIndex].packed1kgCost * value).toFixed(2);
          break;
        case 'retail1kgPrice':
          updatedData[rowIndex].markupMultiplier1kg = (value / updatedData[rowIndex].packed1kgCost).toFixed(2);
          break;
        case 'markupMultiplierWholesale200g':
          updatedData[rowIndex].wholesale200gPrice = (updatedData[rowIndex].packed200gCost * value).toFixed(2);
          break;
        case 'wholesale200gPrice':
          updatedData[rowIndex].markupMultiplierWholesale200g = (value / updatedData[rowIndex].packed200gCost).toFixed(2);
          break;
        case 'wholesaleListPrice':
          {
            const listMarkup = value / packed1kgCost;
            updatedData[rowIndex].wholesaleTier1 = (packed1kgCost * listMarkup * 0.85).toFixed(2); // 15% discount
            updatedData[rowIndex].wholesaleTier2 = (packed1kgCost * listMarkup * 0.90).toFixed(2); // 10% discount
            updatedData[rowIndex].wholesaleTier3 = (packed1kgCost * listMarkup * 0.95).toFixed(2); // 5% discount
          }
          break;
        
        case 'wholesaleTier1':
        case 'wholesaleTier2':
        case 'wholesaleTier3':
          {
            let markup;
            if (columnKey === 'wholesaleTier1') {
              markup = value / (packed1kgCost * 0.95);
            } else if (columnKey === 'wholesaleTier2') {
              markup = value / (packed1kgCost * 0.90);
            } else {
              markup = value / (packed1kgCost * 0.85);
            }
            updatedData[rowIndex].wholesaleListPrice = (packed1kgCost * markup).toFixed(2);
            updatedData[rowIndex].wholesaleTier1 = (packed1kgCost * markup * 0.85).toFixed(2); // 15% discount
            updatedData[rowIndex].wholesaleTier2 = (packed1kgCost * markup * 0.90).toFixed(2); // 10% discount
            updatedData[rowIndex].wholesaleTier3 = (packed1kgCost * markup * 0.95).toFixed(2); // 5% discount
            // Overwrite the manually edited tier with the original value
            updatedData[rowIndex][columnKey] = value;
          }
          break;


        default:
          console.log(`No special calculation for column: ${columnKey}`);
      }
  
      const rowData = updatedData[rowIndex];
  
      if (!rowData.id) {
        console.error('No ID found for row:', rowData);
        throw new Error('No ID found for row');
      }
      await updateBackend(rowData);
      setTableData(updatedData);
    } catch (error) {
      setError(`Failed to update cell: ${error.message}`);
    } finally {
      setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
    }
  };
  
  
  
  
  const updateBackend = async (rowData) => {
    try {
      if (!rowData.id) {
        throw new Error('No ID provided for update');
      }
      await axios.put(`/api/prices-calculator/${rowData.id}`, rowData);
    } catch (error) {
      console.error('Error in updateBackend:', error.response ? error.response.data : error.message);
      throw new Error(`Failed to update backend: ${error.message}`);
    }
  };

  // Function to toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const startResize = (column) => (e) => {
    if (!columnWidths[column] || !columnWidths[column].isResizable)
    e.preventDefault();
    e.stopPropagation();
    const startX = e.pageX;
    const startWidth = columnWidths[column].width;
    const onMouseMove = (moveEvent) => {
      const diff = moveEvent.pageX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [column]: { ...prev[column], width: newWidth } }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  return (
    <MainContainer>
      <FunctionalityBar>
        <ActionButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Hide Add Product' : 'Add Product'}
        </ActionButton>
        <StyledInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <ActionButton onClick={() => setShowColumnSelector(!showColumnSelector)}>
          Select Columns
        </ActionButton>
      </FunctionalityBar>
      <div style={{ display: 'flex', width: '100%' }}>
        <FormContainer isVisible={showAddForm}>
          {showAddForm && <AddProductForm onProductAdded={fetchTableData} />}
        </FormContainer>
        <TableContainer isFormVisible={showAddForm}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <TableScrollContainer>
              <Table>
                <thead>
                  <tr>
                    {visibleColumns.map(columnKey => {
                      const column = columns.find(col => col.key === columnKey);
                      return (
                        <Th 
                          key={columnKey} 
                          style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}
                        >
                          <ThContent onClick={() => handleSort(columnKey)}>
                            {column.label}
                            {sortColumn === columnKey && (
                              <SortIcon>{sortDirection === 'asc' ? '▲' : '▼'}</SortIcon>
                            )}
                          </ThContent>
                          {columnWidths[column.label] && columnWidths[column.label].isResizable && (
                            <ResizeHandle onMouseDown={startResize(column.label)} />
                          )}
                        </Th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, rowIndex) => (
                    <ItemRow key={item.id || rowIndex} even={rowIndex % 2 === 0}>
                      {visibleColumns.map(columnKey => {
                        const column = columns.find(col => col.key === columnKey);
                        return (
                          <Td key={columnKey} style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}>
                            {column.editable ? (
                              <EditableCell
                                value={item[columnKey]}
                                onValueChange={(value) => handleCellEdit(rowIndex, columnKey, value)}
                                isUpdating={updatingCells[`${rowIndex}-${columnKey}`]}
                              />
                            ) : (
                              item[columnKey]
                            )}
                          </Td>
                        );
                      })}
                    </ItemRow>
                  ))}
                </tbody>
              </Table>
            </TableScrollContainer>
          )}
        </TableContainer>
      </div>
      {showColumnSelector && (
        <ColumnSelectorOverlay>
          <ColumnSelectorContent>
            <ColumnSelectorHeader>
              <h3>Select Columns</h3>
              <ButtonGroup>
                <Button onClick={() => setVisibleColumns(Object.keys(columnWidths))}>
                  Select All
                </Button>
                <Button onClick={() => setVisibleColumns([])}>
                  Deselect All
                </Button>
              </ButtonGroup>
            </ColumnSelectorHeader>
            <ColumnList>
              {columns.map(column => (
                <ColumnItem key={column.key}>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => toggleColumnVisibility(column.key)}
                  />
                  <label>{column.label}</label>
                </ColumnItem>
              ))}
            </ColumnList>
            <CloseButton onClick={() => setShowColumnSelector(false)}>
              Close
            </CloseButton>
          </ColumnSelectorContent>
        </ColumnSelectorOverlay>
      )}
    </MainContainer>
  );
  
};

export default PricesCalculator;