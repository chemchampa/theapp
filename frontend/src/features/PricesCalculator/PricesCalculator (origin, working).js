import React, { useState } from 'react';
import axios from 'axios';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  SubmitButton,
  ErrorMessage,
  SuccessMessage,
  SwitchContainer,
  Switch,
  SwitchLabel
} from './PricesCalculatorStyles';
import { MainContent } from '../../components/GlobalStyle';

const PricesCalculator = () => {
  const [formData, setFormData] = useState({
    coffeeProduct: '',
    greenCoffeePrice: '',
    deliveryCost: '0.33',
    batchSize: '9.00',
    weightLoss: '16',
    labelUnitPrice: '0.30',
    packagingUnitPrice: '0.70'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [inputUnit, setInputUnit] = useState('£/kg');
  const [outputUnit, setOutputUnit] = useState('£/kg');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let formErrors = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        formErrors[key] = 'This field is required';
      }
    });
    
    if (formData.weightLoss && (parseFloat(formData.weightLoss) < 0 || parseFloat(formData.weightLoss) > 100)) {
      formErrors.weightLoss = 'Weight Loss % must be between 0 and 100';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const convertedPrice = convertPrice(
        formData.greenCoffeePrice,
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
      };
      try {
        const response = await axios.post('/api/prices-calculator/add-product', dataToSend);

        if (response.status === 201) {
          setSuccessMessage("Product added successfully!");
          resetFormWithDefaults(); // Use the new reset function here
        } else {
          setErrors({
            submit: `Failed to add product. Server responded with status: ${response.status}`,
          });
        }
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setErrors({
            submit: `Error: ${
              error.response.data.message || "Failed to add product"
            }`,
          });
        } else if (error.request) {
          // The request was made but no response was received
          setErrors({
            submit: "No response received from server. Please try again.",
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          setErrors({ submit: `Error: ${error.message}` });
        }
      }
    }
  };

  const convertPrice = (price, from, to) => {
    const poundToKg = 2.20462;
    const usdToGbp = 0.79; // This should be updated regularly or fetched from an API

    let priceInPoundPerKg = price;

    if (from === '$/lb') {
      priceInPoundPerKg = (price / usdToGbp) * poundToKg;
    }

    if (to === '$/lb') {
      return (priceInPoundPerKg * usdToGbp / poundToKg).toFixed(2);
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
    <MainContent>
      <h2>Add Product</h2>
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
          {errors.coffeeProduct && (
            <ErrorMessage>{errors.coffeeProduct}</ErrorMessage>
          )}
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
          {errors.greenCoffeePrice && (
            <ErrorMessage>{errors.greenCoffeePrice}</ErrorMessage>
          )}
        </FormGroup>

        <SwitchContainer>
          <SwitchLabel>Input:</SwitchLabel>
          <Switch
            isOn={inputUnit === "$/lb"}
            handleToggle={() =>
              setInputUnit(inputUnit === "£/kg" ? "$/lb" : "£/kg")
            }
          />
          <span style={{ fontSize: "14px", marginLeft: "5px" }}>
            {inputUnit}
          </span>
        </SwitchContainer>
        <SwitchContainer>
          <SwitchLabel>Convert to:</SwitchLabel>
          <Switch
            isOn={outputUnit === "$/lb"}
            handleToggle={() =>
              setOutputUnit(outputUnit === "£/kg" ? "$/lb" : "£/kg")
            }
          />
          <span style={{ fontSize: "14px", marginLeft: "5px" }}>
            {outputUnit}
          </span>
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
            step="0.01"
            aria-invalid={errors.deliveryCost ? "true" : "false"}
          />
          {errors.deliveryCost && (
            <ErrorMessage>{errors.deliveryCost}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="batchSize">Batch Size</Label>
          <Input
            type="number"
            id="batchSize"
            name="batchSize"
            value={formData.batchSize}
            onChange={handleChange}
            step="0.01"
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
          {errors.weightLoss && (
            <ErrorMessage>{errors.weightLoss}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="labelUnitPrice">Label Unit Price</Label>
          <Input
            type="number"
            id="labelUnitPrice"
            name="labelUnitPrice"
            value={formData.labelUnitPrice}
            onChange={handleChange}
            step="0.01"
            aria-invalid={errors.labelUnitPrice ? "true" : "false"}
          />
          {errors.labelUnitPrice && (
            <ErrorMessage>{errors.labelUnitPrice}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="packagingUnitPrice">Packaging Unit Price</Label>
          <Input
            type="number"
            id="packagingUnitPrice"
            name="packagingUnitPrice"
            value={formData.packagingUnitPrice}
            onChange={handleChange}
            step="0.01"
            aria-invalid={errors.packagingUnitPrice ? "true" : "false"}
          />
          {errors.packagingUnitPrice && (
            <ErrorMessage>{errors.packagingUnitPrice}</ErrorMessage>
          )}
        </FormGroup>

        <SubmitButton type="submit">Add Product</SubmitButton>
      </FormContainer>
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </MainContent>
  );
};

export default PricesCalculator;