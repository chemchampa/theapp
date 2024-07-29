const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { parse, isValid, format } = require('date-fns');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SETTINGS_SPREADSHEET_ID = process.env.SETTINGS_SPREADSHEET_ID;
const ORDERS_SPREADSHEET_ID = process.env.ORDERS_SPREADSHEET_ID;
const WHOLESALE_CUSTOMERS_SPREADSHEET_ID = process.env.WHOLESALE_CUSTOMERS_SPREADSHEET_ID;
const RETAIL_INVENTORY_SPREADSHEET_ID = process.env.RETAIL_INVENTORY_SPREADSHEET_ID;

// console.log('ORDERS_SPREADSHEET_ID:', ORDERS_SPREADSHEET_ID);
// console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
// console.log('SETTINGS_SPREADSHEET_ID:', SETTINGS_SPREADSHEET_ID);


async function getSpreadsheetIdForTenant(tenantId, spreadsheetType) {
  // This function should retrieve the correct spreadsheet ID for the given tenant and spreadsheet type
  
  // You'll need to implement the logic to store and retrieve these mappings
  // For now, we'll use a placeholder implementation
  switch (spreadsheetType) {
    case 'SETTINGS':
      return SETTINGS_SPREADSHEET_ID;
    case 'ORDERS':
      return ORDERS_SPREADSHEET_ID;
    case 'WHOLESALE_CUSTOMERS':
      return WHOLESALE_CUSTOMERS_SPREADSHEET_ID;
    case 'RETAIL_INVENTORY':
      return RETAIL_INVENTORY_SPREADSHEET_ID;
    case 'COFFEE_PRICES':
      return process.env.COFFEE_PRICES_SPREADSHEET_ID;
    default:
      throw new Error(`Invalid spreadsheet type: ${spreadsheetType}`);
  }
}


async function getAuthClient() {
    try {
        const auth = new GoogleAuth({
        scopes: SCOPES,
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS // Path to the service account key file
        });
        return auth.getClient();
    } catch (error) {
        console.error('Error getting auth client:', error);
        throw error;
    }
}

// Helper functions
function customSortBagSize(a, b) {
    const order = ["1kg", "200g", "3kg", "4kg"];
    return order.indexOf(a) - order.indexOf(b);
  }
  
function customSortGrindOption(a, b) {
    const order = ["Whole Beans", "Espresso", "Stovetop", "Aeropress", "Filter", "Cafetiere"];
    return order.indexOf(a) - order.indexOf(b);
}

function processData(sourceData, dateFilter) {
    console.log('Processing data for date:', dateFilter);
    console.log('Source data length:', sourceData.length);
  
    if (!Array.isArray(sourceData)) {
        console.error('Invalid sourceData:', sourceData);
        return [];
    }
    const filteredData = sourceData.filter(row => { 
        if (row.length < 10) {
          console.warn('Row has insufficient data:', row);
          return false;
        }
        
        // Parse the date from the spreadsheet (assuming it's in DD/MM/YYYY format)
        const orderDate = parse(row[7], 'dd/MM/yyyy', new Date());
        if (!isValid(orderDate)) {
            console.warn('Invalid date in row:', row);
            return false;
        }
        // Format both dates to ensure consistent comparison
        const formattedOrderDate = format(orderDate, 'dd/MM/yyyy');
        const formattedDateFilter = format(parse(dateFilter, 'dd/MM/yyyy', new Date()), 'dd/MM/yyyy');
        return formattedOrderDate === formattedDateFilter || row[9] === 'Open Order';
    });
  
    console.log('Filtered data length:', filteredData.length);
    return filteredData;
}


function prepareOutputData(filteredData) {
    const outputData = [];
    filteredData.forEach(row => {
        const customer = row[0];
        const orderID = row[5];
        const product = row[1];
        const qty = row[3];
        const bagSize = row[4];
        const grindOption = row[2];
        const lineItemTotal = (parseFloat(qty) * parseFloat(bagSize.replace('kg', '').replace('g', '') / 1000)).toFixed(2) + ' kg';
        
        outputData.push([
        customer,
        orderID,
        product,
        qty,
        bagSize,
        grindOption,
        lineItemTotal,
        row[9] // Order Status
        ]);
    });
    return outputData; 
}   


//////////////////////////////////////////////////////


