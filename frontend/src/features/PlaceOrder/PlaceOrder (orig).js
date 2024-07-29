import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlaceOrderContainer, ProductListContainer, OrderAssemblyContainer, DraggableItemStyle } from './PlaceOrderStyles';
import { ErrorBoundary } from 'react-error-boundary';

const PlaceOrder = () => {
  console.log("PlaceOrder component rendering");
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    console.log('Fetching products...');
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log('Products updated:', products);
    if (products.length > 0) {
      console.log('First product:', products[0]);
    } else {
      console.log('Products array is empty');
    }
  }, [products]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    console.log("Starting fetchProducts");
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      console.log("Products fetched:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setIsLoading(false);
    console.log("Finished fetchProducts");
  };

  const onDragEnd = (result) => {
    console.log("Drag ended", result);
    if (!result.destination) {
      console.log("No destination");
      return;
    }
    
    const { source, destination } = result;
  
    console.log("Source:", source);
    console.log("Destination:", destination);
  
    if (source.droppableId === 'productList' && destination.droppableId === 'orderAssembly') {
      const draggedProduct = products[source.index];
      console.log("Dragged product:", draggedProduct);
      const newOrderItem = {
        product: draggedProduct,
        quantity: 1,
        bagSize: '',
        grindOption: ''
      };
      setOrderItems(prevItems => {
        console.log("Previous order items:", prevItems);
        const newItems = [...prevItems, newOrderItem];
        console.log("New order items:", newItems);
        return newItems;
      });
    }
  };

  const handleUpdateItem = (index, updatedItem) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index] = updatedItem;
    setOrderItems(newOrderItems);
  };

  const handleRemoveItem = (index) => {
    const newOrderItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newOrderItems);
  };

  const handleSubmitOrder = async () => {
    try {
      await axios.post('http://localhost:5000/api/orders', { orderItems });
      alert('Order submitted successfully!');
      setOrderItems([]);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  console.log("Current products state:", products);

  function ErrorFallback({error}) {
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
      </div>
    )
  }

  const OrderItem = ({ item, index, onUpdate, onRemove }) => (
    <Draggable draggableId={`order-item-${index}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <input
            type="text"
            value={item.product}
            readOnly
          />
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate({ ...item, quantity: e.target.value })}
          />
          <select
            value={item.bagSize}
            onChange={(e) => onUpdate({ ...item, bagSize: e.target.value })}
          >
            <option value="">Select Bag Size</option>
            <option value="200g">200g</option>
            <option value="1kg">1kg</option>
            <option value="4kg">4kg</option>
          </select>
          <select
            value={item.grindOption}
            onChange={(e) => onUpdate({ ...item, grindOption: e.target.value })}
          >
            <option value="">Select Grind Option</option>
            <option value="Whole Beans">Whole Beans</option>
            <option value="Espresso">Espresso</option>
            <option value="Filter">Filter</option>
          </select>
          <button onClick={onRemove}>Remove</button>
        </div>
      )}
    </Draggable>
  );

  

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PlaceOrderContainer>
        <h2>Place Order</h2>
        {isLoading ? (
          <p>Loading products...</p>
        ) : !isLoading && products.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <ProductListContainer>
              <Droppable droppableId="productList">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {memoizedProducts}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </ProductListContainer>
            <OrderAssemblyContainer>
              <Droppable droppableId="orderAssembly">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {orderItems.map((item, index) => (
                      <OrderItem
                        key={`order-item-${index}`}
                        item={item}
                        index={index}
                        onUpdate={(updatedItem) => handleUpdateItem(index, updatedItem)}
                        onRemove={() => handleRemoveItem(index)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <button onClick={handleSubmitOrder}>Submit Order</button>
            </OrderAssemblyContainer>
          </DragDropContext>
        ) : (
          <p>No products available</p>
        )}
      </PlaceOrderContainer>
    </ErrorBoundary>
  );
};

export default PlaceOrder;