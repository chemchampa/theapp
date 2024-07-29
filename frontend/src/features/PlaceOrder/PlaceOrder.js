import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEdit, FaSave } from 'react-icons/fa';
import {
  MainContainer,
  PlaceOrderContainer,
  OrderForm,
  FormGroup,
  Label,
  StyledInput,
  StyledSelect,
  ButtonGroup,
  OrderSummaryContainer,
  OrderSummary,
  OrderSummaryTable,
  SubmitOrderButton,
  IconButton,
} from './PlaceOrderStyles';

import {
  GlobalStyle,
  Th,
  Td,
  TableHeader,
  CustomerRow,
  ContentContainer,
  ActionButton,
  CustomScrollbar
} from '../../components/GlobalStyle';



const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'Coffee',
    product: '',
    quantity: '',
    bagSize: '',
    grindOption: ''
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // useEffect(() => {
  //   fetchProducts('Coffee');
  //   fetchCustomers();
  // }, []);

  useEffect(() => {
    console.log('Fetching products for:', currentItem.productType);
    fetchProducts(currentItem.productType);
    fetchCustomers();
  }, [currentItem.productType]);
  

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };  

  const fetchProducts = async (productType) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?type=${productType}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (index, field, value) => {
    if (index === 'current') {
      setCurrentItem(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setOrderItems(prev => {
        const newItems = [...prev];
        newItems[index] = {
          ...newItems[index],
          [field]: value
        };
        return newItems;
      });
    }
  };

  // const handleAddToOrder = () => {
  //   if (currentItem.product && currentItem.quantity && selectedCustomer) {
  //     setOrderItems(prev => [...prev, { ...currentItem, customer: selectedCustomer }]);
  //     setCurrentItem({
  //       productType: 'Coffee',
  //       product: '',
  //       quantity: '',
  //       bagSize: '',
  //       grindOption: ''
  //     });
  //     // Don't reset selectedCustomer here
  //   }
  // };

  const handleAddToOrder = () => {
    if (currentItem.product && currentItem.quantity && selectedCustomer) {
      const newItem = {
        ...currentItem,
        productType: currentItem.productType,
        customer: selectedCustomer,
        bagSize: currentItem.productType === 'Coffee' ? currentItem.bagSize : '',
        grindOption: currentItem.productType === 'Coffee' ? currentItem.grindOption : ''
      };
      setOrderItems(prev => [...prev, newItem]);
      setCurrentItem({
        productType: 'Coffee',
        product: '',
        quantity: '',
        bagSize: '',
        grindOption: ''
      });
    } else {
      alert('Please fill in all required fields before adding to order.');
    }
  };
  

  const removeOrderItem = (index) => {
    setOrderItems(prevItems => prevItems.filter((_, i) => i !== index));
  };  

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer before submitting the order.');
      return;
    }
  
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order before submitting.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/orders', { 
          orderItems, 
          customerName: selectedCustomer // Assuming we have a state variable for the selected customer
      });
      console.log('Order submission response:', response.data);
      alert(`Order submitted successfully! Order ID: ${response.data.orderId}`);
      setOrderItems([]);
      setSelectedCustomer(''); // Reset selected customer after submission
    } catch (error) {
      console.error('Error submitting order:', error.response ? error.response.data : error.message);
      alert(`Failed to submit order. Error: ${error.response ? error.response.data.error : error.message}`);
    }
  };


  const [editingIndex, setEditingIndex] = useState(-1);

  const handleEditItem = (index) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index) => {
    setEditingIndex(-1);
    // You might want to perform some validation here before saving
  };

  return (
    <>
      <GlobalStyle />
      <CustomScrollbar />
      <ContentContainer>
        <TableHeader>Place Order</TableHeader>
        <MainContainer>
          <PlaceOrderContainer>
            <OrderForm>
              <FormGroup>
                <Label>Customer</Label>
                <StyledSelect
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  disabled={orderItems.length > 0}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </StyledSelect>
              </FormGroup>
              <FormGroup>
                <Label>Product Type</Label>
                <StyledSelect
                  value={currentItem.productType}
                  onChange={(e) => handleInputChange('current', 'productType', e.target.value)}
                >
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                  <option value="Hot Chocolate">Hot Chocolate</option>
                  <option value="Retail Item">Retail Item</option>
                </StyledSelect>
              </FormGroup>
              <FormGroup>
                <Label>Product</Label>
                <StyledSelect
                  value={currentItem.product}
                  onChange={(e) => handleInputChange('current','product', e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </StyledSelect>
              </FormGroup>
              <FormGroup>
                <Label>Quantity</Label>
                <StyledInput
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => handleInputChange('current','quantity', e.target.value)}
                />
              </FormGroup>
              {currentItem.productType === 'Coffee' && (
                <>
                  <FormGroup>
                    <Label>Bag Size</Label>
                    <StyledSelect
                      value={currentItem.bagSize}
                      onChange={(e) => handleInputChange('current','bagSize', e.target.value)}
                    >
                      <option value="">Select Bag Size</option>
                      <option value="200g">200g</option>
                      <option value="1kg">1kg</option>
                      <option value="4kg">4kg</option>
                    </StyledSelect>
                  </FormGroup>
                  <FormGroup>
                    <Label>Grind Option</Label>
                    <StyledSelect
                      value={currentItem.grindOption}
                      onChange={(e) => handleInputChange('current','grindOption', e.target.value)}
                    >
                      <option value="">Select Grind Option</option>
                      <option value="Whole Beans">Whole Beans</option>
                      <option value="Espresso">Espresso</option>
                      <option value="Filter">Filter</option>
                    </StyledSelect>
                  </FormGroup>
                </>
              )}
            </OrderForm>
            <ButtonGroup>
              <ActionButton onClick={handleAddToOrder}>Add to Order</ActionButton>
            </ButtonGroup>
          </PlaceOrderContainer>
          <OrderSummaryContainer>  
            <OrderSummary>
              <TableHeader>
                Order Summary for:   {selectedCustomer && `${selectedCustomer}`}
              </TableHeader>
              <OrderSummaryTable>
                <thead>
                  <tr>
                    <Th>Product Type</Th>
                    <Th>Product</Th>
                    <Th>Quantity</Th>
                    <Th>Bag Size</Th>
                    <Th>Grind Option</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <CustomerRow key={index}>
                      <Td>
                        {editingIndex === index ? (
                          <StyledSelect
                            value={item.productType}
                            onChange={(e) => handleInputChange(index, 'productType', e.target.value)}
                          >
                            <option value="Coffee">Coffee</option>
                            <option value="Tea">Tea</option>
                            <option value="Hot Chocolate">Hot Chocolate</option>
                            <option value="Retail Item">Retail Item</option>
                          </StyledSelect>
                        ) : (
                          item.productType
                        )}
                      </Td>
                      <Td>
                        {editingIndex === index ? (
                          <StyledSelect
                            value={item.product}
                            onChange={(e) => handleInputChange(index, 'product', e.target.value)}
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product} value={product}>{product}</option>
                            ))}
                          </StyledSelect>
                        ) : (
                          item.product
                        )}
                      </Td>
                      <Td>
                        {editingIndex === index ? (
                          <StyledInput
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                          />
                        ) : (
                          item.quantity
                        )}
                      </Td>
                      <Td>
                        {editingIndex === index && item.productType === 'Coffee' ? (
                          <StyledSelect
                            value={item.bagSize}
                            onChange={(e) => handleInputChange(index, 'bagSize', e.target.value)}
                          >
                            <option value="">Select Bag Size</option>
                            <option value="200g">200g</option>
                            <option value="1kg">1kg</option>
                            <option value="4kg">4kg</option>
                          </StyledSelect>
                        ) : (
                          item.productType === 'Coffee' ? item.bagSize : '-'
                        )}
                      </Td>
                      <Td>
                        {editingIndex === index && item.productType === 'Coffee' ? (
                          <StyledSelect
                            value={item.grindOption}
                            onChange={(e) => handleInputChange(index, 'grindOption', e.target.value)}
                          >
                            <option value="">Select Grind Option</option>
                            <option value="Whole Beans">Whole Beans</option>
                            <option value="Espresso">Espresso</option>
                            <option value="Filter">Filter</option>
                          </StyledSelect>
                        ) : (
                          item.productType === 'Coffee' ? item.grindOption : '-'
                        )}
                      </Td>
                      <Td>
                        {editingIndex === index ? (
                          <IconButton onClick={() => handleSaveEdit(index)} title="Save">
                            <FaSave />
                          </IconButton>
                        ) : (
                          <>
                            <IconButton onClick={() => handleEditItem(index)} title="Edit">
                              <FaEdit />
                            </IconButton>
                            <IconButton onClick={() => removeOrderItem(index)} title="Remove">
                              <FaTrashAlt />
                            </IconButton>
                          </>
                        )}
                      </Td>
                    </CustomerRow>
                  ))}
                </tbody>
              </OrderSummaryTable>
              <SubmitOrderButton onClick={handleSubmitOrder}>Submit Order</SubmitOrderButton>
            </OrderSummary>
          </OrderSummaryContainer>
        </MainContainer>
      </ContentContainer>
    </>
  );
};

export default PlaceOrder;