// Main computation function
async function generatePickingList(dateFilter) {
    try {
      const authClient = await getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      // Fetch data from the "WO-Temp" sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ORDERS_SPREADSHEET_ID,
        range: 'Wholesale Orders!A5:M',
      });
  
      if (!response.data.values) {
          throw new Error('No data found in the spreadsheet');
      }
  
      const sourceData = response.data.values;
      console.log('Fetched data:', sourceData.length, 'rows');
  
      // Process the data
      // Use the dateFilter parameter instead of today's date
      const filteredData = processData(sourceData, dateFilter);
  
      // Prepare the output data
      const outputData = prepareOutputData(filteredData);
  
      return outputData;
    } catch (error) {
      console.error('Error generating picking list:', error);
      throw error;
    }
}

exports.getCustomers = async () => {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
            range: 'Wholesale Customers!A3:S',
        });

        const customers = response.data.values
            .filter(row => row[18] === 'Active') // Column S is index 18
            .map(row => row[1]) // Column B is index 1
            .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

        return customers;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

async function getWholesaleCustomersDetails() {
    try {
      const authClient = await getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        range: 'Wholesale Customers Details!A2:X', // Adjust this range as needed
      });
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in Wholesale Customers Details.');
        return [];
      }
  
      const customers = rows.map(row => ({
        ID: row[0],
        'Business Name': row[1],
        'Contact Name': row[2],
        'Email': row[3],
        'Phone': row[4],
        'Delivery Address': row[5],
        'Main Coffee': row[6],
        'Preferred Packaging Size': row[7],
        'Quantity Estimate in KG': row[8],
        'Fresh Roast or Rested?': row[9],
        'Any retail bags?': row[10],
        'Order Type': row[11],
        'Ordering Frequency': row[12],
        'Roast Days': row[13],
        'Preferred Delivery Days': row[14],
        'Ordering via': row[15],
        'Notes': row[16],
        'Behaviour patterns': row[17],
        'Status': row[18],
        'Part of Prep?': row[19],
        'Prep Quantity, kg': row[20],
        'Automatic Ordering': row[21],
        'Ordering Cycle Starts on': row[22],
        'Type': row[23]
      }));
  
      return customers;
    } catch (error) {
      console.error('Error fetching wholesale customers details:', error);
      throw error;
    }
}


