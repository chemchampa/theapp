import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  Select,
  Checkbox,
  SubmitButton,
  CustomPricingArea,
  NestedDropdown,
  AddButton,
} from './CustomerFormStyles';

const CustomerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    mainCoffee: '',
    preferredPackagingSize: '',
    quantityEstimate: '',
    freshRoastOrRested: '',
    retailBags: false,
    orderType: '',
    orderingFrequency: '',
    roastDays: [],
    preferredDeliveryDays: [],
    orderingVia: '',
    notes: '',
    behaviourPatterns: '',
    status: 'Active',
    partOfPrep: false,
    prepQuantity: '',
    automaticOrdering: false,
    orderingCycleStartsOn: '',
    type: '',
    customPricing: false,
    customPrices: [],
  });

  const [coffees, setCoffees] = useState([]);

  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        const response = await axios.get('/api/coffees');
        setCoffees(response.data);
      } catch (error) {
        console.error('Error fetching coffee list:', error);
      }
    };

    fetchCoffees();
  }, []);
  
  const [bagSizes] = useState(['200g', '250g', '1kg', '4kg']);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCustomPriceChange = (index, field, value) => {
    const updatedPrices = [...formData.customPrices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setFormData(prevState => ({
      ...prevState,
      customPrices: updatedPrices
    }));
  };

  const addCustomPrice = () => {
    setFormData(prevState => ({
      ...prevState,
      customPrices: [...prevState.customPrices, { coffee: '', bagSize: '', price: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/whcustomer-details', formData);
      navigate('/wholesale-customers-details');
    } catch (error) {
      console.error('Error adding customer:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h2>Add New Customer</h2>
      
      <FormGroup>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          required
        />
      </FormGroup>


      <FormGroup>
        <Label>
          <Checkbox
            name="customPricing"
            checked={formData.customPricing}
            onChange={handleChange}
          />
          Custom Pricing?
        </Label>
      </FormGroup>

      {formData.customPricing && (
        <CustomPricingArea>
          {formData.customPrices.map((price, index) => (
            <NestedDropdown key={index}>
              <Select
                value={price.coffee}
                onChange={(e) => handleCustomPriceChange(index, 'coffee', e.target.value)}
              >
                <option value="">Select coffee</option>
                {coffees.map(coffee => (
                  <option key={coffee} value={coffee}>{coffee}</option>
                ))}
              </Select>
              <Select
                value={price.bagSize}
                onChange={(e) => handleCustomPriceChange(index, 'bagSize', e.target.value)}
              >
                <option value="">Select bag size</option>
                {bagSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </Select>
              <Input
                type="number"
                step="0.01"
                value={price.price}
                onChange={(e) => handleCustomPriceChange(index, 'price', e.target.value)}
                placeholder="Custom Price"
              />
            </NestedDropdown>
          ))}
          <AddButton type="button" onClick={addCustomPrice}>+</AddButton>
        </CustomPricingArea>
      )}

      <FormGroup>
        <Label htmlFor="contactName">Contact Name</Label>
        <Input
          type="text"
          id="contactName"
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input
          type="text"
          id="deliveryAddress"
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="mainCoffee">Main Coffee</Label>
        <Input
          type="text"
          id="mainCoffee"
          name="mainCoffee"
          value={formData.mainCoffee}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="preferredPackagingSize">Preferred Packaging Size</Label>
        <Select
          id="preferredPackagingSize"
          name="preferredPackagingSize"
          value={formData.preferredPackagingSize}
          onChange={handleChange}
        >
          <option value="">Select size</option>
          <option value="200g">200g</option>
          <option value="250g">250g</option>
          <option value="1kg">1kg</option>
          <option value="4kg">4kg</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="quantityEstimate">Quantity Estimate in KG</Label>
        <Input
          type="number"
          id="quantityEstimate"
          name="quantityEstimate"
          value={formData.quantityEstimate}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="freshRoastOrRested">Fresh Roast or Rested?</Label>
        <Select
          id="freshRoastOrRested"
          name="freshRoastOrRested"
          value={formData.freshRoastOrRested}
          onChange={handleChange}
        >
          <option value="">Select option</option>
          <option value="Fresh">Fresh</option>
          <option value="Rested">Rested</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>
          <Checkbox
            name="retailBags"
            checked={formData.retailBags}
            onChange={handleChange}
          />
          Any retail bags?
        </Label>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="orderType">Order Type</Label>
        <Select
          id="orderType"
          name="orderType"
          value={formData.orderType}
          onChange={handleChange}
        >
          <option value="">Select type</option>
          <option value="Upon Request">Upon Request</option>
          <option value="Standing Order (recurring)">Standing Order (recurring)</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="orderingFrequency">Ordering Frequency</Label>
        <Select
          id="orderingFrequency"
          name="orderingFrequency"
          value={formData.orderingFrequency}
          onChange={handleChange}
        >
          <option value="">Select frequency</option>
          <option value="Weekly">Weekly</option>
          <option value="Bi-weekly">Bi-weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Random">Random</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="roastDays">Roast Days</Label>
        <Select
          id="roastDays"
          name="roastDays"
          multiple
          value={formData.roastDays}
          onChange={handleMultiSelect}
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="preferredDeliveryDays">Preferred Delivery Days</Label>
        <Select
          id="preferredDeliveryDays"
          name="preferredDeliveryDays"
          multiple
          value={formData.preferredDeliveryDays}
          onChange={handleMultiSelect}
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="orderingVia">Ordering via</Label>
        <Select
          id="orderingVia"
          name="orderingVia"
          value={formData.orderingVia}
          onChange={handleChange}
        >
          <option value="">Select option</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Spreadsheets">Spreadsheets</option>
          <option value="Royal Mail webpage">Royal Mail webpage</option>
          <option value="Website Portal">Website Portal</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Input
          as="textarea"
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="behaviourPatterns">Behaviour patterns</Label>
        <Input
          as="textarea"
          id="behaviourPatterns"
          name="behaviourPatterns"
          value={formData.behaviourPatterns}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
          <option value="Prospect">Prospect</option>
          <option value="Lost">Lost</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>
          <Checkbox
            name="partOfPrep"
            checked={formData.partOfPrep}
            onChange={handleChange}
          />
          Part of Prep?
        </Label>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="prepQuantity">Prep Quantity, kg</Label>
        <Input
          type="number"
          id="prepQuantity"
          name="prepQuantity"
          value={formData.prepQuantity}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label>
          <Checkbox
            name="automaticOrdering"
            checked={formData.automaticOrdering}
            onChange={handleChange}
          />
          Automatic Ordering
        </Label>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="orderingCycleStartsOn">Dispatch only: Ordering Cycle Starts on</Label>
        <Input
          type="date"
          id="orderingCycleStartsOn"
          name="orderingCycleStartsOn"
          value={formData.orderingCycleStartsOn}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="type">Type</Label>
        <Input
          type="text"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        />
      </FormGroup>

      <SubmitButton type="submit">Create Customer</SubmitButton>
    </FormContainer>
  );
};

export default CustomerForm;
