import React, { useState, useCallback } from 'react';

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

//   console.log('Initial formData:', formData); // Log initial form data - 

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

  
  // v.24
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
      let method = pricingData[methodField] || 'Fixed Percentage Markup'; // Default method if undefined
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
      }
  
      price = calculatePrice(cost, method, multiplier);
      price = applyDiscount(price, discount);
      pricingData[`${category.toLowerCase()}Price${size}`] = price.toFixed(2);
  
      console.log('After calculation:', { cost, method, multiplier, discount, price: pricingData[`${category.toLowerCase()}Price${size}`] });
  
      return newData;
    });
  }, [calculatePrice, calculateMultiplier, applyDiscount]);



  // v.16 KEEP IT - working for everything except Tiers
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
  
  
  // v.1 KEEP IT - working for everything except Tiers
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


  // v.11 KEEP IT - working for everything except Tiers
  const calculatePacked1kgCost = useCallback((data) => {
    const greenCoffeePrice = parseFloat(data.greenCoffeePrice) || 0;
    const weightLoss = parseFloat(data.weightLoss) || 0;
    const deliveryCost = parseFloat(data.deliveryCost) || 0;
    const labelUnitPrice = parseFloat(data.labelUnitPrice) || 0;
    const packagingUnitPrice = parseFloat(data.packagingUnitPrice) || 0;
  
    // Calculate Post Roast Cost of 1kg
    const postRoastCost = (greenCoffeePrice / (1 - weightLoss / 100)) + deliveryCost;
  
    // Calculate Packed 1kg Cost
    const packed1kgCost = postRoastCost + labelUnitPrice + packagingUnitPrice;
  
    return packed1kgCost;
  }, []);



  // v.12
  const recalculateAllPrices = useCallback((data) => {
    ['Retail', 'Wholesale'].forEach(category => {
      ['200g', '1kg', 'Tier1', 'Tier2', 'Tier3'].forEach(size => {
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

  // v.12 KEEP IT - working for everything except Tiers
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


  ////////////////*  ▲ ▲ ▲ ▲ ▲ ▲  *////////////////

  // v.3
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('Form submission started');
    console.log('Form data being submitted:', formData);
    
    try {
      await onSave(formData);
      console.log('Form submitted successfully');
      // Close the form or navigate away here
      onCancel(); // Assuming onCancel is a prop that closes the form
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show an error message to the user
      alert('Failed to save the product. Please try again.');
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
                  { key: "Tier1", label: "1kg Tier 1 (75KG+)" },
                  { key: "Tier2", label: "1kg Tier 2 (20-75kg)" },
                  { key: "Tier3", label: "1kg Tier 3 (1-20kg)" },
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