exports.getProducts = async (productType) => {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        let spreadsheetId, range;

        switch (productType) {
            case 'Coffee':
                spreadsheetId = SETTINGS_SPREADSHEET_ID;
                range = 'Settings!A2:A';
                break;
            case 'Tea':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'Tea Inventory!A5:A';
                break;
            case 'Hot Chocolate':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'HotChoc Inventory!A5:A';
                break;
            case 'Retail Item':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'Retail Products Inventory!A5:A';
                break;
            default:
                spreadsheetId = SETTINGS_SPREADSHEET_ID;
                range = 'Settings!A2:A';
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        return response.data.values.flat();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

const generateOrderId = (lastOrderId) => {
    const prefix = "WHL-";
    let highestOrderNumber = 0;
  
    if (lastOrderId && lastOrderId.startsWith(prefix)) {
      highestOrderNumber = parseInt(lastOrderId.slice(prefix.length), 10);
    }
  
    const newOrderNumber = highestOrderNumber + 1;
    return prefix + ("000000" + newOrderNumber).slice(-6);
  };
  
const generateOrderDetailId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

exports.submitOrder = async (orderItems, customerName) => {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        // Get the last order ID
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ORDERS_SPREADSHEET_ID,
            range: 'WHOTest!F:F',
        });

        const lastOrderId = response.data.values ? response.data.values.pop()[0] : null;

        const newOrderId = generateOrderId(lastOrderId);
        
        const orderDate = new Date().toLocaleDateString('en-GB');               // DD/MM/YYYY format

        // Fetch customer pricing
        const customerPricing = await getCustomerPricing(customerName);
        console.log('Customer Pricing:', JSON.stringify(customerPricing, null, 2));
        
        const values = await Promise.all(orderItems.map(async (item) => {
            console.log('Processing item:', JSON.stringify(item, null, 2));
            const sku = await getSKU(item.product, item.productType);
            const lineItemPrice = calculateLineItemPrice(item, customerPricing);
            const totalRevenue = lineItemPrice * parseFloat(item.quantity);

            return [
                customerName,                                                   // Customer
                item.product,                                                   // Product
                item.productType === 'Coffee' ? item.grindOption : '',          // Grind Option
                item.quantity,                                                  // Quantity
                item.productType === 'Coffee' ? item.bagSize : '',              // Bag Size
                newOrderId,                                                     // Order ID
                generateOrderDetailId(),                                        // OrderDetail ID
                orderDate,                                                      // Order Date (in DD/MM/YYYY format)
                item.productType,                                               // Product Category
                "Unfulfilled",                                                  // Order Status
                `£${lineItemPrice.toFixed(2)}`,                                 // Line Item Price
                `£${totalRevenue.toFixed(2)}`,                                  // Total Revenue
                sku                                                             // SKU
            ];
        }));

        await sheets.spreadsheets.values.append({
            spreadsheetId: ORDERS_SPREADSHEET_ID,
            range: 'WHOTest!A:M', // Adjust sheet and/or range
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        return newOrderId;
    } catch (error) {
        console.error('Error submitting order:', error);
        throw error;
    }
};

//Generate a unique random 8-character ID for the new customer using uppercase letters and numbers
function generateID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// This function handles appending the full customer data to the "Wholesale Customers Details" sheet.
exports.appendCustomerToDetailsSheet = async (customerData) => {
    try {
        const sheets = google.sheets({
            version: "v4",
            auth: await getAuthClient(),
        });
        const detailsRange = "Wholesale Customers Details!A:X"; // Adjust based on your sheet structure
        
        //Fetch existing IDs from the sheet to check for uniqueness against existing IDs in that sheet.
        const existingData = await sheets.spreadsheets.values.get({
            spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
            range: "Wholesale Customers Details!A:A",
        });
        const existingIDs = existingData.data.values
            ? existingData.data.values.flat()
            : [];

        // Generate a unique ID
        let Id;
        do {
            Id = generateID();
        } while (existingIDs.includes(Id));

        // Preparing data for Wholesale Customers Details sheet
        const detailsValues  = [
            [
                Id, // New ID column
                customerData.businessName,
                customerData.contactName,
                customerData.email,
                customerData.phone,
                customerData.deliveryAddress,
                customerData.mainCoffee,
                customerData.preferredPackagingSize,
                customerData.quantityEstimate,
                customerData.freshRoastOrRested,
                customerData.retailBags ? "Yes" : "No",
                customerData.orderType,
                customerData.orderingFrequency,
                customerData.roastDays ? customerData.roastDays.join(", ") : "",
                customerData.preferredDeliveryDays
                    ? customerData.preferredDeliveryDays.join(", ")
                    : "",
                customerData.orderingVia,
                customerData.notes,
                customerData.behaviourPatterns,
                customerData.status,
                customerData.partOfPrep ? "Yes" : "No",
                customerData.prepQuantity,
                customerData.automaticOrdering ? "Yes" : "No",
                customerData.orderingCycleStartsOn,
                customerData.type,
            ],
        ];

        // Append to Wholesale Customers Details sheet
        const detailsResult = await sheets.spreadsheets.values.append({
            spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
            range: detailsRange,
            valueInputOption: 'USER_ENTERED',
            resource: { values: detailsValues },
        });
    
        // Append to Wholesale Customers Prices sheet
        const pricesResult = await exports.appendCustomerToPricesSheet({
            Id,
            businessName: customerData.businessName,
            status: customerData.status
        });
    
        return {
            detailsResult: detailsResult.data,
            pricesResult: pricesResult
        };

        // const result = await sheets.spreadsheets.values.append({
        //     spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        //     range: range,
        //     valueInputOption: "USER_ENTERED",
        //     resource: { values },
        // });

        // return result.data;
    } catch (error) {
        console.error("Error appending customer to sheet:", error);
        throw error;
    }
};

exports.getCoffeeList = async () => {
    try {
      const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
      const range = 'Settings!A2:A'; // New range in the Orders spreadsheet
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ORDERS_SPREADSHEET_ID, // Make sure to use the correct spreadsheet ID for Orders
        range: range,
      });
  
      const rows = response.data.values;
      if (!rows) {
        return [];
      }
  
      // Return the coffee names (first column)
      return rows.flat();
    } catch (error) {
      console.error('Error fetching coffee list:', error);
      throw error;
    }
};

