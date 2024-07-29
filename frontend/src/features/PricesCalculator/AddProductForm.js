import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  StyledSelect,
  SubmitButton,
  ErrorMessage,
  SuccessMessage,
  SwitchContainer,
  Switch,
  SwitchLabel
} from './PricesCalculatorStyles';

const AddProductForm = ({ onProductAdded }) => {
  console.log('AddProductForm rendered');
  const [formData, setFormData] = useState({
    coffeeProduct: '',
    greenCoffeePrice: '',
    deliveryCost: '0.33',
    batchSize: '9.00',
    weightLoss: '16',
    labelUnitPrice: '0.30',
    packagingUnitPrice: '0.70',
    costPlusPricing: 'fixedPercentage',
    controller: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [inputUnit, setInputUnit] = useState('£/kg');
  const [outputUnit, setOutputUnit] = useState('£/kg');

  const [costPlusPricing, setCostPlusPricing] = useState('fixedPercentage');
  const [controller, setController] = useState('');

  const pricingMethodNames = {
    fixedPercentage: "Fixed Percentage Markup",
    fixedAmount: "Fixed Amount Markup",
    desiredProfit: "Desired Profit Margin",
    keystone: "Keystone Pricing (100% Markup)",
    tiered: "Tiered Markup Based on Cost"
  };

  useEffect(() => {
    console.log('AddProductForm mounted');
    return () => console.log('AddProductForm unmounted');
  }, []);
  
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);
  

  const handleCostPlusPricingChange = (e) => {
    const method = e.target.value;
    setCostPlusPricing(method);
    setFormData(prevData => ({
      ...prevData,
      costPlusPricing: method,
      controller: '', // Reset controller when method changes
    }));
  };

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'controller') {
      setController(value);
    }
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;
    Object.keys(formData).forEach((key) => {
        if (!formData[key]) {
        formErrors[key] = "This field is required";
        isValid = false;
        }
    });
    if (isNaN(parseFloat(formData.greenCoffeePrice))) {
        formErrors.greenCoffeePrice = "Please enter a valid number";
        isValid = false;
    }
    if (formData.weightLoss && (parseFloat(formData.weightLoss) < 0 || parseFloat(formData.weightLoss) > 100)) {
      formErrors.weightLoss = 'Weight Loss % must be between 0 and 100';
    }

    if (!formData.costPlusPricing) {
      formErrors.costPlusPricing = "Please select a pricing method";
    }
  
    if (formData.costPlusPricing !== 'keystone' && !formData.controller) {
      formErrors.controller = "This field is required";
    }
  
    if (formData.costPlusPricing === 'fixedPercentage' || formData.costPlusPricing === 'desiredProfit') {
      const controllerValue = parseFloat(formData.controller);
      if (isNaN(controllerValue) || controllerValue < 0 || controllerValue > 1) {
        formErrors.controller = "Value must be between 0 and 1";
      }
    }
  
    // if (formData.costPlusPricing === 'tiered') {
    //   const tiers = formData.controller.split(',');
    //   if (!tiers.every(tier => /^\d+:\d+(\.\d+)?$/.test(tier))) {
    //     formErrors.controller = "Invalid format. Use format like '50:0.4,100:0.3,0.2'";
    //   }
    // }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    if (validateForm()) {
      console.log('Form validated successfully');
      const convertedPrice = convertPrice(
        parseFloat(formData.greenCoffeePrice), // Ensure this is a number
        inputUnit,
        outputUnit
      );
      const dataToSend = {
        ...formData,
        weightLoss: parseFloat(formData.weightLoss),
        greenCoffeePrice: convertedPrice,
        deliveryCost: parseFloat(formData.deliveryCost),
        batchSize: parseFloat(formData.batchSize),
        labelUnitPrice: parseFloat(formData.labelUnitPrice),
        packagingUnitPrice: parseFloat(formData.packagingUnitPrice),
        costPlusPricing: pricingMethodNames[formData.costPlusPricing],
        controller: formData.controller,
      };
      try {
        console.log('Sending data to server:', dataToSend);
        const response = await axios.post('/api/prices-calculator/add-product', dataToSend);
        if (response.status === 201) {
          setSuccessMessage("Product added successfully!");
          resetFormWithDefaults();
          if (onProductAdded) onProductAdded();
        } else {
          console.log('Form validation failed', errors);
          setErrors({
            submit: `Failed to add product. Server responded with status: ${response.status}`,
          });
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setErrors({
            submit: `Error: ${
              error.response.data.message || "Failed to add product"
            }`,
          });
        } else if (error.request) {
          console.error('No response received');
          setErrors({
            submit: "No response received from server. Please try again.",
          });
        } else {
          console.error('Error message:', error.message);
          setErrors({ submit: `Error: ${error.message}` });
        }
      }
    }
  };

  const convertPrice = (price, from, to) => {
    console.log('Converting price:', price, 'from:', from, 'to:', to);
    const poundToKg = 2.20462;
    const usdToGbp = 0.79; // This should be updated regularly or fetched from an API

    // Convert price to a number
    let priceInPoundPerKg = parseFloat(price);

    // Check if the conversion was successful
    if (isNaN(priceInPoundPerKg)) {
      console.error("Invalid price input:", price);
      return "0.00"; // Return a default value or handle the error as appropriate
    }

    if (from === "$/lb") {
      priceInPoundPerKg = (priceInPoundPerKg / usdToGbp) * poundToKg;
    }

    if (to === "$/lb") {
      return ((priceInPoundPerKg * usdToGbp) / poundToKg).toFixed(2);
    }

    return priceInPoundPerKg.toFixed(2);
  };

  const resetFormWithDefaults = () => {
    setFormData({
      coffeeProduct: '',
      greenCoffeePrice: '',
      deliveryCost: '0.33',
      batchSize: '9.00',
      weightLoss: '16',
      labelUnitPrice: '0.30',
      packagingUnitPrice: '0.70'
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '300px', minWidth: '300px', minHeight: '100px' }}>
        <form onSubmit={handleSubmit}>
            <FormContainer onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="coffeeProduct">Coffee Product</Label>
                    <Input
                    type="text"
                    id="coffeeProduct"
                    name="coffeeProduct"
                    value={formData.coffeeProduct}
                    onChange={handleChange}
                    aria-invalid={errors.coffeeProduct ? "true" : "false"}
                    />
                    {errors.coffeeProduct && <ErrorMessage>{errors.coffeeProduct}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="greenCoffeePrice">Green Coffee Price</Label>
                    <Input
                    type="number"
                    id="greenCoffeePrice"
                    name="greenCoffeePrice"
                    value={formData.greenCoffeePrice}
                    onChange={handleChange}
                    aria-invalid={errors.greenCoffeePrice ? "true" : "false"}
                    />
                    {errors.greenCoffeePrice && <ErrorMessage>{errors.greenCoffeePrice}</ErrorMessage>}
                </FormGroup>

                <SwitchContainer>
                    <SwitchLabel>Input:</SwitchLabel>
                    <Switch
                    isOn={inputUnit === "$/lb"}
                    handleToggle={() =>
                        setInputUnit(inputUnit === "£/kg" ? "$/lb" : "£/kg")
                    }
                    />
                    <span>{inputUnit}</span>
                </SwitchContainer>

                <SwitchContainer>
                    <SwitchLabel>Convert to:</SwitchLabel>
                    <Switch
                    isOn={outputUnit === "$/lb"}
                    handleToggle={() =>
                        setOutputUnit(outputUnit === "£/kg" ? "$/lb" : "£/kg")
                    }
                    />
                    <span>{outputUnit}</span>
                </SwitchContainer>

                {/* Rest of the form fields */}
                <FormGroup>
                    <Label htmlFor="deliveryCost">Delivery Cost per 1kg</Label>
                    <Input
                    type="number"
                    id="deliveryCost"
                    name="deliveryCost"
                    value={formData.deliveryCost}
                    onChange={handleChange}
                    aria-invalid={errors.deliveryCost ? "true" : "false"}
                    />
                    {errors.deliveryCost && <ErrorMessage>{errors.deliveryCost}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                    type="number"
                    id="batchSize"
                    name="batchSize"
                    value={formData.batchSize}
                    onChange={handleChange}
                    aria-invalid={errors.batchSize ? "true" : "false"}
                    />
                    {errors.batchSize && <ErrorMessage>{errors.batchSize}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="weightLoss">Weight Loss %</Label>
                    <Input
                    type="number"
                    id="weightLoss"
                    name="weightLoss"
                    value={formData.weightLoss}
                    onChange={handleChange}
                    aria-invalid={errors.weightLoss ? "true" : "false"}
                    />
                    {errors.weightLoss && <ErrorMessage>{errors.weightLoss}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="labelUnitPrice">Label Unit Price</Label>
                    <Input
                    type="number"
                    id="labelUnitPrice"
                    name="labelUnitPrice"
                    value={formData.labelUnitPrice}
                    onChange={handleChange}
                    aria-invalid={errors.labelUnitPrice ? "true" : "false"}
                    />
                    {errors.labelUnitPrice && <ErrorMessage>{errors.labelUnitPrice}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="packagingUnitPrice">Packaging Unit Price</Label>
                    <Input
                    type="number"
                    id="packagingUnitPrice"
                    name="packagingUnitPrice"
                    value={formData.packagingUnitPrice}
                    onChange={handleChange}
                    aria-invalid={errors.packagingUnitPrice ? "true" : "false"}
                    />
                    {errors.packagingUnitPrice && <ErrorMessage>{errors.packagingUnitPrice}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label>Cost-plus Pricing Method</Label>
                  <StyledSelect
                    name="costPlusPricing"
                    value={costPlusPricing}
                    onChange={handleCostPlusPricingChange}
                  >
                    <option value="fixedPercentage">Fixed Percentage Markup</option>
                    <option value="fixedAmount">Fixed Amount Markup</option>
                    <option value="desiredProfit">Desired Profit Margin</option>
                    <option value="keystone">Keystone Pricing (100% Markup)</option>
                    {/* <option value="tiered">Tiered Markup Based on Cost</option> */}
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <Label>Controller</Label>
                  {costPlusPricing === 'fixedPercentage' || costPlusPricing === 'desiredProfit' ? (
                    <Input
                      type="number"
                      name="controller"
                      value={controller}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="1"
                    />
                  ) : costPlusPricing === 'fixedAmount' ? (
                    <Input
                      type="number"
                      name="controller"
                      value={controller}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <Input
                      type="text"
                      name="controller"
                      value="100% Markup"
                      readOnly
                    />
                  )}
                </FormGroup>

                <SubmitButton type="submit">Add Product</SubmitButton>
                {/* {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>} */}
            </FormContainer>
        </form>
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </div>
  );
};

export default AddProductForm;