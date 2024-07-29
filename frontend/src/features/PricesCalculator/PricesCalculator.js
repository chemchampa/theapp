import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProductForm from './AddProductForm';
import debounce from '../../utils/debounce';
import {
  MainContainer,
  FormContainer,
  TableContentContainer,
  TableContainer,
  ScrollableContent,
  StyledInput,
  MultipliersInput,
  EditableCell,
  LoadingSpinner,
  ErrorMessage,
  ColumnSelectorContainer,
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
  ConfirmationPopup,
  PopupTitle,
  PopupContent,
  PopupButtons,
  PopupButton,
} from './PricesCalculatorStyles';
import {
  Table,
  Th,
  Td,
  ItemRow,
  StyledSelect,
  FunctionalityBar,
  ActionButton,
  TableHeader,
  TableScrollContainer,
  ResizeHandle,
  FixedFunctionalityBar,
} from '../../components/GlobalStyle';

const PricesCalculator = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [updatingCells, setUpdatingCells] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
    {
      key: 'costPlusPricing',
      label: 'Cost-plus Pricing',
      editable: true,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
          {/* <option value="Tiered Markup Based on Cost">Tiered Markup Based on Cost</option> */}
        </StyledSelect>
      )
    },
    
    { key: 'markupMultiplierWholesale200g', label: 'Markup Multiplier for 200g Wholesale', editable: true },
    { key: 'wholesale200gPrice', label: 'Wholesale 200g price', editable: true },
    {
      key: 'controller',
      label: 'Controller',
      editable: true,
      editor: ({ value, onChange }) => {
        return (
          <MultipliersInput
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }
    },
    { key: 'wholesale1kgPrice', label: 'Wholesale 1kg List Price', editable: true },
    { key: 'wholesaleTier1', label: 'Wholesale Price: Tier 1 (75KG+)', editable: true },
    { key: 'wholesaleTier2', label: 'Wholesale Price: Tier 2 (20-75kg)', editable: true },
    { key: 'wholesaleTier3', label: 'Wholesale Price: Tier 3 (1-20kg)', editable: true },
  ];

  // const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));
  const [visibleColumns, setVisibleColumns] = useState([
    'coffeeProduct', 'greenCoffeePrice', 'postRoastCost', 'packed1kgCost', 'packed200gCost',
    'markupMultiplier200g', 'retail200gPrice', 'markupMultiplier1kg', 'retail1kgPrice',
    'costPlusPricing', 'markupMultiplierWholesale200g', 'wholesale200gPrice',
    'controller', 'wholesale1kgPrice', 'wholesaleTier1', 'wholesaleTier2', 'wholesaleTier3',
  ]);
  const [columnWidths, setColumnWidths] = useState({
    'Coffee Product': { width: 200, isResizable: true },
    'Green Coffee Price': { width: 120, isResizable: true },
    'Batch Size': { width: 80, isResizable: true },
    'Weight Loss %': { width: 80, isResizable: true },
    'Post Roast Cost of 1kg': { width: 90, isResizable: true },
    'Label Unit Price': { width: 80, isResizable: true },
    'Packaging Unit Price': { width: 80, isResizable: true },
    'Packed 1kg cost': { width: 120, isResizable: true },
    'Packed 200g cost': { width: 120, isResizable: true },
    'Markup Multiplier for 200g': { width: 80, isResizable: true },
    'Retail 200g price': { width: 90, isResizable: true },
    'Markup Multiplier for 1kg': { width: 80, isResizable: true },
    'Retail 1kg price': { width: 90, isResizable: true },
    'Cost-plus Pricing': { width: 200, isResizable: true },
    'Markup Multiplier for 200g Wholesale': { width: 120, isResizable: true },
    'Wholesale 200g price': { width: 120, isResizable: true },
    'Controller': { width: 100, isResizable: true },
    'Wholesale 1kg List Price': { width: 120, isResizable: true },
    'Wholesale Price: Tier 1 (75KG+)': { width: 120, isResizable: true },
    'Wholesale Price: Tier 2 (20-75kg)': { width: 120, isResizable: true },
    'Wholesale Price: Tier 3 (1-20kg)': { width: 120, isResizable: true },
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

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    const newSelectedRows = {};
    sortedData.forEach(item => {
      newSelectedRows[item.id] = isChecked;
    });
    setSelectedRows(newSelectedRows);
  };
  
  const handleCheckboxChange = (id) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setSelectAll(false);
  };

  // The debounced function is defined outside of this componentto avoid re-creating it on every render
  const debouncedUpdateBackend = debounce(async (payload, rowIndex, updatedData, setTableData) => {
    try {
        const response = await updateBackend(payload);
        if (response && response.data) {
            updatedData[rowIndex] = { ...updatedData[rowIndex], ...response.data };
            setTableData([...updatedData]);
        }
    } catch (error) {
        console.error(`Failed to update cell: ${error.message}`);
        // Optionally handle reverting data on error here if needed
    }
  }, 300); // 300 ms delay

  const handleCellEdit = async (rowIndex, columnKey, value) => {
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
    const updatedData = [...tableData];
    const rowData = updatedData[rowIndex];
    
    rowData[columnKey] = value; // Optimistic update for immediate feedback
    setTableData([...updatedData]);

    const payload = { 
        id: rowData.id, 
        [columnKey]: value, 
        packed1kgCost: rowData.packed1kgCost, 
        costPlusPricing: rowData.costPlusPricing 
    };

    if (columnKey === 'costPlusPricing') {
      let defaultControllerValue;
      switch (value) {
        case 'Fixed Percentage Markup':
        case 'Desired Profit Margin':
          defaultControllerValue = '0.20';
          break;
        case 'Fixed Amount Markup':
          defaultControllerValue = '5';
          break;
        case 'Keystone Pricing (100% Markup)':
          defaultControllerValue = '1';
          break;
        default:
          defaultControllerValue = '';
      }
      payload.controller = defaultControllerValue;
    } else if (columnKey === 'wholesale1kgPrice' || columnKey === 'controller') {
        payload.recalculateWholesale = true;
    }

    // Use debounced function to handle backend updates
    debouncedUpdateBackend(payload, rowIndex, updatedData, setTableData);

    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
  };

  const updateBackend = async (rowData) => {
    try {
      if (!rowData.id) {
        throw new Error('No ID provided for update');
      }
      const response = await axios.put(`/api/prices-calculator/${rowData.id}`, rowData);
      // return response; // Return the entire response object
      return response.data; // This should contain the updated row data
    } catch (error) {
      console.error('Error in updateBackend:', error.response ? error.response.data : error.message);
      throw new Error(`Failed to update backend: ${error.message}`);
    }
  };

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(key => key !== columnKey);
      } else {
        const columnIndex = columns.findIndex(col => col.key === columnKey);
        const newColumns = [...prev];
        newColumns.splice(columnIndex, 0, columnKey);
        return newColumns;
      }
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    try {
      const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
      await axios.delete('/api/prices-calculator', { data: { ids: selectedIds } });
      setTableData(prevData => prevData.filter(item => !selectedIds.includes(item.id)));
      setSelectedRows({});
      setSelectAll(false);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting products:', error);
      setError('Failed to delete products');
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const getSelectedRowsData = () => {
    return sortedData.filter(item => selectedRows[item.id]);
  };
  
  const handleExport = () => {
    const selectedData = getSelectedRowsData();
    // Implement your export logic here
    console.log('Exporting:', selectedData);
  };
  
  const handlePrint = () => {
    const selectedData = getSelectedRowsData();
    // Implement your print logic here
    console.log('Printing:', selectedData);
  };

  const startResize = (column) => (e) => {
    if (!columnWidths[column] || !columnWidths[column].isResizable) return;
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
      <TableHeader>Prices Calculator</TableHeader>
      <FixedFunctionalityBar>
        <FunctionalityBar>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ActionButton onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Hide Add Product' : 'Add Product'}
            </ActionButton>
            <StyledInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: "200px", marginLeft: "10px" }}
            />
          </div>
          <ColumnSelectorContainer>
            <ActionButton onClick={() => setShowColumnSelector(!showColumnSelector)}>
              Select Columns
            </ActionButton>
            {showColumnSelector && (
              <ColumnSelector
                columns={columns}
                visibleColumns={visibleColumns}
                toggleColumnVisibility={toggleColumnVisibility}
                setVisibleColumns={setVisibleColumns}
                onClose={() => setShowColumnSelector(false)}
              />
            )}
            <ActionButton onClick={handleDelete} disabled={Object.keys(selectedRows).length === 0}>
              Delete Selected
            </ActionButton>
            <ActionButton onClick={handleExport}>Export Selected</ActionButton>
            <ActionButton onClick={handlePrint}>Print Selected</ActionButton>
          </ColumnSelectorContainer>
        </FunctionalityBar>
      </FixedFunctionalityBar>
      {showDeleteConfirmation && (
        <ConfirmationPopup>
          <PopupTitle>Confirm Deletion</PopupTitle>
          <PopupContent>
            Are you sure you want to delete the selected product(s)? This action cannot be undone.
          </PopupContent>
          <PopupButtons>
            <PopupButton className="cancel" onClick={cancelDelete}>Cancel</PopupButton>
            <PopupButton className="confirm" onClick={confirmDelete}>Delete</PopupButton>
          </PopupButtons>
        </ConfirmationPopup>
      )}
      <ScrollableContent>
        <div style={{ display: 'flex', width: '100%' }}>
          <FormContainer isVisible={showAddForm}>
            {showAddForm && <AddProductForm onProductAdded={fetchTableData} />}
          </FormContainer>
          <TableContentContainer>
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
                        <Th style={{ width: '30px' }}>
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </Th>
                        {visibleColumns.map((columnKey, index) => {
                          const column = columns.find(col => col.key === columnKey);
                          return (
                            <Th 
                              key={columnKey} 
                              style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}
                            >
                              <ThContent onClick={() => handleSort(columnKey)}
                                isFirstColumn={index === 0}
                              >
                                {column.label}
                                <SortIcon className="sort-icon">
                                  {sortColumn === columnKey ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                                </SortIcon>
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
                          <Td style={{ width: '30px' }}>
                            <input
                              type="checkbox"
                              checked={selectedRows[item.id] || false}
                              onChange={() => handleCheckboxChange(item.id)}
                            />
                          </Td>
                          {visibleColumns.map(columnKey => {
                            const column = columns.find(col => col.key === columnKey);
                            return (
                              <Td key={columnKey} style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}>
                                {column.editable ? (
                                  <EditableCell
                                    value={item[columnKey]}
                                    onValueChange={(value) => handleCellEdit(rowIndex, columnKey, value)}
                                    isUpdating={updatingCells[`${rowIndex}-${columnKey}`]}
                                    editor={column.editor}
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
          </TableContentContainer>
        </div>
      </ScrollableContent>
    </MainContainer>
  );
};

const ColumnSelector = ({ columns, visibleColumns, toggleColumnVisibility, setVisibleColumns, onClose }) => {
  return (
    <ColumnSelectorOverlay>
      <ColumnSelectorContent>
        <ColumnSelectorHeader>
          <h3>Display sets:</h3>
          <ButtonGroup>
            <Button onClick={() => setVisibleColumns(columns.map(col => col.key))}>Show all</Button>
            <Button onClick={() => setVisibleColumns([])}>Hide all</Button>
            <Button onClick={() => setVisibleColumns(columns.map(col => col.key))}>Restore defaults</Button>
          </ButtonGroup>
        </ColumnSelectorHeader>
        <ColumnList>
          {columns.map(column => (
            <ColumnItem key={column.key}>
              <input
                type="checkbox"
                id={column.key}
                checked={visibleColumns.includes(column.key)}
                onChange={() => toggleColumnVisibility(column.key)}
              />
              <label htmlFor={column.key}>{column.label}</label>
            </ColumnItem>
          ))}
        </ColumnList>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ColumnSelectorContent>
    </ColumnSelectorOverlay>
  );
};

export default PricesCalculator;