// Finds the correct sheet ID for the "Wholesale Customers Prices" sheet.
// Some advanced operations, particularly those involving formatting or data validation (like adding dropdowns or checkboxes), require the specific sheet ID within the spreadsheet.
async function getSheetId() {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID
    });
    
    const sheet = response.data.sheets.find(s => s.properties.title === 'Wholesale Customers Prices');
    if (!sheet) {
      throw new Error('Sheet "Wholesale Customers Prices" not found');
    }
    return sheet.properties.sheetId;
}

// This function handles appending the customer ID, Business Name, and Status to the "Wholesale Customers Prices" sheet.
exports.appendCustomerToPricesSheet = async (customerData) => {
    try {
      const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
      const range = 'Wholesale Customers Prices!A:Z'; // Extend the range to cover more columns
      const sheetId = await getSheetId();
    
      // Prepare the values to be appended
      const values = [
        [
          customerData.Id,
          customerData.businessName,
          customerData.status
        ]
      ];
  
      // Append the initial data
      const appendResult = await sheets.spreadsheets.values.append({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });
  
      // Get the row number where the data was appended
      const updatedRange = appendResult.data.updates.updatedRange;
      const rowNumber = parseInt(updatedRange.split('!')[1].split(':')[0].replace(/\D/g, ''));
  
      // Prepare batch update requests
      const requests = [
        // Add data validation for the Status column (column C)
        {
          setDataValidation: {
            range: {
              sheetId: sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 2,
              endColumnIndex: 3
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Active' },
                  { userEnteredValue: 'Archived' },
                  { userEnteredValue: 'Prospect' },
                  { userEnteredValue: 'Lost' }
                ]
              },
              strict: true,
              showCustomUi: true
            }
          }
        }
      ];
  
      // Add checkboxes in every second column starting from Column D
      for (let i = 3; i < 26; i += 2) { // Assuming we go up to column Z
        requests.push({
          setDataValidation: {
            range: {
              sheetId: sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: i,
              endColumnIndex: i + 1
            },
            rule: {
              condition: {
                type: 'BOOLEAN'
              },
              showCustomUi: true
            }
          }
        });
      }
  
      // Execute the batch update
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        resource: {
          requests: requests
        }
      });
  
      return appendResult.data;
    } catch (error) {
      console.error('Error appending customer to prices sheet:', error);
      throw error;
    }
};

exports.setCustomPrices = async (customerData) => {
    try {
      const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
      const range = 'Wholesale Customers Prices!A:Z'; // Adjust as needed
  
      // Find the row for the new customer
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        range: range,
      });
  
      const rows = response.data.values;
      const customerRow = rows.findIndex(row => row[0] === customerData.Id);
  
      if (customerRow === -1) {
        throw new Error('Customer not found in prices sheet');
      }
  
      // Prepare updates for custom prices and checkboxes
      const updates = customerData.customPrices.map(price => {
        const columnIndex = findColumnIndex(rows[0], price.coffee, price.bagSize);
        return {
          range: `Wholesale Customers Prices!${columnToLetter(columnIndex)}${customerRow + 1}`,
          values: [[price.price]]
        };
      });
  
      // Set checkboxes
      const checkboxUpdates = customerData.customPrices.map(price => {
        const columnIndex = findColumnIndex(rows[0], price.coffee, price.bagSize) - 1; // Checkbox column
        return {
          range: `Wholesale Customers Prices!${columnToLetter(columnIndex)}${customerRow + 1}`,
          values: [[true]]
        };
      });
  
      // Batch update
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: [...updates, ...checkboxUpdates],
        },
      });
  
      return { message: 'Custom prices set successfully' };
    } catch (error) {
      console.error('Error setting custom prices:', error);
      throw error;
    }
  };
  
  function findColumnIndex(headerRow, coffee, bagSize) {
    return headerRow.findIndex(cell => cell.includes(coffee) && cell.includes(bagSize));
  }
  
  function columnToLetter(column) {
    let temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
}

