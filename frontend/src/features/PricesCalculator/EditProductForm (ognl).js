import React, { useState, useCallback } from 'react';
import debounce from '../../utils/debounce';  // Ensure this utility exists

import {
    StyledInput,
    EditFormStyledInput,
    StyledSelect,
    FormGroupProduct,
    FormGroupPrices,
    EditProductFormLabel,
    SubmitButton,
    Overlay,
    EditFormContainer,
    FormTitle,
    ButtonGroup,
    FormLayout,
    Column,
    Section,
    SectionTitle,
    FormRow,
    RowLabel
} from './PricesCalculatorStyles';


const EditProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState(product);

  console.log('Initial formData:', formData); // Log initial form data - 

  ////////////////*  ▼ ▼ ▼  REAL-TIME CALCULATIONS AND RECALCULATIONS  ▼ ▼ ▼  *////////////////

  const calculatePrice = useCallback((cost, method, multiplier) => {
    cost = parseFloat(cost);
    multiplier = parseFloat(multiplier);
    
    console.log('calculatePrice inputs:', { cost, method, multiplier });
    if (isNaN(cost) || isNaN(multiplier) || !method) {
      console.error('Invalid inputs for calculatePrice:', { cost, method, multiplier });
      return 0;
    }
    switch (method) {
      case 'Fixed Percentage Markup':
        return cost * (1 + multiplier);
      case 'Fixed Amount Markup':
        return cost + multiplier;
      case 'Desired Profit Margin':
        return multiplier === 1 ? 0 : cost / (1 - multiplier);
      case 'Keystone Pricing':
        return cost * 2;
      default:
        console.error('Unknown pricing method:', method);
        return cost;
    }
  }, []);

  const calculateMultiplier = useCallback((cost, method, price) => {
    switch (method) {
      case 'Fixed Percentage Markup':
        return ((price / cost) - 1).toFixed(4);
      case 'Fixed Amount Markup':
        return (price - cost).toFixed(2);
      case 'Desired Profit Margin':
        return (1 - (cost / price)).toFixed(4);
      default:
        console.error('Unknown pricing method for multiplier calculation:', method);
        return 0;
    }
  }, []);

  /*
  // v.1
  const applyDiscount = useCallback((price, discount) => {
    console.log('applyDiscount inputs:', { price, discount });
    if (isNaN(price) || isNaN(discount)) {
      console.error('Invalid inputs for applyDiscount:', { price, discount });
      return 0;
    }
    return Math.max(0, price * (1 - (discount / 100)));
  }, []);
  */

  // v2
  const applyDiscount = useCallback((price, discount) => {
    price = parseFloat(price);
    discount = parseFloat(discount);
    console.log('applyDiscount inputs:', { price, discount });
    if (isNaN(price) || isNaN(discount)) {
      console.error('Invalid inputs for applyDiscount:', { price, discount });
      return 0;
    }
    return Math.max(0, price * (1 - (discount / 100)));
  }, []);
  

  
  /*
  // v.1
  const updatePricing = useCallback((category, size, field, value) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost;
      const method = pricingData[`costPlusPricingMethod${size}${category}`];
      const multiplier = pricingData[`multiplier${size}${category}`];
      const discount = pricingData[`discountPercentage${size}${category}`];
  
      if (field.includes('costPlusPricingMethod')) {
        pricingData[`multiplier${size}${category}`] = method === 'Fixed Amount Markup' ? '5' : '0.20';
        const price = calculatePrice(cost, method, pricingData[`multiplier${size}${category}`]);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes('multiplier')) {
        const price = calculatePrice(cost, method, value);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        pricingData[`multiplier${size}${category}`] = calculateMultiplier(cost, method, parseFloat(value));
      } else if (field.includes('discountPercentage')) {
        const price = calculatePrice(cost, method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, value).toFixed(2);
      }
  
      // Handle wholesale tier pricing
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierDiscount = tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */

  /*
  // v.2
  const updatePricing = useCallback((category, size, field, value) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost;
      const method = pricingData[`costPlusPricingMethod${size}${category}`];
      const multiplier = pricingData[`multiplier${size}${category}`];
      const discount = pricingData[`discountPercentage${size}${category}`];
  
      if (field.includes('costPlusPricingMethod')) {
        if (method === 'Keystone Pricing') {
          pricingData[`multiplier${size}${category}`] = '1';
        } else {
          pricingData[`multiplier${size}${category}`] = method === 'Fixed Amount Markup' ? '5' : '0.20';
        }
        const price = calculatePrice(parseFloat(cost), method, pricingData[`multiplier${size}${category}`]);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes('multiplier')) {
        const price = calculatePrice(parseFloat(cost), method, value);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        if (method !== 'Keystone Pricing') {
          pricingData[`multiplier${size}${category}`] = calculateMultiplier(parseFloat(cost), method, parseFloat(value));
        }
      } else if (field.includes('discountPercentage')) {
        const price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, value).toFixed(2);
      }
  
      // Handle wholesale tier pricing
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierDiscount = tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */

  /*
  // v.3
  const updatePricing = useCallback((category, size, field, value) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost;
      const method = pricingData[`costPlusPricingMethod${size}${category}`];
      let multiplier = pricingData[`multiplier${size}${category}`];
      let discount = pricingData[`discountPercentage${size}${category}`];
      let price = pricingData[`${category.toLowerCase()}Price${size}`];
  
      if (field.includes('costPlusPricingMethod')) {
        // If Cost-plus Pricing Method changes
        if (method === 'Keystone Pricing') {
          multiplier = '1';
        } else if (method === 'Fixed Amount Markup') {
          multiplier = '5';
        } else {
          multiplier = '0.20';
        }
        pricingData[`multiplier${size}${category}`] = multiplier;
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes('multiplier')) {
        // If multiplier changes
        price = calculatePrice(parseFloat(cost), method, value);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        // If price changes
        if (method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(parseFloat(cost), method, parseFloat(value));
          pricingData[`multiplier${size}${category}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        // If discount percentage changes
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, value).toFixed(2);
      }
  
      // Handle wholesale tier pricing if necessary
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierDiscount = tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */



    /*
  // v.5
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      // Check if the category and size exist in the data structure
      if (!newData[`${category}Pricing`] || !newData[`${category}Pricing`][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData; // Return unchanged data if invalid
      }
  
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost;
      const method = pricingData[`costPlusPricingMethod${size}${category}`] || '';
      let multiplier = pricingData[`multiplier${size}${category}`] || '0';
      let discount = pricingData[`discountPercentage${size}${category}`] || '0';
      let price = pricingData[`${category.toLowerCase()}Price${size}`] || '0';
  
      if (field.includes('costPlusPricingMethod')) {
        // If Cost-plus Pricing Method changes
        if (method === 'Keystone Pricing') {
          multiplier = '1';
        } else if (method === 'Fixed Amount Markup') {
          multiplier = '5';
        } else {
          multiplier = '0.20';
        }
        pricingData[`multiplier${size}${category}`] = multiplier;
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes('multiplier')) {
        // If multiplier changes
        price = calculatePrice(parseFloat(cost), method, value);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        // If price changes
        if (method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(parseFloat(cost), method, parseFloat(value));
          pricingData[`multiplier${size}${category}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        // If discount percentage changes
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, value).toFixed(2);
      }
  
      // Handle wholesale tier pricing if necessary
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierDiscount = tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */



  /*
  // v.6
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      // Check if the category and size exist in the data structure
      if (!newData[`${category}Pricing`] || !newData[`${category}Pricing`][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData; // Return unchanged data if invalid
      }
  
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost;
      const method = pricingData[`costPlusPricingMethod${size}${category}`];
      let multiplier = pricingData[`multiplier${size}${category}`];
      let discount = pricingData[`discountPercentage${size}${category}`];
      let price = pricingData[`${category.toLowerCase()}Price${size}`];
  
      if (field.includes('costPlusPricingMethod')) {
        if (method === 'Keystone Pricing') {
          multiplier = '1';
        } else if (method === 'Fixed Amount Markup') {
          multiplier = '5';
        } else {
          multiplier = '0.20';
        }
        pricingData[`multiplier${size}${category}`] = multiplier;
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes('multiplier')) {
        price = calculatePrice(parseFloat(cost), method, value);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        if (method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(parseFloat(cost), method, parseFloat(value));
          pricingData[`multiplier${size}${category}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        price = calculatePrice(parseFloat(cost), method, multiplier);
        pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, value).toFixed(2);
      }
  
      // Handle wholesale tier pricing if necessary
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierDiscount = tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */
 

  /*
  // v.7
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      if (!newData[`${category}Pricing`] || !newData[`${category}Pricing`][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData;
      }
  
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = parseFloat(size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost);
      const method = pricingData[`costPlusPricingMethod${size}${category}`];
      let multiplier = parseFloat(pricingData[`multiplier${size}${category}`]);
      let discount = parseFloat(pricingData[`discountPercentage${size}${category}`]);
      let price = parseFloat(pricingData[`${category.toLowerCase()}Price${size}`]);
  
      console.log('Before calculation:', { cost, method, multiplier, discount, price });
  
      if (field.includes('costPlusPricingMethod')) {
        if (method === 'Keystone Pricing') {
          multiplier = 1;
        } else if (method === 'Fixed Amount Markup') {
          multiplier = 5;
        } else {
          multiplier = 0.20;
        }
        pricingData[`multiplier${size}${category}`] = multiplier.toString();
        price = calculatePrice(cost, method, multiplier);
      } else if (field.includes('multiplier')) {
        multiplier = parseFloat(value);
        price = calculatePrice(cost, method, multiplier);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        price = parseFloat(value);
        if (method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(cost, method, price);
          pricingData[`multiplier${size}${category}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        discount = parseFloat(value);
        price = calculatePrice(cost, method, multiplier);
      }
  
      price = applyDiscount(price, discount);
      pricingData[`${category.toLowerCase()}Price${size}`] = price.toFixed(2);
  
      console.log('After calculation:', { cost, method, multiplier, discount, price });
  
      // Handle wholesale tier pricing if necessary
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`];
          const tierMultiplier = parseFloat(tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`]);
          const tierDiscount = parseFloat(tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`]);
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg);
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */

  /*
  // v.8
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      if (!newData[`${category}Pricing`] || !newData[`${category}Pricing`][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData;
      }
  
      const pricingData = newData[`${category}Pricing`][size];
      pricingData[field] = value;
  
      const cost = parseFloat(size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost);
      const method = pricingData[`costPlusPricingMethod${size}${category}`] || 'Fixed Percentage Markup'; // Default method
      let multiplier = parseFloat(pricingData[`multiplier${size}${category}`]) || 0;
      let discount = parseFloat(pricingData[`discountPercentage${size}${category}`]) || 0;
      let price = parseFloat(pricingData[`${category.toLowerCase()}Price${size}`]) || 0;
  
      console.log('Before calculation:', { cost, method, multiplier, discount, price });
  
      if (field.includes('costPlusPricingMethod')) {
        if (method === 'Keystone Pricing') {
          multiplier = 1;
        } else if (method === 'Fixed Amount Markup') {
          multiplier = 5;
        } else {
          multiplier = 0.20;
        }
        pricingData[`multiplier${size}${category}`] = multiplier.toString();
      } else if (field.includes('multiplier')) {
        multiplier = parseFloat(value);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        price = parseFloat(value);
        if (method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(cost, method, price);
          pricingData[`multiplier${size}${category}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        discount = parseFloat(value);
      }
  
      // Always recalculate the price
      price = calculatePrice(cost, method, multiplier);
      price = applyDiscount(price, discount);
      pricingData[`${category.toLowerCase()}Price${size}`] = price.toFixed(2);
  
      console.log('After calculation:', { cost, method, multiplier, discount, price });
  
      // Handle wholesale tier pricing if necessary
      if (category === 'Wholesale' && size === '1kg') {
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
          const tierData = newData.wholesalePricing[tier];
          const tierMethod = tierData[`costPlusPricingMethod${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`] || 'Fixed Percentage Markup';
          const tierMultiplier = parseFloat(tierData[`multiplier${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`]) || 0;
          const tierDiscount = parseFloat(tierData[`discountPercentage${tier.charAt(0).toUpperCase() + tier.slice(1)}Wholesale`]) || 0;
          
          const basePrice = parseFloat(pricingData.wholesalePrice1kg) || 0;
          const tierPrice = calculatePrice(basePrice, tierMethod, tierMultiplier);
          tierData[`wholesalePrice${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = applyDiscount(tierPrice, tierDiscount).toFixed(2);
        });
      }
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */

  /*
  // v.16
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      const pricingCategory = `${category.toLowerCase()}Pricing`;
      if (!newData[pricingCategory] || !newData[pricingCategory][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData;
      }
  
      const pricingData = newData[pricingCategory][size];
      console.log('Pricing data:', pricingData);
      pricingData[field] = value;
  
      const cost = parseFloat(size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost);
      const methodField = `costPlusPricingMethod${size}${category.charAt(0).toUpperCase() + category.slice(1)}`;
      console.log('Method field:', methodField);
      let method = pricingData[methodField];
      console.log('Retrieved method:', method);
  
      let multiplier = parseFloat(pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`]) || 0;
      let discount = parseFloat(pricingData[`discountPercentage${size}${category.charAt(0).toUpperCase() + category.slice(1)}`]) || 0;
      let price = parseFloat(pricingData[`${category.toLowerCase()}Price${size}`]) || 0;
  
      console.log('Before calculation:', { cost, method, multiplier, discount, price });
  
      if (field === methodField) {
        // If Cost-plus Pricing Method changes
        method = value;
        if (method === 'Keystone Pricing') {
          multiplier = 1;
        } else if (method === 'Fixed Amount Markup') {
          multiplier = 5;
        } else {
          multiplier = 0.20;
        }
        pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
      } else if (field.includes('multiplier')) {
        // If multiplier changes
        multiplier = parseFloat(value);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        // If price changes
        price = parseFloat(value);
        if (method && method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(cost, method, price);
          pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        // If discount percentage changes
        discount = parseFloat(value);
      }
  
      // Recalculate the price
      if (method) {
        let newPrice = calculatePrice(cost, method, multiplier);
        newPrice = applyDiscount(newPrice, discount);
        pricingData[`${category.toLowerCase()}Price${size}`] = newPrice.toFixed(2);
      } else {
        console.error('Pricing method is undefined');
      }
  
      console.log('After calculation:', { cost, method, multiplier, discount, price: pricingData[`${category.toLowerCase()}Price${size}`] });
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */


  /*
  // v.20
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      console.log('Previous data in updatePricing:', prevData);
      const newData = { ...prevData };
      
      const pricingCategory = `${category.toLowerCase()}Pricing`;
      if (!newData[pricingCategory] || !newData[pricingCategory][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData;
      }
  
      const pricingData = newData[pricingCategory][size];
      console.log('Pricing data:', pricingData);
      pricingData[field] = value;
  
      const cost = parseFloat(size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost);
      const methodField = `costPlusPricingMethod${size}${category.charAt(0).toUpperCase() + category.slice(1)}`;
      console.log('Method field:', methodField);
      let method = pricingData[methodField];
      console.log('Retrieved method:', method);
  
      let multiplier = Math.abs(parseFloat(pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`])) || 0;
      let discount = parseFloat(pricingData[`discountPercentage${size}${category.charAt(0).toUpperCase() + category.slice(1)}`]) || 0;
      let price = parseFloat(pricingData[`${category.toLowerCase()}Price${size}`]) || 0;
  
      console.log('Before calculation:', { cost, method, multiplier, discount, price });
  
      if (field === methodField) {
        method = value;
        if (method === 'Keystone Pricing') {
          multiplier = 1;
        } else if (method === 'Fixed Amount Markup') {
          multiplier = 5;
        } else {
          multiplier = 0.20;
        }
        pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
      } else if (field.includes('multiplier')) {
        multiplier = parseFloat(value);
      } else if (field.includes(`${category.toLowerCase()}Price`)) {
        price = parseFloat(value);
        if (method && method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(cost, method, price);
          pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
        }
      } else if (field.includes('discountPercentage')) {
        discount = parseFloat(value);
      }
  
      if (method) {
        let newPrice = parseFloat(calculatePrice(cost, method, multiplier));
        newPrice = applyDiscount(newPrice, discount);
        pricingData[`${category.toLowerCase()}Price${size}`] = newPrice.toFixed(2);
      } else {
        console.error('Pricing method is undefined');
      }
  
      console.log('After calculation:', { cost, method, multiplier, discount, price: pricingData[`${category.toLowerCase()}Price${size}`] });
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);
  */

  // v.22
  const updatePricing = useCallback((category, size, field, value) => {
    console.log('updatePricing called with:', category, size, field, value);
    
    setFormData(prevData => {
      const newData = { ...prevData };
      const pricingCategory = `${category.toLowerCase()}Pricing`;
      if (!newData[pricingCategory] || !newData[pricingCategory][size]) {
        console.error(`Invalid category or size: ${category}, ${size}`);
        return newData;
      }
  
      const pricingData = newData[pricingCategory][size];
      const cost = parseFloat(size === '200g' ? prevData.packed200gCost : prevData.packed1kgCost);
      const methodField = `costPlusPricingMethod${size}${category.charAt(0).toUpperCase() + category.slice(1)}`;
      let method = pricingData[methodField];
      let multiplier = Math.abs(parseFloat(pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`])) || 0;
      let discount = parseFloat(pricingData[`discountPercentage${size}${category.charAt(0).toUpperCase() + category.slice(1)}`]) || 0;
      let price = parseFloat(pricingData[`${category.toLowerCase()}Price${size}`]) || 0;
  
      console.log('Before calculation:', { cost, method, multiplier, discount, price });
  
      if (field.includes(`${category.toLowerCase()}Price`)) {
        price = parseFloat(value) || 0;
        if (method && method !== 'Keystone Pricing') {
          multiplier = calculateMultiplier(cost, method, price);
          pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
        }
      } else {
        pricingData[field] = value;
        if (field === methodField) {
          method = value;
          if (method === 'Keystone Pricing') {
            multiplier = 1;
          } else if (method === 'Fixed Amount Markup') {
            multiplier = 5;
          } else {
            multiplier = 0.20;
          }
          pricingData[`multiplier${size}${category.charAt(0).toUpperCase() + category.slice(1)}`] = multiplier.toString();
        } else if (field.includes('multiplier')) {
          multiplier = parseFloat(value) || 0;
        } else if (field.includes('discountPercentage')) {
          discount = parseFloat(value) || 0;
        }
        price = calculatePrice(cost, method, multiplier);
      }
  
      price = applyDiscount(price, discount);
      pricingData[`${category.toLowerCase()}Price${size}`] = price.toFixed(2);
  
      console.log('After calculation:', { cost, method, multiplier, discount, price: pricingData[`${category.toLowerCase()}Price${size}`] });
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);

  // v.23
  







  /*
  const debouncedUpdatePricing = useCallback((category, size, field, value) => {
    debounce((c, s, f, v) => updatePricing(c, s, f, v), 300)(category, size, field, value);
  }, [updatePricing]);
  */





  /*
  // v.2
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Basic validation
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      debouncedUpdatePricing(category, size, field, value);
    } else {
      setFormData(prevData => {
        const newData = { ...prevData, [name]: value };
        if (name === 'greenCoffeePrice' || name === 'weightLoss' || name === 'batchSize') {
          const packed1kgCost = calculatePacked1kgCost(newData);
          const packed200gCost = packed1kgCost / 5;
          newData.packed1kgCost = packed1kgCost.toFixed(2);
          newData.packed200gCost = packed200gCost.toFixed(2);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.3
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      debouncedUpdatePricing(category, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.4
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
        const newPacked1kgCost = calculatePacked1kgCost(newData);
        const newPacked200gCost = newPacked1kgCost / 5;
        newData.packed1kgCost = newPacked1kgCost.toFixed(2);
        newData.packed200gCost = newPacked200gCost.toFixed(2);
        recalculateAllPrices(newData);
      }
      return newData;
    });
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      debouncedUpdatePricing(category, size, field, value);
    }
  };
  */

  /*
  // v.5
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    setFormData(prevData => {
      let newData = { ...prevData, [name]: value };
  
      if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
        const packed1kgCost = calculatePacked1kgCost(newData);
        const packed200gCost = packed1kgCost / 5;
        newData.packed1kgCost = packed1kgCost.toFixed(2);
        newData.packed200gCost = packed200gCost.toFixed(2);
  
        ['Retail', 'Wholesale'].forEach(category => {
          ['200g', '1kg'].forEach(size => {
            if (newData[`${category}Pricing`] && newData[`${category}Pricing`][size]) {
              const pricingData = newData[`${category}Pricing`][size];
              const cost = size === '200g' ? newData.packed200gCost : newData.packed1kgCost;
              const method = pricingData[`costPlusPricingMethod${size}${category}`];
              const multiplier = pricingData[`multiplier${size}${category}`];
              const discount = pricingData[`discountPercentage${size}${category}`];
              const price = calculatePrice(parseFloat(cost), method, multiplier);
              pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
            }
          });
        });
      }
  
      return newData;
    });
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      debouncedUpdatePricing(category, size, field, value);
    }
  };
  */

  /*
  // v.6
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    setFormData(prevData => {
      let newData = { ...prevData, [name]: value };
  
      if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
        const packed1kgCost = calculatePacked1kgCost(newData);
        const packed200gCost = packed1kgCost / 5;
        newData.packed1kgCost = packed1kgCost.toFixed(2);
        newData.packed200gCost = packed200gCost.toFixed(2);
  
        ['Retail', 'Wholesale'].forEach(category => {
          ['200g', '1kg'].forEach(size => {
            if (newData[`${category}Pricing`] && newData[`${category}Pricing`][size]) {
              const pricingData = newData[`${category}Pricing`][size];
              const cost = size === '200g' ? newData.packed200gCost : newData.packed1kgCost;
              const method = pricingData[`costPlusPricingMethod${size}${category}`];
              const multiplier = pricingData[`multiplier${size}${category}`];
              const discount = pricingData[`discountPercentage${size}${category}`];
              const price = calculatePrice(parseFloat(cost), method, multiplier);
              pricingData[`${category.toLowerCase()}Price${size}`] = applyDiscount(price, discount).toFixed(2);
            }
          });
        });
      }
  
      return newData;
    });
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      debouncedUpdatePricing(category, size, field, value);
    }
  };
  */

  /*
  // v.7
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      updatePricing(category, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.8
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
    
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      if (category && size && field) {
        updatePricing(category, size, field, value);
      } else {
        console.error(`Invalid pricing field name: ${name}`);
      }
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.9
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const parts = name.split('.');
      let category, size, field;
      if (parts.length === 3) {
        [category, size, field] = parts;
      } else if (parts.length === 2) {
        category = parts[0].replace('Pricing', '');
        [size, field] = parts[1].split(/(?=[A-Z])/);
      }
      
      console.log('Parsed pricing field:', category, size, field);
  
      if (category && size && field) {
        updatePricing(category, size, field, value);
      } else {
        console.error(`Invalid pricing field name: ${name}`);
      }
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.10
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const parts = name.split('.');
      let category, size, field;
      if (parts.length === 3) {
        [category, size, field] = parts;
        category = category.replace('Pricing', '');
      } else if (parts.length === 2) {
        category = parts[0].replace('Pricing', '');
        [size, field] = parts[1].split(/(?=[A-Z])/);
      }
      
      console.log('Parsed pricing field:', category, size, field);
  
      if (category && size && field) {
        updatePricing(category, size, field, value);
      } else {
        console.error(`Invalid pricing field name: ${name}`);
      }
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.11
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (e.target.type === 'number' && isNaN(parseFloat(value))) {
      console.error(`Invalid number input for field: ${name}`);
      return;
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      const actualCategory = category.replace('Pricing', '');
      console.log('Parsed pricing field:', actualCategory, size, field);
      updatePricing(actualCategory, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.12
  const handleChange = (e) => {
    let { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (e.target.type === 'number') {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        value = parsedValue;
      } else {
        console.error(`Invalid number input for field: ${name}`);
        return;
      }
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      const actualCategory = category.replace('Pricing', '');
      console.log('Parsed pricing field:', actualCategory, size, field);
      updatePricing(actualCategory, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.13
  const handleChange = (e) => {
    let { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (e.target.type === 'number') {
      // Allow the input to be empty or a valid number
      if (value === '' || !isNaN(parseFloat(value))) {
        // The value is already a string, so we don't need to do anything
      } else {
        console.error(`Invalid number input for field: ${name}`);
        return;
      }
    }
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      const actualCategory = category.replace('Pricing', '');
      console.log('Parsed pricing field:', actualCategory, size, field);
      updatePricing(actualCategory, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.14
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    if (name.includes('Pricing')) {
      const [category, size, field] = name.split('.');
      const actualCategory = category.replace('Pricing', '');
      console.log('Parsed pricing field:', actualCategory, size, field);
      updatePricing(actualCategory, size, field, value);
    } else {
      setFormData(prevData => {
        let newData = { ...prevData, [name]: value };
        if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
          newData = updateCosts(newData);
          recalculateAllPrices(newData);
        }
        return newData;
      });
    }
  };
  */

  /*
  // v.15
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    setFormData(prevData => {
      let newData = { ...prevData, [name]: value };
  
      if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice'].includes(name)) {
        newData = updateCosts(newData);
        newData = recalculateAllPrices(newData);
      } else if (name.includes('Pricing')) {
        const [category, size, field] = name.split('.');
        const actualCategory = category.replace('Pricing', '');
        console.log('Parsed pricing field:', actualCategory, size, field);
        updatePricing(actualCategory, size, field, value);
      }
  
      return newData;
    });
  };
  */

  // v.16
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called with:', name, value);
  
    setFormData(prevData => {
      let newData = { ...prevData, [name]: value };
  
      if (['greenCoffeePrice', 'weightLoss', 'batchSize', 'labelUnitPrice', 'packagingUnitPrice', 'deliveryCost'].includes(name)) {
        newData = updateCosts(newData);
        newData = recalculateAllPrices(newData);
      } else if (name.includes('Pricing')) {
        const [category, size, field] = name.split('.');
        const actualCategory = category.replace('Pricing', '');
        console.log('Parsed pricing field:', actualCategory, size, field);
        updatePricing(actualCategory, size, field, value);
      }
  
      return newData;
    });
  };
  
  const handlePriceChange = (category, size, value) => {
    console.log('handlePriceChange called with:', category, size, value);
    const field = `${category.toLowerCase()}Price${size}`;
    setFormData(prevData => {
      const newData = { ...prevData };
      const pricingCategory = `${category.toLowerCase()}Pricing`;
      if (newData[pricingCategory] && newData[pricingCategory][size]) {
        newData[pricingCategory][size][field] = value;
      }
      return newData;
    });
  };


  const calculatePacked1kgCost = useCallback((data) => {
    const greenCoffeePrice = parseFloat(data.greenCoffeePrice);
    const weightLoss = parseFloat(data.weightLoss);
    const batchSize = parseFloat(data.batchSize);
    const labelUnitPrice = parseFloat(data.labelUnitPrice);
    const packagingUnitPrice = parseFloat(data.packagingUnitPrice);
  
    const roastedCoffeeYield = batchSize * (1 - weightLoss / 100);
    const greenCoffeeCostPer1kg = (greenCoffeePrice * batchSize) / roastedCoffeeYield;
    return greenCoffeeCostPer1kg + labelUnitPrice + packagingUnitPrice;
  }, []);


  /*
  // v.10
  const recalculateAllPrices = useCallback((data) => {
    ['Retail', 'Wholesale'].forEach(category => {
      ['200g', '1kg'].forEach(size => {
        if (data[`${category}Pricing`] && data[`${category}Pricing`][size]) {
          const cost = size === '200g' ? data.packed200gCost : data.packed1kgCost;
          if (cost) {
            updatePricing(category, size, 'cost', cost);
          }
        }
      });
    });
  }, [updatePricing]);
  */

  // v.12
  const recalculateAllPrices = useCallback((data) => {
    ['Retail', 'Wholesale'].forEach(category => {
      ['200g', '1kg', 'tier1', 'tier2', 'tier3'].forEach(size => {
        if (data[`${category.toLowerCase()}Pricing`] && data[`${category.toLowerCase()}Pricing`][size]) {
          const cost = size === '200g' ? data.packed200gCost : data.packed1kgCost;
          if (cost) {
            updatePricing(category, size, 'cost', cost);
          }
        }
      });
    });
    return data;
  }, [updatePricing]);

  /*
  // v.10
  const updateCosts = useCallback((newData) => {
    const packed1kgCost = calculatePacked1kgCost(newData);
    const packed200gCost = packed1kgCost / 5;
    return {
      ...newData,
      packed1kgCost: packed1kgCost.toFixed(2),
      packed200gCost: packed200gCost.toFixed(2)
    };
  }, [calculatePacked1kgCost]);
  */
  
  /*
  // v.11
  const updateCosts = useCallback((newData) => {
    // Calculate Post Roast Cost of 1kg
    const greenCoffeePrice = parseFloat(newData.greenCoffeePrice) || 0;
    const weightLoss = parseFloat(newData.weightLoss) || 0;
    const batchSize = parseFloat(newData.batchSize) || 1; // Avoid division by zero
    
    const roastedCoffeeYield = batchSize * (1 - weightLoss / 100);
    const postRoastCost = (greenCoffeePrice * batchSize) / roastedCoffeeYield;
  
    // Use the existing calculatePacked1kgCost function
    const packed1kgCost = calculatePacked1kgCost(newData);
    const packed200gCost = packed1kgCost / 5;
  
    return {
      ...newData,
      postRoastCost: postRoastCost.toFixed(2),
      packed1kgCost: packed1kgCost.toFixed(2),
      packed200gCost: packed200gCost.toFixed(2)
    };
  }, [calculatePacked1kgCost]);
  */

  // v.12
  const updateCosts = useCallback((newData) => {
    // Parse input values
    const greenCoffeePrice = parseFloat(newData.greenCoffeePrice) || 0;
    const weightLoss = parseFloat(newData.weightLoss) || 0;
    const deliveryCost = parseFloat(newData.deliveryCost) || 0;
  
    // Calculate Post Roast Cost of 1kg
    const postRoastCost = (greenCoffeePrice / (1 - weightLoss / 100)) + deliveryCost;
  
    // Use the existing calculatePacked1kgCost function
    const packed1kgCost = calculatePacked1kgCost(newData);
    const packed200gCost = packed1kgCost / 5;
  
    return {
      ...newData,
      postRoastCost: postRoastCost.toFixed(2),
      packed1kgCost: packed1kgCost.toFixed(2),
      packed200gCost: packed200gCost.toFixed(2)
    };
  }, [calculatePacked1kgCost]);



  /*
  // v.1
  useEffect(() => {
    if (formData && formData.retailPricing && formData.wholesalePricing) {
      const initialData = { ...formData };
      initialData.packed1kgCost = calculatePacked1kgCost(initialData).toFixed(2);
      initialData.packed200gCost = (parseFloat(initialData.packed1kgCost) / 5).toFixed(2);
      setFormData(initialData);
      recalculateAllPrices(initialData);
    }
  }, [formData, recalculateAllPrices, calculatePacked1kgCost]);
  */

  /*
  // v.3
  useEffect(() => {
    // Calculate new costs based on current formData
    const newPacked1kgCost = calculatePacked1kgCost(formData);
    const newPacked200gCost = newPacked1kgCost / 5;
    
    // Check if the new calculated costs are different from the current ones
    if (
      newPacked1kgCost.toFixed(2) !== formData.packed1kgCost ||
      newPacked200gCost.toFixed(2) !== formData.packed200gCost
    ) {
      // If they're different, update the formData with new costs
      setFormData(prevData => ({
        ...prevData,
        packed1kgCost: newPacked1kgCost.toFixed(2),
        packed200gCost: newPacked200gCost.toFixed(2)
      }));
    }
  }, [formData.greenCoffeePrice, formData.weightLoss, formData.batchSize, formData.labelUnitPrice, formData.packagingUnitPrice, calculatePacked1kgCost]);
  */



  ////////////////*  ▲ ▲ ▲ ▲ ▲ ▲  *////////////////

  // v.2
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('Form submission started');
    console.log('Form data being submitted:', formData);
    
    try {
      await onSave(formData);
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Overlay>
      <EditFormContainer>
        <FormTitle>Edit Product: {formData.coffeeProduct}</FormTitle>
        <form onSubmit={handleSubmit}>
          <FormLayout>
            <Column>
              <Section>
                <SectionTitle>Product</SectionTitle>
                <FormGroupProduct>
                  <EditProductFormLabel>Coffee Product</EditProductFormLabel>
                  <StyledInput
                    name="coffeeProduct"
                    value={formData.coffeeProduct}
                    onChange={handleChange}
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>Batch Size</EditProductFormLabel>
                  <StyledInput
                    name="batchSize"
                    value={formData.batchSize}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>Weight Loss %</EditProductFormLabel>
                  <StyledInput
                    name="weightLoss"
                    value={formData.weightLoss}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
              </Section>
              <Section>
                <SectionTitle>Costs</SectionTitle>
                <FormGroupProduct>
                  <EditProductFormLabel>Green Coffee Price</EditProductFormLabel>
                  <StyledInput
                    name="greenCoffeePrice"
                    value={formData.greenCoffeePrice}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>Delivery Cost per 1kg</EditProductFormLabel>
                  <StyledInput
                    name="deliveryCost"
                    value={formData.deliveryCost}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>Label Unit Price</EditProductFormLabel>
                  <StyledInput
                    name="labelUnitPrice"
                    value={formData.labelUnitPrice}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>Packaging Unit Price</EditProductFormLabel>
                  <StyledInput
                    name="packagingUnitPrice"
                    value={formData.packagingUnitPrice}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                    <EditProductFormLabel>Post Roast Cost of 1kg</EditProductFormLabel>
                    <StyledInput
                    value={formData.postRoastCost || ''}
                    readOnly
                    disabled
                    />
                </FormGroupProduct>
                <FormGroupProduct>
                    <EditProductFormLabel>Packed 1kg Cost</EditProductFormLabel>
                    <StyledInput
                    value={formData.packed1kgCost || ''}
                    readOnly
                    disabled
                    />
                </FormGroupProduct>
                <FormGroupProduct>
                    <EditProductFormLabel>Packed 200g Cost</EditProductFormLabel>
                    <StyledInput
                    value={formData.packed200gCost || ''}
                    readOnly
                    disabled
                    />
                </FormGroupProduct>
              </Section>
            </Column>
            <Column>
              <Section>
                <SectionTitle>Retail Pricing</SectionTitle>
                {["200g", "1kg"].map((type) => (
                  <FormRow key={type}>
                    <RowLabel>{type}:</RowLabel>
                    <FormGroupPrices>
                      <EditProductFormLabel>Cost-plus Pricing Method</EditProductFormLabel>
                      <StyledSelect
                        name={`retailPricing.${type}.costPlusPricingMethod${type}Retail`}
                        value={formData.retailPricing?.[type]?.[`costPlusPricingMethod${type}Retail`] || ""}
                        onChange={handleChange}
                      >
                        <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
                        <option value="Fixed Amount Markup">Fixed Amount Markup</option>
                        <option value="Desired Profit Margin">Desired Profit Margin</option>
                        <option value="Keystone Pricing">Keystone Pricing (100% Markup)</option>
                      </StyledSelect>
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Multiplier</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`retailPricing.${type}.multiplier${type}Retail`}
                        value={formData.retailPricing?.[type]?.[`multiplier${type}Retail`] || ""}
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Discount %</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`retailPricing.${type}.discountPercentage${type}Retail`}
                        value={formData.retailPricing?.[type]?.[`discountPercentage${type}Retail`] || ""}
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Retail {type} Price</EditProductFormLabel>
                      <StyledInput
                        name={`retailPricing.${type}.retailPrice${type}`}
                        value={formData.retailPricing?.[type]?.[`retailPrice${type}`] || ""}
                        onChange={(e) => handlePriceChange('retail', type, e.target.value)}
                        onBlur={() => updatePricing('retail', type, `retailPrice${type}`, formData.retailPricing?.[type]?.[`retailPrice${type}`])}
                        type="number"
                      />
                    </FormGroupPrices>
                  </FormRow>
                ))}
              </Section>
              <Section>
                <SectionTitle>Wholesale Pricing</SectionTitle>
                {[
                  { key: "200g", label: "200g" },
                  { key: "1kg", label: "1kg List" },
                  { key: "tier1", label: "1kg Tier 1 (75KG+)" },
                  { key: "tier2", label: "1kg Tier 2 (20-75kg)" },
                  { key: "tier3", label: "1kg Tier 3 (1-20kg)" },
                ].map((item) => (
                  <FormRow key={item.key}>
                    <RowLabel>{item.label}:</RowLabel>
                    <FormGroupPrices>
                      <EditProductFormLabel>Cost-plus Pricing Method</EditProductFormLabel>
                      <StyledSelect
                        name={`wholesalePricing.${item.key}.costPlusPricingMethod${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`}
                        value={formData.wholesalePricing?.[item.key]?.[`costPlusPricingMethod${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`] || ""}
                        onChange={handleChange}
                      >
                        <option value="Fixed Percentage Markup">Fixed Percentage Markup</option>
                        <option value="Fixed Amount Markup">Fixed Amount Markup</option>
                        <option value="Desired Profit Margin">Desired Profit Margin</option>
                        <option value="Keystone Pricing">Keystone Pricing (100% Markup)</option>
                      </StyledSelect>
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Multiplier</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`wholesalePricing.${item.key}.multiplier${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`}
                        value={formData.wholesalePricing?.[item.key]?.[`multiplier${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`] || ""}
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Discount %</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`wholesalePricing.${item.key}.discountPercentage${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`}
                        value={formData.wholesalePricing?.[item.key]?.[`discountPercentage${item.key === '200g' ? '200gWholesale' : item.key === '1kg' ? '1kgWholesale' : item.key.charAt(0).toUpperCase() + item.key.slice(1) + 'Wholesale'}`] || ""}
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>
                        {item.key === '200g'
                          ? "Wholesale 200g Price"
                          : item.key === '1kg'
                          ? "Wholesale List 1kg Price"
                          : `Wholesale ${item.label} Price`}
                      </EditProductFormLabel>
                      <StyledInput
                        name={`wholesalePricing.${item.key}.wholesalePrice${item.key === '200g' ? '200g' : item.key === '1kg' ? '1kg' : item.key.charAt(0).toUpperCase() + item.key.slice(1)}`}
                        value={formData.wholesalePricing?.[item.key]?.[`wholesalePrice${item.key === '200g' ? '200g' : item.key === '1kg' ? '1kg' : item.key.charAt(0).toUpperCase() + item.key.slice(1)}`] || ""}
                        onChange={(e) => handlePriceChange('wholesale', item.key, e.target.value)}
                        onBlur={() => updatePricing('wholesale', item.key, `wholesalePrice${item.key === '200g' ? '200g' : item.key === '1kg' ? '1kg' : item.key.charAt(0).toUpperCase() + item.key.slice(1)}`, formData.wholesalePricing?.[item.key]?.[`wholesalePrice${item.key === '200g' ? '200g' : item.key === '1kg' ? '1kg' : item.key.charAt(0).toUpperCase() + item.key.slice(1)}`])}
                        type="number"
                      />
                    </FormGroupPrices>
                  </FormRow>
                ))}
              </Section>
            </Column>
          </FormLayout>
          <ButtonGroup>
            <SubmitButton type="button" onClick={onCancel}>
              Cancel
            </SubmitButton>
            <SubmitButton type="submit">Save</SubmitButton>
          </ButtonGroup>
        </form>
      </EditFormContainer>
    </Overlay>
  );
};

export default EditProductForm;