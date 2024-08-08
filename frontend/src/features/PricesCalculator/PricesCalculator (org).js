import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProductForm from './AddProductForm';
import debounce from '../../utils/debounce';
import EditProductForm from './EditProductForm';
import {
  MainContainer,
  FormContainer,
  TableContentContainer,
  TableContainer,
  ScrollableContent,
  StyledInput,
  // MultipliersInput,
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
  ClickableProductName,
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchTableData();
  }, []);


  
  // const columns = [
  //   { 
  //     key: 'coffeeProduct', 
  //     label: 'Coffee Product',
  //     render: (value, row) => (
  //       <ClickableProductName onClick={() => handleProductClick(row)}>
  //         {value}
  //       </ClickableProductName>
  //     )
  //   },
  //   { key: 'greenCoffeePrice', label: 'Green Coffee Price' },
  //   { key: 'batchSize', label: 'Batch Size' },
  //   { key: 'weightLoss', label: 'Weight Loss %' },
  //   { key: 'postRoastCost', label: 'Post Roast Cost of 1kg' },
  //   { key: 'labelUnitPrice', label: 'Label Unit Price' },
  //   { key: 'packagingUnitPrice', label: 'Packaging Unit Price' },
  //   { key: 'packed1kgCost', label: 'Packed 1kg cost' },
  //   { key: 'packed200gCost', label: 'Packed 200g cost' },
  //   { key: 'markupMultiplier200g', label: 'Markup Multiplier for 200g', editable: true },
  //   { key: 'retail200gPrice', label: 'Retail 200g price', editable: true },
  //   { key: 'markupMultiplier1kg', label: 'Markup Multiplier for 1kg', editable: true },
  //   { key: 'retail1kgPrice', label: 'Retail 1kg price', editable: true },
  //   {
  //     key: 'costPlusPricing',
  //     label: 'Cost-plus Pricing',
  //     editable: true,
  //     editor: ({ value, onChange }) => (
  //       <StyledSelect
  //         value={value}
  //         onChange={(e) => onChange(e.target.value)}
  //       >
  //         <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
  //         <option value="Fixed Amount Markup">Fixed Amount Markup</option>
  //         <option value="Desired Profit Margin">Desired Profit Margin</option>
  //         <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
  //         {/* <option value="Tiered Markup Based on Cost">Tiered Markup Based on Cost</option> */}
  //       </StyledSelect>
  //     )
  //   },
    
  //   { key: 'markupMultiplierWholesale200g', label: 'Markup Multiplier for 200g Wholesale', editable: true },
  //   { key: 'wholesale200gPrice', label: 'Wholesale 200g price', editable: true },
  //   {
  //     key: 'controller',
  //     label: 'Controller',
  //     editable: true,
  //     editor: ({ value, onChange }) => {
  //       return (
  //         <MultipliersInput
  //           type="text"
  //           value={value}
  //           onChange={(e) => onChange(e.target.value)}
  //         />
  //       );
  //     }
  //   },
  //   { key: 'wholesale1kgPrice', label: 'Wholesale 1kg List Price', editable: true },
  //   { key: 'wholesaleTier1', label: 'Wholesale Price: Tier 1 (75KG+)', editable: true },
  //   { key: 'wholesaleTier2', label: 'Wholesale Price: Tier 2 (20-75kg)', editable: true },
  //   { key: 'wholesaleTier3', label: 'Wholesale Price: Tier 3 (1-20kg)', editable: true },
  // ];

  // // const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));
  // const [visibleColumns, setVisibleColumns] = useState([
  //   'coffeeProduct', 'greenCoffeePrice', 'postRoastCost', 'packed1kgCost', 'packed200gCost',
  //   'markupMultiplier200g', 'retail200gPrice', 'markupMultiplier1kg', 'retail1kgPrice',
  //   'costPlusPricing', 'markupMultiplierWholesale200g', 'wholesale200gPrice',
  //   'controller', 'wholesale1kgPrice', 'wholesaleTier1', 'wholesaleTier2', 'wholesaleTier3',
  // ]);
  // const [columnWidths, setColumnWidths] = useState({
  //   'Coffee Product': { width: 200, isResizable: true },
  //   'Green Coffee Price': { width: 120, isResizable: true },
  //   'Batch Size': { width: 80, isResizable: true },
  //   'Weight Loss %': { width: 80, isResizable: true },
  //   'Post Roast Cost of 1kg': { width: 90, isResizable: true },
  //   'Label Unit Price': { width: 80, isResizable: true },
  //   'Packaging Unit Price': { width: 80, isResizable: true },
  //   'Packed 1kg cost': { width: 120, isResizable: true },
  //   'Packed 200g cost': { width: 120, isResizable: true },
  //   'Markup Multiplier for 200g': { width: 80, isResizable: true },
  //   'Retail 200g price': { width: 90, isResizable: true },
  //   'Markup Multiplier for 1kg': { width: 80, isResizable: true },
  //   'Retail 1kg price': { width: 90, isResizable: true },
  //   'Cost-plus Pricing': { width: 200, isResizable: true },
  //   'Markup Multiplier for 200g Wholesale': { width: 120, isResizable: true },
  //   'Wholesale 200g price': { width: 120, isResizable: true },
  //   'Controller': { width: 100, isResizable: true },
  //   'Wholesale 1kg List Price': { width: 120, isResizable: true },
  //   'Wholesale Price: Tier 1 (75KG+)': { width: 120, isResizable: true },
  //   'Wholesale Price: Tier 2 (20-75kg)': { width: 120, isResizable: true },
  //   'Wholesale Price: Tier 3 (1-20kg)': { width: 120, isResizable: true },
  // });


  // const columns = [
  //   { 
  //     key: 'coffeeProduct', 
  //     label: 'Coffee Product',
  //     render: (value, row) => (
  //       <ClickableProductName onClick={() => handleProductClick(row)}>
  //         {value}
  //       </ClickableProductName>
  //     )
  //   },
  //   { key: 'greenCoffeePrice', label: 'Green Coffee Price' },
  //   { key: 'batchSize', label: 'Batch Size' },
  //   { key: 'weightLoss', label: 'Weight Loss %' },
  //   { key: 'postRoastCost', label: 'Post Roast Cost of 1kg' },
  //   { key: 'labelUnitPrice', label: 'Label Unit Price' },
  //   { key: 'packagingUnitPrice', label: 'Packaging Unit Price' },
  //   { key: 'packed1kgCost', label: 'Packed 1kg cost' },
  //   { key: 'packed200gCost', label: 'Packed 200g cost' },
  //   // Cost-plus Pricing for Retail 200g is missing here
  //   { key: 'retailPricing.200g.multiplier200gRetail', label: 'Retail 200g Multiplier', editable: true },
  //   { key: 'retailPricing.200g.retailPrice200g', label: 'Retail 200g Price', editable: true },
  //   // Cost-plus Pricing for Retail 1kg is missing here
  //   { key: 'retailPricing.1kg.multiplier1kgRetail', label: 'Retail 1kg Multiplier', editable: true },
  //   { key: 'retailPricing.1kg.retailPrice1kg', label: 'Retail 1kg Price', editable: true },
  //   // Cost-plus Pricing for Wholesale 1kg is missing here
  //   { key: 'wholesalePricing.200g.multiplier200gWholesale', label: 'Wholesale 200g Multiplier', editable: true },
  //   { key: 'wholesalePricing.200g.wholesalePrice200g', label: 'Wholesale 200g Price', editable: true },
  //   {
  //     key: 'wholesalePricing.1kg.costPlusPricingMethod1kgWholesale',
  //     label: 'Wholesale Cost-plus Pricing',
  //     editable: true,
  //     editor: ({ value, onChange }) => (
  //       <StyledSelect
  //         value={value}
  //         onChange={(e) => onChange(e.target.value)}
  //       >
  //         <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
  //         <option value="Fixed Amount Markup">Fixed Amount Markup</option>
  //         <option value="Desired Profit Margin">Desired Profit Margin</option>
  //         <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
  //       </StyledSelect>
  //     )
  //   },
  //   {
  //     key: 'wholesalePricing.1kg.multiplier1kgWholesale',
  //     label: 'Wholesale 1kg Multiplier',
  //     editable: true,
  //     editor: ({ value, onChange }) => {
  //       return (
  //         <MultipliersInput
  //           type="text"
  //           value={value}
  //           onChange={(e) => onChange(e.target.value)}
  //         />
  //       );
  //     }
  //   },
  //   { key: 'wholesalePricing.1kg.wholesalePrice1kg', label: 'Wholesale 1kg List Price', editable: true },
  //   // Cost-plus Pricing for Wholesale Tier 1 is missing here
  //   // Miltiplier for Tier 1 is missing here
  //   { key: 'wholesalePricing.tier1.wholesalePriceTier1', label: 'Wholesale Price: Tier 1 (75KG+)', editable: true },
  //   // Cost-plus Pricing for Wholesale Tier 2 is missing here
  //   // Miltiplier for Tier 2 is missing here
  //   { key: 'wholesalePricing.tier2.wholesalePriceTier2', label: 'Wholesale Price: Tier 2 (20-75kg)', editable: true },
  //   // Cost-plus Pricing for Wholesale Tier 3 is missing here
  //   // Miltiplier for Tier 3 is missing here
  //   { key: 'wholesalePricing.tier3.wholesalePriceTier3', label: 'Wholesale Price: Tier 3 (1-20kg)', editable: true },
  // ];
  
  // const [visibleColumns, setVisibleColumns] = useState([
  //   'coffeeProduct', 'greenCoffeePrice', 'postRoastCost', 'packed1kgCost', 'packed200gCost',
  //   'retailPricing.200g.multiplier200gRetail', 'retailPricing.200g.retailPrice200g',
  //   'retailPricing.1kg.multiplier1kgRetail', 'retailPricing.1kg.retailPrice1kg',
  //   'wholesalePricing.1kg.costPlusPricingMethod1kgWholesale',
  //   'wholesalePricing.200g.multiplier200gWholesale', 'wholesalePricing.200g.wholesalePrice200g',
  //   'wholesalePricing.1kg.multiplier1kgWholesale', 'wholesalePricing.1kg.wholesalePrice1kg',
  //   'wholesalePricing.tier1.wholesalePriceTier1', 'wholesalePricing.tier2.wholesalePriceTier2',
  //   'wholesalePricing.tier3.wholesalePriceTier3',
  // ]);
  
  // const [columnWidths, setColumnWidths] = useState({
  //   'Coffee Product': { width: 200, isResizable: true },
  //   'Green Coffee Price': { width: 120, isResizable: true },
  //   'Batch Size': { width: 80, isResizable: true },
  //   'Weight Loss %': { width: 80, isResizable: true },
  //   'Post Roast Cost of 1kg': { width: 90, isResizable: true },
  //   'Label Unit Price': { width: 80, isResizable: true },
  //   'Packaging Unit Price': { width: 80, isResizable: true },
  //   'Packed 1kg cost': { width: 120, isResizable: true },
  //   'Packed 200g cost': { width: 120, isResizable: true },
  //   // Cost-plus Pricing for Retail 200g is missing here
  //   'Retail 200g Multiplier': { width: 80, isResizable: true },
  //   'Retail 200g Price': { width: 90, isResizable: true },
  //   // Cost-plus Pricing for Retail 1kg is missing here
  //   'Retail 1kg Multiplier': { width: 80, isResizable: true },
  //   'Retail 1kg Price': { width: 90, isResizable: true },
  //   'Wholesale Cost-plus Pricing': { width: 200, isResizable: true },
  //   'Wholesale 200g Multiplier': { width: 120, isResizable: true },
  //   'Wholesale 200g Price': { width: 120, isResizable: true },
  //   // Cost-plus Pricing for Wholesale 1kg is missing here
  //   'Wholesale 1kg Multiplier': { width: 100, isResizable: true },
  //   'Wholesale 1kg List Price': { width: 120, isResizable: true },
  //   // Cost-plus Pricing for Wholesale Tier 1 is missing here
  //   // Miltiplier for Tier 1 is missing here
  //   'Wholesale Price: Tier 1 (75KG+)': { width: 120, isResizable: true },
  //   // Cost-plus Pricing for Wholesale Tier 2 is missing here
  //   // Miltiplier for Tier 2 is missing here
  //   'Wholesale Price: Tier 2 (20-75kg)': { width: 120, isResizable: true },
  //   // Cost-plus Pricing for Wholesale Tier 3 is missing here
  //   // Miltiplier for Tier 3 is missing here
  //   'Wholesale Price: Tier 3 (1-20kg)': { width: 120, isResizable: true },
  // });


  /*
  const columns = [
    { 
      key: 'coffeeProduct', 
      label: 'Coffee Product',
      render: (value, row) => (
        <ClickableProductName onClick={() => handleProductClick(row)}>
          {value}
        </ClickableProductName>
      )
    },
    { key: 'greenCoffeePrice', label: 'Green Coffee Price' },
    { key: 'batchSize', label: 'Batch Size' },
    { key: 'weightLoss', label: 'Weight Loss %' },
    { key: 'postRoastCost', label: 'Post Roast Cost of 1kg' },
    { key: 'labelUnitPrice', label: 'Label Unit Price' },
    { key: 'packagingUnitPrice', label: 'Packaging Unit Price' },
    { key: 'packed1kgCost', label: 'Packed 1kg cost' },
    { key: 'packed200gCost', label: 'Packed 200g cost' },
    {
      key: 'retailPricing.200g.costPlusPricingMethod200gRetail',
      label: 'Retail 200g Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'retailPricing.200g.multiplier200gRetail', label: 'Retail 200g Multiplier', editable: true },
    { key: 'retailPricing.200g.discountPercentage200gRetail', label: 'Retail 200g Discount %', editable: true },
    { key: 'retailPricing.200g.retailPrice200g', label: 'Retail 200g Price', editable: true },
    {
      key: 'retailPricing.1kg.costPlusPricingMethod1kgRetail',
      label: 'Retail 1kg Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'retailPricing.1kg.multiplier1kgRetail', label: 'Retail 1kg Multiplier', editable: true },
    { key: 'retailPricing.1kg.discountPercentage1kgRetail', label: 'Retail 1kg Discount %', editable: true },
    { key: 'retailPricing.1kg.retailPrice1kg', label: 'Retail 1kg Price', editable: true },
    {
      key: 'wholesalePricing.200g.costPlusPricingMethod200gWholesale',
      label: 'Wholesale 200g Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'wholesalePricing.200g.multiplier200gWholesale', label: 'Wholesale 200g Multiplier', editable: true },
    { key: 'wholesalePricing.200g.discountPercentage200gWholesale', label: 'Wholesale 200g Discount %', editable: true },
    { key: 'wholesalePricing.200g.wholesalePrice200g', label: 'Wholesale 200g Price', editable: true },
    {
      key: 'wholesalePricing.1kg.costPlusPricingMethod1kgWholesale',
      label: 'Wholesale 1kg Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'wholesalePricing.1kg.multiplier1kgWholesale', label: 'Wholesale 1kg Multiplier', editable: true },
    { key: 'wholesalePricing.1kg.discountPercentage1kgWholesale', label: 'Wholesale 1kg Discount %', editable: true },
    { key: 'wholesalePricing.1kg.wholesalePrice1kg', label: 'Wholesale 1kg List Price', editable: true },
    {
      key: 'wholesalePricing.tier1.costPlusPricingMethodTier1Wholesale',
      label: 'Wholesale Tier 1 Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'wholesalePricing.tier1.multiplierTier1Wholesale', label: 'Wholesale Tier 1 Multiplier', editable: true },
    { key: 'wholesalePricing.tier1.discountPercentageTier1Wholesale', label: 'Wholesale Tier 1 Discount %', editable: true },
    { key: 'wholesalePricing.tier1.wholesalePriceTier1', label: 'Wholesale Price: Tier 1 (75KG+)', editable: true },
    {
      key: 'wholesalePricing.tier2.costPlusPricingMethodTier2Wholesale',
      label: 'Wholesale Tier 2 Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'wholesalePricing.tier2.multiplierTier2Wholesale', label: 'Wholesale Tier 2 Multiplier', editable: true },
    { key: 'wholesalePricing.tier2.discountPercentageTier2Wholesale', label: 'Wholesale Tier 2 Discount %', editable: true },
    { key: 'wholesalePricing.tier2.wholesalePriceTier2', label: 'Wholesale Price: Tier 2 (20-75kg)', editable: true },
    {
      key: 'wholesalePricing.tier3.costPlusPricingMethodTier3Wholesale',
      label: 'Wholesale Tier 3 Cost-plus Pricing',
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
        </StyledSelect>
      )
    },
    { key: 'wholesalePricing.tier3.multiplierTier3Wholesale', label: 'Wholesale Tier 3 Multiplier', editable: true },
    { key: 'wholesalePricing.tier3.discountPercentageTier3Wholesale', label: 'Wholesale Tier 3 Discount %', editable: true },
    { key: 'wholesalePricing.tier3.wholesalePriceTier3', label: 'Wholesale Price: Tier 3 (1-20kg)', editable: true },
  ];
  */

  const columns = [
    { 
      key: 'coffeeProduct', 
      label: 'Coffee Product',
      render: (value, row) => (
        <ClickableProductName onClick={() => handleProductClick(row)}>
          {row.coffeeProduct}
        </ClickableProductName>
      )
    },
    { key: 'greenCoffeePrice', label: 'Green Coffee Price' },
    { key: 'batchSize', label: 'Batch Size' },
    { key: 'weightLoss', label: 'Weight Loss %' },
    { key: 'postRoastCost', label: 'Post Roast Cost of 1kg' },
    { key: 'labelUnitPrice', label: 'Label Unit Price' },
    { key: 'packagingUnitPrice', label: 'Packaging Unit Price' },
    { key: 'packed1kgCost', label: 'Packed 1kg cost' },
    { key: 'packed200gCost', label: 'Packed 200g cost' },
    {
      key: 'retailPricing.200g.costPlusPricingMethod200gRetail',
      label: 'Retail 200g Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.retailPricing?.['200g']?.costPlusPricingMethod200gRetail,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'retailPricing.200g.multiplier200gRetail', 
      label: 'Retail 200g Multiplier', 
      editable: true,
      render: (value, row) => row.retailPricing?.['200g']?.multiplier200gRetail
    },
    { 
      key: 'retailPricing.200g.discountPercentage200gRetail', 
      label: 'Retail 200g Discount %', 
      editable: true,
      render: (value, row) => row.retailPricing?.['200g']?.discountPercentage200gRetail
    },
    { 
      key: 'retailPricing.200g.retailPrice200g', 
      label: 'Retail 200g Price', 
      editable: true,
      render: (value, row) => row.retailPricing?.['200g']?.retailPrice200g
    },
    {
      key: 'retailPricing.1kg.costPlusPricingMethod1kgRetail',
      label: 'Retail 1kg Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.retailPricing?.['1kg']?.costPlusPricingMethod1kgRetail,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'retailPricing.1kg.multiplier1kgRetail', 
      label: 'Retail 1kg Multiplier', 
      editable: true,
      render: (value, row) => row.retailPricing?.['1kg']?.multiplier1kgRetail
    },
    { 
      key: 'retailPricing.1kg.discountPercentage1kgRetail', 
      label: 'Retail 1kg Discount %', 
      editable: true,
      render: (value, row) => row.retailPricing?.['1kg']?.discountPercentage1kgRetail
    },
    { 
      key: 'retailPricing.1kg.retailPrice1kg', 
      label: 'Retail 1kg Price', 
      editable: true,
      render: (value, row) => row.retailPricing?.['1kg']?.retailPrice1kg
    },
    {
      key: 'wholesalePricing.200g.costPlusPricingMethod200gWholesale',
      label: 'Wholesale 200g Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.wholesalePricing?.['200g']?.costPlusPricingMethod200gWholesale,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'wholesalePricing.200g.multiplier200gWholesale', 
      label: 'Wholesale 200g Multiplier', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['200g']?.multiplier200gWholesale
    },
    { 
      key: 'wholesalePricing.200g.discountPercentage200gWholesale', 
      label: 'Wholesale 200g Discount %', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['200g']?.discountPercentage200gWholesale
    },
    { 
      key: 'wholesalePricing.200g.wholesalePrice200g', 
      label: 'Wholesale 200g Price', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['200g']?.wholesalePrice200g
    },
    {
      key: 'wholesalePricing.1kg.costPlusPricingMethod1kgWholesale',
      label: 'Wholesale 1kg Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.wholesalePricing?.['1kg']?.costPlusPricingMethod1kgWholesale,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'wholesalePricing.1kg.multiplier1kgWholesale', 
      label: 'Wholesale 1kg Multiplier', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['1kg']?.multiplier1kgWholesale
    },
    { 
      key: 'wholesalePricing.1kg.discountPercentage1kgWholesale', 
      label: 'Wholesale 1kg Discount %', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['1kg']?.discountPercentage1kgWholesale
    },
    { 
      key: 'wholesalePricing.1kg.wholesalePrice1kg', 
      label: 'Wholesale 1kg List Price', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.['1kg']?.wholesalePrice1kg
    },
    {
      key: 'wholesalePricing.tier1.costPlusPricingMethodTier1Wholesale',
      label: 'Wholesale Tier 1 Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier1?.costPlusPricingMethodTier1Wholesale,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'wholesalePricing.tier1.multiplierTier1Wholesale', 
      label: 'Wholesale Tier 1 Multiplier', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier1?.multiplierTier1Wholesale
    },
    { 
      key: 'wholesalePricing.tier1.discountPercentageTier1Wholesale', 
      label: 'Wholesale Tier 1 Discount %', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier1?.discountPercentageTier1Wholesale
    },
    { 
      key: 'wholesalePricing.tier1.wholesalePriceTier1', 
      label: 'Wholesale Price: Tier 1 (75KG+)', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier1?.wholesalePriceTier1
    },
    {
      key: 'wholesalePricing.tier2.costPlusPricingMethodTier2Wholesale',
      label: 'Wholesale Tier 2 Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier2?.costPlusPricingMethodTier2Wholesale,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'wholesalePricing.tier2.multiplierTier2Wholesale', 
      label: 'Wholesale Tier 2 Multiplier', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier2?.multiplierTier2Wholesale
    },
    { 
      key: 'wholesalePricing.tier2.discountPercentageTier2Wholesale', 
      label: 'Wholesale Tier 2 Discount %', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier2?.discountPercentageTier2Wholesale
    },
    { 
      key: 'wholesalePricing.tier2.wholesalePriceTier2', 
      label: 'Wholesale Price: Tier 2 (20-75kg)', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier2?.wholesalePriceTier2
    },
    {
      key: 'wholesalePricing.tier3.costPlusPricingMethodTier3Wholesale',
      label: 'Wholesale Tier 3 Cost-plus Pricing',
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier3?.costPlusPricingMethodTier3Wholesale,
      editor: ({ value, onChange }) => (
        <StyledSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
          <option value="Fixed Amount Markup">Fixed Amount Markup</option>
          <option value="Desired Profit Margin">Desired Profit Margin</option>
          <option value="Keystone Pricing (100% Markup)">Keystone Pricing (100% Markup)</option>
        </StyledSelect>
      )
    },
    { 
      key: 'wholesalePricing.tier3.multiplierTier3Wholesale', 
      label: 'Wholesale Tier 3 Multiplier', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier3?.multiplierTier3Wholesale
    },
    { 
      key: 'wholesalePricing.tier3.discountPercentageTier3Wholesale', 
      label: 'Wholesale Tier 3 Discount %', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier3?.discountPercentageTier3Wholesale
    },
    { 
      key: 'wholesalePricing.tier3.wholesalePriceTier3', 
      label: 'Wholesale Price: Tier 3 (1-20kg)', 
      editable: true,
      render: (value, row) => row.wholesalePricing?.tier3?.wholesalePriceTier3
    },
  ];
  
  const [visibleColumns, setVisibleColumns] = useState([
    "coffeeProduct", "greenCoffeePrice", "postRoastCost", "packed1kgCost", "packed200gCost",
    "retailPricing.200g.costPlusPricingMethod200gRetail",
    "retailPricing.200g.multiplier200gRetail",
    "retailPricing.200g.discountPercentage200gRetail", // Added
    "retailPricing.200g.retailPrice200g",
    "retailPricing.1kg.costPlusPricingMethod1kgRetail",
    "retailPricing.1kg.multiplier1kgRetail",
    "retailPricing.1kg.discountPercentage1kgRetail", // Added
    "retailPricing.1kg.retailPrice1kg",
    "wholesalePricing.200g.costPlusPricingMethod200gWholesale",
    "wholesalePricing.200g.multiplier200gWholesale",
    "wholesalePricing.200g.discountPercentage200gWholesale", // Added
    "wholesalePricing.200g.wholesalePrice200g",
    "wholesalePricing.1kg.costPlusPricingMethod1kgWholesale",
    "wholesalePricing.1kg.multiplier1kgWholesale",
    "wholesalePricing.1kg.discountPercentage1kgWholesale", // Added
    "wholesalePricing.1kg.wholesalePrice1kg",
    "wholesalePricing.tier1.costPlusPricingMethodTier1Wholesale",
    "wholesalePricing.tier1.multiplierTier1Wholesale",
    "wholesalePricing.tier1.discountPercentageTier1Wholesale", // Added
    "wholesalePricing.tier1.wholesalePriceTier1",
    "wholesalePricing.tier2.costPlusPricingMethodTier2Wholesale",
    "wholesalePricing.tier2.multiplierTier2Wholesale",
    "wholesalePricing.tier2.discountPercentageTier2Wholesale", // Added
    "wholesalePricing.tier2.wholesalePriceTier2",
    "wholesalePricing.tier3.costPlusPricingMethodTier3Wholesale",
    "wholesalePricing.tier3.multiplierTier3Wholesale",
    "wholesalePricing.tier3.discountPercentageTier3Wholesale", // Added
    "wholesalePricing.tier3.wholesalePriceTier3",
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
    'Retail 200g Cost-plus Pricing': { width: 200, isResizable: true },
    'Retail 200g Multiplier': { width: 80, isResizable: true },
    'Retail 200g Discount %': { width: 80, isResizable: true }, // Added
    'Retail 200g Price': { width: 90, isResizable: true },
    'Retail 1kg Cost-plus Pricing': { width: 200, isResizable: true },
    'Retail 1kg Multiplier': { width: 80, isResizable: true },
    'Retail 1kg Discount %': { width: 80, isResizable: true }, // Added
    'Retail 1kg Price': { width: 90, isResizable: true },
    'Wholesale 200g Cost-plus Pricing': { width: 200, isResizable: true },
    'Wholesale 200g Multiplier': { width: 120, isResizable: true },
    'Wholesale 200g Discount %': { width: 80, isResizable: true }, // Added
    'Wholesale 200g Price': { width: 120, isResizable: true },
    'Wholesale 1kg Cost-plus Pricing': { width: 200, isResizable: true },
    'Wholesale 1kg Multiplier': { width: 100, isResizable: true },
    'Wholesale 1kg Discount %': { width: 80, isResizable: true }, // Added
    'Wholesale 1kg List Price': { width: 120, isResizable: true },
    'Wholesale Tier 1 Cost-plus Pricing': { width: 200, isResizable: true },
    'Wholesale Tier 1 Multiplier': { width: 120, isResizable: true },
    'Wholesale Tier 1 Discount %': { width: 80, isResizable: true }, // Added
    'Wholesale Price: Tier 1 (75KG+)': { width: 120, isResizable: true },
    'Wholesale Tier 2 Cost-plus Pricing': { width: 200, isResizable: true },
    'Wholesale Tier 2 Multiplier': { width: 120, isResizable: true },
    'Wholesale Tier 2 Discount %': { width: 80, isResizable: true }, // Added
    'Wholesale Price: Tier 2 (20-75kg)': { width: 120, isResizable: true },
    'Wholesale Tier 3 Cost-plus Pricing': { width: 200, isResizable: true },
    'Wholesale Tier 3 Multiplier': { width: 120, isResizable: true },
    'Wholesale Tier 3 Discount %': { width: 80, isResizable: true }, // Added
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

  //////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////////

  /*
  // v.1
  // The debounced function is defined outside of this component to avoid re-creating it on every render
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
  */

  // v.3
  const debouncedUpdateBackend = debounce(async (payload, rowIndex, updatedData, setTableData) => {
    try {
      const response = await updateBackend(payload);
      if (response && response.data && response.data.data) {
        // Deep merge the response data with the existing row data
        updatedData[rowIndex] = deepMerge(updatedData[rowIndex], response.data.data);
        setTableData([...updatedData]);
      }
    } catch (error) {
      console.error(`Failed to update cell: ${error.message}`);
      // Revert the optimistic update
      setTableData(prevData => {
        const revertedData = [...prevData];
        revertedData[rowIndex] = { ...revertedData[rowIndex] };
        return revertedData;
      });
      // Optionally, show an error message to the user
      // showErrorToast('Failed to update data. Please try again.');
    }
  }, 300); // 300 ms delay
  
  // Helper function for deep merging objects
  function deepMerge(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';
    
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
  
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
  
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
  
    return target;
  }

  /*
  // v.1
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
  */

  /*
  // v.2
  const handleCellEdit = async (rowIndex, columnKey, value) => {
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
    const updatedData = [...tableData];
    const rowData = updatedData[rowIndex];
    
    // Update the specific field
    if (columnKey.includes('.')) {
      const [category, subCategory, field] = columnKey.split('.');
      rowData[category] = rowData[category] || {};
      rowData[category][subCategory] = rowData[category][subCategory] || {};
      rowData[category][subCategory][field] = value;
    } else {
      rowData[columnKey] = value;
    }
  
    // Optimistic update for immediate feedback
    setTableData([...updatedData]);
  
    const payload = { 
      id: rowData.id, 
      packed1kgCost: rowData.packed1kgCost,
      packed200gCost: rowData.packed200gCost,
    };
  
    // Add the updated field to the payload
    if (columnKey.includes('.')) {
      const [category, subCategory, field] = columnKey.split('.');
      payload[category] = payload[category] || {};
      payload[category][subCategory] = payload[category][subCategory] || {};
      payload[category][subCategory][field] = value;
    } else {
      payload[columnKey] = value;
    }
  
    // Handle cost-plus pricing method changes for all categories
    const pricingCategories = [
      { key: 'retailPricing.200g', method: 'costPlusPricingMethod200gRetail', multiplier: 'multiplier200gRetail' },
      { key: 'retailPricing.1kg', method: 'costPlusPricingMethod1kgRetail', multiplier: 'multiplier1kgRetail' },
      { key: 'wholesalePricing.200g', method: 'costPlusPricingMethod200gWholesale', multiplier: 'multiplier200gWholesale' },
      { key: 'wholesalePricing.1kg', method: 'costPlusPricingMethod1kgWholesale', multiplier: 'multiplier1kgWholesale' },
      { key: 'wholesalePricing.tier1', method: 'costPlusPricingMethodTier1Wholesale', multiplier: 'multiplierTier1Wholesale' },
      { key: 'wholesalePricing.tier2', method: 'costPlusPricingMethodTier2Wholesale', multiplier: 'multiplierTier2Wholesale' },
      { key: 'wholesalePricing.tier3', method: 'costPlusPricingMethodTier3Wholesale', multiplier: 'multiplierTier3Wholesale' },
    ];
  
    for (const category of pricingCategories) {
      if (columnKey === `${category.key}.${category.method}`) {
        let defaultMultiplier;
        switch (value) {
          case 'Fixed Percentage Markup':
          case 'Desired Profit Margin':
            defaultMultiplier = '0.20';
            break;
          case 'Fixed Amount Markup':
            defaultMultiplier = '5';
            break;
          case 'Keystone Pricing (100% Markup)':
            defaultMultiplier = '1';
            break;
          default:
            defaultMultiplier = '';
        }
        const [mainCategory, subCategory] = category.key.split('.');
        payload[mainCategory] = payload[mainCategory] || {};
        payload[mainCategory][subCategory] = payload[mainCategory][subCategory] || {};
        payload[mainCategory][subCategory][category.multiplier] = defaultMultiplier;
        payload.recalculatePricing = mainCategory;
        break;
      }
    }
  
    // Trigger recalculation for price or multiplier changes
    for (const category of pricingCategories) {
      const [mainCategory, subCategory] = category.key.split('.');
      const priceField = mainCategory === 'retailPricing' ? `retailPrice${subCategory}` : `wholesalePrice${subCategory}`;
      if (columnKey === `${category.key}.${priceField}` || columnKey === `${category.key}.${category.multiplier}`) {
        payload.recalculatePricing = mainCategory;
        break;
      }
    }
  
    // Use debounced function to handle backend updates
    debouncedUpdateBackend(payload, rowIndex, updatedData, setTableData);
  
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
  };
  */

  // v.3
  const handleCellEdit = async (rowIndex, columnKey, value) => {
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: true }));
    const updatedData = [...tableData];
    const rowData = updatedData[rowIndex];

    // Update the specific field
    const keys = columnKey.split('.');
    let current = rowData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  
    // Optimistic update for immediate feedback
    setTableData(updatedData);
  
    const payload = { 
      id: rowData.id, 
      [keys[0]]: rowData[keys[0]]  // This will include the entire nested object (e.g., retailPricing or wholesalePricing)
    };
  
    // Add the updated field to the payload
    if (columnKey.includes('.')) {
      const [category, subCategory, field] = columnKey.split('.');
      payload[category] = payload[category] || {};
      payload[category][subCategory] = payload[category][subCategory] || {};
      payload[category][subCategory][field] = value;
    } else {
      payload[columnKey] = value;
    }
  
    // Handle cost-plus pricing method changes for all categories
    const pricingCategories = [
      { key: 'retailPricing.200g', method: 'costPlusPricingMethod200gRetail', multiplier: 'multiplier200gRetail' },
      { key: 'retailPricing.1kg', method: 'costPlusPricingMethod1kgRetail', multiplier: 'multiplier1kgRetail' },
      { key: 'wholesalePricing.200g', method: 'costPlusPricingMethod200gWholesale', multiplier: 'multiplier200gWholesale' },
      { key: 'wholesalePricing.1kg', method: 'costPlusPricingMethod1kgWholesale', multiplier: 'multiplier1kgWholesale' },
      { key: 'wholesalePricing.tier1', method: 'costPlusPricingMethodTier1Wholesale', multiplier: 'multiplierTier1Wholesale' },
      { key: 'wholesalePricing.tier2', method: 'costPlusPricingMethodTier2Wholesale', multiplier: 'multiplierTier2Wholesale' },
      { key: 'wholesalePricing.tier3', method: 'costPlusPricingMethodTier3Wholesale', multiplier: 'multiplierTier3Wholesale' },
    ];
  
    for (const category of pricingCategories) {
      if (columnKey === `${category.key}.${category.method}`) {
        let defaultMultiplier;
        switch (value) {
          case 'Fixed Percentage Markup':
          case 'Desired Profit Margin':
            defaultMultiplier = '0.20';
            break;
          case 'Fixed Amount Markup':
            defaultMultiplier = '5';
            break;
          case 'Keystone Pricing (100% Markup)':
            defaultMultiplier = '1';
            break;
          default:
            defaultMultiplier = '';
        }
        const [mainCategory, subCategory] = category.key.split('.');
        payload[mainCategory] = payload[mainCategory] || {};
        payload[mainCategory][subCategory] = payload[mainCategory][subCategory] || {};
        payload[mainCategory][subCategory][category.multiplier] = defaultMultiplier;
        payload.recalculatePricing = mainCategory;
        break;
      }
    }
  
    // Trigger recalculation for price or multiplier changes
    for (const category of pricingCategories) {
      const [mainCategory, subCategory] = category.key.split('.');
      const priceField = mainCategory === 'retailPricing' ? `retailPrice${subCategory}` : `wholesalePrice${subCategory}`;
      if (columnKey === `${category.key}.${priceField}` || columnKey === `${category.key}.${category.multiplier}`) {
        payload.recalculatePricing = mainCategory;
        break;
      }
    }

    console.log('Payload sent to backend:', JSON.stringify(payload, null, 2));
  
    // Use debounced function to handle backend updates
    debouncedUpdateBackend(payload, rowIndex, updatedData, setTableData);
  
    setUpdatingCells(prev => ({ ...prev, [`${rowIndex}-${columnKey}`]: false }));
  };


  /*
  // v.1
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
  */

  // v.2
  const updateBackend = async (rowData) => {
    try {
      if (!rowData.id) {
        throw new Error('No ID provided for update');
      }
      const response = await axios.put(`/api/prices-calculator/${rowData.id}`, rowData);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data.data; // Return the updated row data
    } catch (error) {
      console.error('Error in updateBackend:', error.response ? error.response.data : error.message);
      
      // Provide more specific error messages
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  };

  /////////////////////////////////////

  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
    setSelectedProduct(product);
  };

  /*
  // v.3
  const handleSaveProduct = async (updatedProduct) => {
    try {
      console.log('handleSaveProduct called with:', updatedProduct);
      if (!updatedProduct.id) {
        throw new Error('Product ID is missing');
      }
      const response = await axios.put(`/api/prices-calculator/${updatedProduct.id}`, updatedProduct);
      console.log('API response:', response.data);
      if (response.data && response.data.data) {
        const updatedData = tableData.map(item => 
          item.id === updatedProduct.id ? response.data.data : item
        );
        setTableData(updatedData);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    }
  };
  */

  // v.4
  const handleSaveProduct = async (updatedProduct) => {
    try {
      console.log('handleSaveProduct called with:', updatedProduct);
      const response = await axios.put(`/api/prices-calculator/${updatedProduct.id}`, updatedProduct);
      if (response.data && response.data.data) {
        // Update the local state with the new data
        setTableData(prevData => prevData.map(item => 
          item.id === updatedProduct.id ? response.data.data : item
        ));
        // Close the edit form or show a success message
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // Show an error message to the user
    }
  };

  /////////////////////////////////////

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

  console.log('Rendering table with data:', sortedData);
  console.log('Visible columns:', visibleColumns);

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

                    {/* <tbody>
                      {sortedData.map((item, rowIndex) => {
                        console.log('Rendering row:', item);
                        return (
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
                            console.log('Rendering column:', columnKey, 'with value:', item[columnKey]);
                            return (
                              <Td key={columnKey} style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}>
                                {column.render ? column.render(item[columnKey], item) : column.editable ? (
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
                        );
                      })}
                    </tbody> */}

                    <tbody>
                      {sortedData.map((item, rowIndex) => {
                        console.log('Rendering row:', item);
                        return (
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
                              console.log('Rendering column:', columnKey, 'with value:', column.render ? column.render(null, item) : item[columnKey]);
                              return (
                                <Td key={columnKey} style={{ width: columnWidths[column.label] ? `${columnWidths[column.label].width}px` : 'auto' }}>
                                  {column.render ? column.render(null, item) : column.editable ? (
                                    <EditableCell
                                      value={column.render ? column.render(null, item) : item[columnKey]}
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
                        );
                      })}
                    </tbody>

                  </Table>
                </TableScrollContainer>
              )}
            </TableContainer>
          </TableContentContainer>
        </div>
      </ScrollableContent>
      {selectedProduct && (
        <EditProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={() => setSelectedProduct(null)}
        />
      )}
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