async function getCustomerPricing(customerName) {  // This function is for the "Place Order" function only 
    // Here's logic to fetch customer pricing from the "Wholesale Customers" sheet
    // This should return an object with product prices for the specific customer
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
            range: 'Wholesale Customers!A:DD', // Adjust this range as needed
        });

        const rows = response.data.values;
        const headerRow = rows[0]; // The first row contains headers
        const bagSizesRow = rows[1];

        const customerRowNumber = findCustomerRow(rows, customerName);
        if (customerRowNumber === -1) {
            throw new Error(`Customer ${customerName} not found`);
        }

        const customerRow = rows[customerRowNumber];
        console.log('Customer Row:', JSON.stringify(customerRow, null, 2));

        const pricing = {};
        const productDataStartColumnIndex = 24; // Column Y is the 25th column (0-indexed)

        for (let colIndex = productDataStartColumnIndex; colIndex < headerRow.length; colIndex += 6) {
            const product = headerRow[colIndex + 1]; // Product name is in the second column of each block
            if (product && product.trim() !== '') {
                pricing[product] = {
                    [bagSizesRow[colIndex + 1]]: parseFloat(customerRow[colIndex + 1].replace('£', '')) || null,
                    [bagSizesRow[colIndex + 3]]: parseFloat(customerRow[colIndex + 3].replace('£', '')) || null,
                    [bagSizesRow[colIndex + 5]]: parseFloat(customerRow[colIndex + 5].replace('£', '')) || null
                };
            }
        }

        console.log('Pricing:', JSON.stringify(pricing, null, 2));
        return pricing;
    } catch (error) {
        console.error('Error fetching customer pricing:', error);
        throw error;
    }
}

async function getWholesaleCustomersPrices() {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
            range: 'Wholesale Customers Prices!A1:CO', // Adjust if you have more columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found in Wholesale Customers Prices.');
            return { customers: [], productColumns: [] };
        }

        const headerRow = rows[0]; // Coffee names
        const sizeRow = rows[1]; // Bag sizes

        // Extract product columns
        const productColumns = [];
        for (let i = 4; i < headerRow.length; i += 3) {
            const coffeeName = headerRow[i];
            if (coffeeName) {
                productColumns.push(`${coffeeName} ${sizeRow[i]}`);
                productColumns.push(`${coffeeName} ${sizeRow[i+2]}`);
                productColumns.push(`${coffeeName} ${sizeRow[i+4]}`);
            }
        }

        const customers = rows.slice(2).map(row => {
            const customer = {
                ID: row[0],
                'Business Name': row[1],
                'Status': row[2]
            };
            
            for (let i = 4; i < headerRow.length; i += 3) {
                const coffeeName = headerRow[i];
                if (coffeeName) {
                    customer[`${coffeeName} ${sizeRow[i]}`] = row[i];
                    customer[`${coffeeName} ${sizeRow[i+2]}`] = row[i+2];
                    customer[`${coffeeName} ${sizeRow[i+4]}`] = row[i+4];
                }
            }
            return customer;
        });

        return { customers, productColumns };
    } catch (error) {
        console.error('Error fetching wholesale customers prices:', error);
        throw error;
    }
}

async function updateCustomerPrice(customerId, column, newValue) {
    try {
      const authClient = await getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        range: 'Wholesale Customers Prices!A1:CO',
      });
  
      const rows = response.data.values;
      const headerRow = rows[0]; // Coffee names
      const sizeRow = rows[1];   // Bag sizes
  
      const customerRowIndex = rows.findIndex(row => row[0] === customerId);
  
      // Find the column index
      let columnIndex = -1;
      if (column === 'Status') {
        columnIndex = 2; // Status is the third column (index 2)
      } else {
        for (let i = 4; i < headerRow.length; i += 3) {
          const coffeeName = headerRow[i];
          if (coffeeName) {
            if (`${coffeeName} ${sizeRow[i]}` === column) {
              columnIndex = i;
              break;
            }
            if (`${coffeeName} ${sizeRow[i+2]}` === column) {
              columnIndex = i + 2;
              break;
            }
            if (`${coffeeName} ${sizeRow[i+4]}` === column) {
              columnIndex = i + 4;
              break;
            }
          }
        }
      }
  
      console.log('Customer ID:', customerId);
      console.log('Column:', column);
      console.log('New Value:', newValue);
      console.log('Customer Row Index:', customerRowIndex);
      console.log('Column Index:', columnIndex);
  
      if (customerRowIndex === -1 || columnIndex === -1) {
        throw new Error(`Customer or column not found. Customer Row: ${customerRowIndex}, Column: ${columnIndex}`);
      }
  
      await sheets.spreadsheets.values.update({
        spreadsheetId: WHOLESALE_CUSTOMERS_SPREADSHEET_ID,
        range: `Wholesale Customers Prices!${String.fromCharCode(65 + columnIndex)}${customerRowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[newValue]]
        }
      });
  
      console.log('Update successful');
  
    } catch (error) {
      console.error('Error updating customer price:', error);
      throw error;
    }
}

exports.getRoastedCoffeePrices = async () => {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: 'Coffee Prices!A3:X',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map(row => ({
      SKU: row[0],
      'Coffee Product': row[1],
      Components: row[2],
      'Product Category': row[3],
      Status: row[4],
      'Cost 200g': row[5],
      'Cost 1kg': row[6],
      'Cost 4kg': row[7],
      'Retail 200g': {
        Price: row[8],
        Profit: row[9],
        'Profit Margin': row[10]
      },
      'Retail 1kg': {
        Price: row[11],
        Profit: row[12],
        'Profit Margin': row[13]
      },
      'Wholesale 200g': {
        Price: row[14],
        Profit: row[15],
        'Profit Margin': row[16]
      },
      'Wholesale 1kg': {
        Price: row[17],
        Profit: row[18],
        'Profit Margin': row[19]
      },
      'Wholesale 4kg': {
        Price: row[20],
        Profit: row[21],
        'Profit Margin': row[22]
      },
      'Include In Clusters': row[23] === 'TRUE'
    }));
  } catch (error) {
    console.error('Error fetching roasted coffee prices:', error);
    throw error;
  }
};

function findCustomerRow(rows, customerName) {
    for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][1]).trim().toLowerCase() === customerName.trim().toLowerCase()) {
            return i;
        }
    }
    return -1; // Customer not found
}

function calculateLineItemPrice(item, customerPricing) {
    // Here's logic to calculate the line item price based on the customer pricing
    // and the specific product, bag size, etc.
    const { product, bagSize, quantity, productType } = item;
    console.log(`Calculating price for: ${product}, ${bagSize}, ${quantity}`);
    console.log('Customer Pricing:', JSON.stringify(customerPricing, null, 2));

    if (!customerPricing[product]) {
        console.warn(`Pricing not found for product: ${product}`);
        return 0;
    }
    let price;
    if (productType === 'Coffee') {
        price = customerPricing[product][bagSize];
    } else {
        // For non-coffee products, assume a single price
        price = customerPricing[product]['default'] || 0;
    }
    if (price === null || isNaN(price)) {
        console.warn(`Invalid price for ${product}`);
        return 0;
    }
    return price * parseFloat(quantity);
}

async function getSKU(productName, productType) {
    console.log(`Getting SKU for product: ${productName}, type: ${productType}`);
    // Here's logic to fetch the SKU for a given product name from the "Settings" sheet
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        let spreadsheetId, range;

        switch (productType) {
            case 'Coffee':
                spreadsheetId = SETTINGS_SPREADSHEET_ID;
                range = 'Settings!A:B';
                break;
            case 'Tea':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'Tea Inventory!A5:B';
                break;
            case 'Hot Chocolate':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'HotChoc Inventory!A5:B';
                break;
            case 'Retail Item':
                spreadsheetId = RETAIL_INVENTORY_SPREADSHEET_ID;
                range = 'Retail Products Inventory!A5:B';
                break;
            default:
                throw new Error(`Invalid product type: ${productType}`);
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const rows = response.data.values;
        console.log(`Searching for product: ${productName} in ${productType} inventory`);
        console.log(`Available products: ${rows.map(row => row[0]).join(', ')}`);

        const productRow = rows.find(row => row[0].toLowerCase().includes(productName.toLowerCase()));

        if (!productRow) {
            throw new Error(`Product ${productName} not found in ${productType} inventory`);
        }

        return productRow[1]; // SKU is in the second column of our fetched ranges
    } catch (error) {
        console.error('Error fetching SKU:', error);
        throw error;
    }
}

/*
  With this approach the product data is inserted into the correct columns at the beginning,
  any columns not filled by product data are left empty, and the ID is always placed in the last column (U).
*/
async function appendProductToPricesCalculator(productData) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // First, get the current data to determine the next row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: 'Prices Calculator!A:U', // Include all columns up to U
    });

    const rows = response.data.values || [];
    const nextRowNumber = rows.length + 1;

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const id = `${nextRowNumber}-${timestamp}`;
    
    // Create an array with 30 elements (A to AD) filled with empty strings
    const emptyColumns = Array(30).fill('');
    
    // Add the productData to the beginning and the id to the end
    const values = [[...productData, ...emptyColumns.slice(productData.length), id]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: 'Prices Calculator!A:U', // Include all columns up to U
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('Product appended successfully');
    return id; // Return the generated ID
  } catch (error) {
    console.error('Error appending product to Prices Calculator sheet:', error);
    throw error;
  }
}

exports.getPricesCalculatorData = async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: 'Prices Calculator!A1:U', // Include headers (row 1)
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the sheet');
      return [];
    }

    const [headers, ...dataRows] = rows;

    console.log('Headers:', headers);
    console.log('First data row:', dataRows[0]);

    const processedData = dataRows.map((row, index) => {
      const product = {
        coffeeProduct: row[0],
        greenCoffeePrice: row[1],
        batchSize: row[2],
        weightLoss: row[3],
        postRoastCost: row[4],
        labelUnitPrice: row[5],
        packagingUnitPrice: row[6],
        packed1kgCost: row[7],
        packed200gCost: row[8],
        markupMultiplier200g: row[9],
        retail200gPrice: row[10],
        markupMultiplier1kg: row[11],
        retail1kgPrice: row[12],
        markupMultiplierWholesale200g: row[13],
        wholesale200gPrice: row[14],
        wholesaleTier1: row[15],
        wholesaleTier2: row[16],
        wholesaleTier3: row[17],
        wholesaleListPrice: row[18],
        test: row[19],
        id: row[20], // Use the last column for ID
      };
      
      console.log(`Processing product ${index}. ID:`, product.id);
      return product;
    });

    console.log('Processed data:', processedData);

    return processedData;
  } catch (error) {
    console.error('Error fetching prices calculator data:', error);
    throw error;
  }
};



async function updateProductInPricesCalculator(id, updatedData) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get the current data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: 'Prices Calculator!A:U', // Adjust the range based on your actual sheet structure
    });

    const rows = response.data.values;
    // Find the row index based on the ID in the last column (U)
    const rowIndex = rows.findIndex(row => row[row.length - 1] === id);


    if (rowIndex === -1) {
      console.error('Product not found. Available IDs:', rows.map(row => row[row.length - 1]));
      throw new Error(`Product with ID ${id} not found`);
    }

    console.log('Found product at row index:', rowIndex);

    // Prepare the updated row data
    const updatedRow = [
      updatedData.coffeeProduct,
      updatedData.greenCoffeePrice,
      updatedData.batchSize,
      updatedData.weightLoss,
      updatedData.postRoastCost,
      updatedData.labelUnitPrice,
      updatedData.packagingUnitPrice,
      updatedData.packed1kgCost,
      updatedData.packed200gCost,
      updatedData.markupMultiplier200g,
      updatedData.retail200gPrice,
      updatedData.markupMultiplier1kg,
      updatedData.retail1kgPrice,
      updatedData.markupMultiplierWholesale200g,
      updatedData.wholesale200gPrice,
      updatedData.wholesaleTier1,
      updatedData.wholesaleTier2,
      updatedData.wholesaleTier3,
      updatedData.wholesaleListPrice,
      updatedData.test,
      //id // Removing the ID from here, as I don't want to update it
    ];

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.COFFEE_PRICES_SPREADSHEET_ID,
      range: `Prices Calculator!A${rowIndex + 1}:U${rowIndex + 1}`, // Include all columns up to U; +1 because sheets are 1-indexed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });

    console.log(`Updated row ${rowIndex + 1} in Prices Calculator sheet`);
  } catch (error) {
    console.error('Error updating product in Prices Calculator:', error);
    throw error;
  }
}


module.exports = {
    generatePickingList,
    getProducts: exports.getProducts,
    getCustomers: exports.getCustomers,
    getWholesaleCustomersDetails,
    getCustomerPricing,
    getWholesaleCustomersPrices,
    updateCustomerPrice,
    appendCustomerToDetailsSheet: exports.appendCustomerToDetailsSheet,
    appendCustomerToPricesSheet: exports.appendCustomerToPricesSheet,
    setCustomPrices: exports.setCustomPrices,
    getCoffeeList: exports.getCoffeeList,
    getRoastedCoffeePrices: exports.getRoastedCoffeePrices,
    getSKU,
    submitOrder: exports.submitOrder,
    appendProductToPricesCalculator,
    getPricesCalculatorData: exports.getPricesCalculatorData,
    updateProductInPricesCalculator,
    // ... any other functions I'm exporting
};
  
