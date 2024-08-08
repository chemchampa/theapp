const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { parse, isValid, format } = require('date-fns');
require('dotenv').config();
const pool = require('../config/db');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSpreadsheetId(tenantId, organizationId, spreadsheetType) {
  // This function should retrieve the correct spreadsheet ID for the given tenant and spreadsheet type
  console.log(`getSpreadsheetId called with: tenantId=${tenantId}, organizationId=${organizationId}, spreadsheetType=${spreadsheetType}`);

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const result = await pool.query(
      'SELECT spreadsheet_id FROM auth.spreadsheet_mappings WHERE tenant_id = $1 AND organization_id = $2 AND spreadsheet_type = $3',
      [tenantId, organizationId, spreadsheetType]
    );
    if (result.rows.length === 0) {
      throw new Error(`No spreadsheet mapping found for tenant ${tenantId}, organization ${organizationId}, and type ${spreadsheetType}`);
    }
    return result.rows[0].spreadsheet_id;
  } catch (error) {
    console.error('Error getting spreadsheet ID:', error);
    throw error;
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

async function generatePickingList(tenantId, organizationId, dateFilter) {
  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'ORDERS');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Wholesale Orders!A5:M',
    });

    if (!response.data.values) {
      throw new Error('No data found in the spreadsheet');
    }

    const sourceData = response.data.values;
    // Process the data
    // Use the dateFilter parameter instead of today's date
    const filteredData = processData(sourceData, dateFilter);
    // Prepare the output data
    return prepareOutputData(filteredData);
  } catch (error) {
    console.error('Error generating picking list:', error);
    throw error;
  }
}


//////////////////////////////////////////////////////


exports.getCustomers = async (tenantId, organizationId) => {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
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

async function getWholesaleCustomersDetails(tenantId, organizationId) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Wholesale Customers Details!A2:X',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in Wholesale Customers Details.');
      return [];
    }

    return rows.map(row => ({
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
  } catch (error) {
    console.error('Error fetching wholesale customers details:', error);
    throw error;
  }
}

exports.getProducts = async (tenantId, organizationId, productType) => {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    let spreadsheetId, range;

    switch (productType) {
      case 'Coffee':
        spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'SETTINGS');
        range = 'Settings!A2:A';
        break;
      case 'Tea':
      case 'Hot Chocolate':
      case 'Retail Item':
        spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'RETAIL_INVENTORY');
        range = `${productType} Inventory!A5:A`;
        break;
      default:
        spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'SETTINGS');
        range = 'Settings!A2:A';
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
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

async function getCustomerPricing(tenantId, organizationId, customerName) {
  // This function is for the "Place Order" function only
  // Here's logic to fetch customer pricing from the "Wholesale Customers" sheet
  // This should return an object with product prices for the specific customer

  console.log('getCustomerPricing called with:', { tenantId, organizationId, customerName });
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const spreadsheetId = await getSpreadsheetId(
      tenantId,
      organizationId,
      "WHOLESALE_CUSTOMERS"
    );

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Wholesale Customers!A:DD", // Adjust this range as needed
    });

    const rows = response.data.values;
    const headerRow = rows[0]; // The first row contains headers
    const bagSizesRow = rows[1];

    const customerRowNumber = findCustomerRow(rows, customerName);
    if (customerRowNumber === -1) {
      throw new Error(`Customer ${customerName} not found`);
    }

    const customerRow = rows[customerRowNumber];
    console.log("Customer Row:", JSON.stringify(customerRow, null, 2));

    const pricing = {};
    const productDataStartColumnIndex = 24; // Column Y is the 25th column (0-indexed)

    for (
      let colIndex = productDataStartColumnIndex;
      colIndex < headerRow.length;
      colIndex += 6
    ) {
      const product = headerRow[colIndex + 1]; // Product name is in the second column of each block
      if (product && product.trim() !== "") {
        pricing[product] = {
          [bagSizesRow[colIndex + 1]]:
            parseFloat(customerRow[colIndex + 1].replace("£", "")) || null,
          [bagSizesRow[colIndex + 3]]:
            parseFloat(customerRow[colIndex + 3].replace("£", "")) || null,
          [bagSizesRow[colIndex + 5]]:
            parseFloat(customerRow[colIndex + 5].replace("£", "")) || null,
        };
      }
    }

    console.log("Pricing:", JSON.stringify(pricing, null, 2));
    return pricing;
  } catch (error) {
    console.error("Error fetching customer pricing:", error);
    throw error;
  }
}

exports.submitOrder = async (tenantId, organizationId, orderItems, customerName) => {
  console.log('submitOrder called with:', { tenantId, organizationId, orderItems, customerName });
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'ORDERS');


    // Get the last order ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'WHOTest!F:F',
    });

    const lastOrderId = response.data.values ? response.data.values.pop()[0] : null;

    const newOrderId = generateOrderId(lastOrderId);
    
    const orderDate = new Date().toLocaleDateString('en-GB');               // DD/MM/YYYY format

    // Fetch customer pricing
    const customerPricing = await getCustomerPricing(tenantId, organizationId, customerName);
    console.log('Customer Pricing:', JSON.stringify(customerPricing, null, 2));
    
    const values = await Promise.all(orderItems.map(async (item) => {
      console.log('Processing item:', JSON.stringify(item, null, 2));
      const sku = await getSKU(tenantId, organizationId, item.product, item.productType);
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
      spreadsheetId,
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
exports.appendCustomerToDetailsSheet = async (newCustomer) => {
  const { tenantId, organizationId } = newCustomer;
  console.log('appendCustomerToDetailsSheet called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  // Extract customer data from newCustomer
  const customerData = {
    businessName: newCustomer.businessName,
    contactName: newCustomer.contactName,
    email: newCustomer.email,
    phone: newCustomer.phone,
    deliveryAddress: newCustomer.deliveryAddress,
    mainCoffee: newCustomer.mainCoffee,
    preferredPackagingSize: newCustomer.preferredPackagingSize,
    quantityEstimate: newCustomer.quantityEstimate,
    freshRoastOrRested: newCustomer.freshRoastOrRested,
    retailBags: newCustomer.retailBags,
    orderType: newCustomer.orderType,
    orderingFrequency: newCustomer.orderingFrequency,
    roastDays: newCustomer.roastDays,
    preferredDeliveryDays: newCustomer.preferredDeliveryDays,
    orderingVia: newCustomer.orderingVia,
    notes: newCustomer.notes,
    behaviourPatterns: newCustomer.behaviourPatterns,
    status: newCustomer.status,
    partOfPrep: newCustomer.partOfPrep,
    prepQuantity: newCustomer.prepQuantity,
    automaticOrdering: newCustomer.automaticOrdering,
    orderingCycleStartsOn: newCustomer.orderingCycleStartsOn,
    type: newCustomer.type
  };

  try {
    const sheets = google.sheets({
      version: "v4",
      auth: await getAuthClient(),
    });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');
    const detailsRange = "Wholesale Customers Details!A:X"; // Adjust based on your sheet structure

    // Fetch existing IDs from the sheet to check for uniqueness against existing IDs in that sheet.
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
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
    const detailsValues = [
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
      spreadsheetId,
      range: detailsRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: detailsValues },
    });

    // Append to Wholesale Customers Prices sheet
    const pricesResult = await exports.appendCustomerToPricesSheet(tenantId, organizationId, {
      Id,
      businessName: customerData.businessName,
      status: customerData.status
    });

    return {
      detailsResult: detailsResult.data,
      pricesResult: pricesResult
    };

  } catch (error) {
    console.error("Error appending customer to sheet:", error);
    throw error;
  }
};


exports.getCoffeeList = async (tenantId, organizationId) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'ORDERS');
    const range = 'Settings!A2:A'; // New range in the Orders spreadsheet

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
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
async function getSheetId(tenantId, organizationId, sheetName) {
  const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
  const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');
  const response = await sheets.spreadsheets.get({
    spreadsheetId
  });
  
  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet.properties.sheetId;
}


// This function handles appending the customer ID, Business Name, and Status to the "Wholesale Customers Prices" sheet.
exports.appendCustomerToPricesSheet = async (tenantId, organizationId, customerData) => {
  console.log('appendCustomerToPricesSheet called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');
    const range = 'Wholesale Customers Prices!A:Z';
    const sheetId = await getSheetId(tenantId, organizationId, 'Wholesale Customers Prices');
  
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
      spreadsheetId,
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
      spreadsheetId,
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


exports.setCustomPrices = async (tenantId, organizationId, customerData) => {
    try {
      const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
      const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');
      const range = 'Wholesale Customers Prices!A:Z'; // Adjust as needed
  
      // Find the row for the new customer
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
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
        spreadsheetId,
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

async function getWholesaleCustomersPrices(tenantId, organizationId) {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
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

async function updateCustomerPrice(tenantId, organizationId, customerId, column, newValue) {
    try {
      const authClient = await getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'WHOLESALE_CUSTOMERS');
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
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
        spreadsheetId,
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

exports.getRoastedCoffeePrices = async (tenantId, organizationId) => {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
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
    return price;
}

async function getSKU(tenantId, organizationId, productName, productType) {
    console.log(`Getting SKU for product: ${productName}, type: ${productType}`);
    // Here's logic to fetch the SKU for a given product name from the "Settings" sheet
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        let spreadsheetId, range;

        switch (productType) {
            case 'Coffee':
                spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'SETTINGS');
                range = 'Settings!A:B';
                break;
            case 'Tea':
            case 'Hot Chocolate':
            case 'Retail Item':
                spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'RETAIL_INVENTORY');
                range = `${productType} Inventory!A5:B`;
                break;
            default:
                throw new Error(`Invalid product type: ${productType}`);
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
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


/////////////////////////////////*     PRICES CALCULATOR ▼ ▼ ▼     //////////////////////*/

/*
  With this approach the product data is inserted into the correct columns at the beginning,
  any columns not filled by product data are left empty, and the ID is always placed in the last column (U).
*/
async function appendProductToPricesCalculator(tenantId, organizationId, productData) {
  console.log('appendProductToPricesCalculator called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    // First, get the current data to determine the next row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A:AN', // Include all columns up to AN
    });

    const rows = response.data.values || [];
    const nextRowNumber = rows.length + 1;

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const id = `${nextRowNumber}-${timestamp}`;
    
    // Ensure productData has 22 elements (columns A to V)
    const fullProductData = [...productData];
    while (fullProductData.length < 23) {
      fullProductData.push(''); // Add empty strings for missing columns
    }
    
    // Add the id to the end (column W)
    const values = [[...fullProductData, id]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Prices Calculator!A:AN', // Include all columns up to AN
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

/*
// v.1
exports.getPricesCalculatorData = async (tenantId, organizationId) => {
  console.log('getPricesCalculatorData called with:', { tenantId, organizationId });
  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A1:W', // Include headers (row 1)
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
        costPlusPricing: row[13],
        markupMultiplierWholesale200g: row[14],
        wholesale200gPrice: row[15],
        controller: row[16],
        wholesale1kgPrice: row[17],
        wholesaleTier1: row[18],
        wholesaleTier2: row[19],
        wholesaleTier3: row[20],
        test: row[21],
        id: row[22], // Use the last column for ID
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
*/

// v.2
exports.getPricesCalculatorData = async (tenantId, organizationId) => {
  console.log('getPricesCalculatorData called with:', { tenantId, organizationId });
  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A1:AN', // Extend the range to include all new columns and include headers (row 1)
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the sheet');
      return [];
    }

    const [headers, ...dataRows] = rows;

    // console.log('Headers:', headers);
    // console.log('First data row:', dataRows[0]);

    const processedData = dataRows.map((row, index) => {
      const product = {
        coffeeProduct: row[0],
        greenCoffeePrice: row[1],
        deliveryCost: row[2],

        batchSize: row[3],
        weightLoss: row[4],
        postRoastCost: row[5],
        labelUnitPrice: row[6],
        packagingUnitPrice: row[7],
        packed1kgCost: row[8],
        packed200gCost: row[9],
        
        retailPricing: {
          '200g': {
            costPlusPricingMethod200gRetail: row[10],
            multiplier200gRetail: row[11],
            discountPercentage200gRetail: row[12],
            retailPrice200g: row[13],
          },
          '1kg': {
            costPlusPricingMethod1kgRetail: row[14],
            multiplier1kgRetail: row[15],
            discountPercentage1kgRetail: row[16],
            retailPrice1kg: row[17],
          },
        },
        
        wholesalePricing: {
          '200g': {
            costPlusPricingMethod200gWholesale: row[18],
            multiplier200gWholesale: row[19],
            discountPercentage200gWholesale: row[20],
            wholesalePrice200g: row[21],
          },
          '1kg': {
            costPlusPricingMethod1kgWholesale: row[22],
            multiplier1kgWholesale: row[23],
            discountPercentage1kgWholesale: row[24],
            wholesalePrice1kg: row[25],
          },
          Tier1: {
            costPlusPricingMethodTier1Wholesale: row[26],
            multiplierTier1Wholesale: row[27],
            discountPercentageTier1Wholesale: row[28],
            wholesalePriceTier1: row[29],
          },
          Tier2: {
            costPlusPricingMethodTier2Wholesale: row[30],
            multiplierTier2Wholesale: row[31],
            discountPercentageTier2Wholesale: row[32],
            wholesalePriceTier2: row[33],
          },
          Tier3: {
            costPlusPricingMethodTier3Wholesale: row[34],
            multiplierTier3Wholesale: row[35],
            discountPercentageTier3Wholesale: row[36],
            wholesalePriceTier3: row[37],
          },
        },
        
        test: row[38],
        id: row[39], // Use the last column for ID
      };
      
      // console.log(`Processing product ${index}. ID:`, product.id);
      return product;
    });

    // console.log('Processed data:', processedData);

    return processedData;
  } catch (error) {
    console.error('Error fetching prices calculator data:', error);
    throw error;
  }
};


/*
// v.1
async function updateProductInPricesCalculator(tenantId, organizationId, id, updatedData) {
  console.log('updateProductInPricesCalculator called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    // Get the current data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A:W', // Adjust the range to include new columns
    });

    const rows = response.data.values;
    // Find the row index based on the ID in the last column (W)
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
      updatedData.costPlusPricing,
      updatedData.markupMultiplierWholesale200g,
      updatedData.wholesale200gPrice,
      updatedData.controller,
      updatedData.wholesale1kgPrice,
      updatedData.wholesaleTier1,
      updatedData.wholesaleTier2,
      updatedData.wholesaleTier3,
      updatedData.test,
      //id // Removing the ID from here, as we don't want to update it
    ];

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Prices Calculator!A${rowIndex + 1}:W${rowIndex + 1}`, // Include all columns up to W; +1 because sheets are 1-indexed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });

    console.log(`Updated row ${rowIndex + 1} in Prices Calculator sheet`);

    // Return the updated data
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating product in Prices Calculator:', error);
    throw error;
  }
}
*/

/* v.2
  I updated in this function the `updatedRow` array to include all the new fields for retail and wholesale pricing, including
  the cost-plus pricing methods, multipliers, discount percentages, and calculated prices for each category.
*/
/*
async function updateProductInPricesCalculator(tenantId, organizationId, id, updatedData) {
  console.log('updateProductInPricesCalculator called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    // Get the current data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A:AM', // Adjust the range to include new columns
    });

    const rows = response.data.values;
    // Find the row index based on the ID in the last column (AM)
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
      
      // Retail pricing for 200g
      updatedData.retailPricing['200g'].costPlusPricingMethod200gRetail,
      updatedData.retailPricing['200g'].multiplier200gRetail,
      updatedData.retailPricing['200g'].discountPercentage200gRetail,
      updatedData.retailPricing['200g'].retailPrice200g,
      
      // Retail pricing for 1kg
      updatedData.retailPricing['1kg'].costPlusPricingMethod1kgRetail,
      updatedData.retailPricing['1kg'].multiplier1kgRetail,
      updatedData.retailPricing['1kg'].discountPercentage1kgRetail,
      updatedData.retailPricing['1kg'].retailPrice1kg,
      
      // Wholesale 200g
      updatedData.wholesalePricing['200g'].costPlusPricingMethod200gWholesale,
      updatedData.wholesalePricing['200g'].multiplier200gWholesale,
      updatedData.wholesalePricing['200g'].discountPercentage200gWholesale,
      updatedData.wholesalePricing['200g'].wholesalePrice200g,
      
      // Wholesale 1kg (List Price)
      updatedData.wholesalePricing['1kg'].costPlusPricingMethod1kgWholesale,
      updatedData.wholesalePricing['1kg'].multiplier1kgWholesale,
      updatedData.wholesalePricing['1kg'].discountPercentage1kgWholesale,
      updatedData.wholesalePricing['1kg'].wholesalePrice1kg,
      
      // Wholesale Tier 1 (75KG+)
      updatedData.wholesalePricing.tier1.costPlusPricingMethodTier1Wholesale,
      updatedData.wholesalePricing.tier1.multiplierTier1Wholesale,
      updatedData.wholesalePricing.tier1.discountPercentageTier1Wholesale,
      updatedData.wholesalePricing.tier1.wholesalePriceTier1,
      
      // Wholesale Tier 2 (20-75kg)
      updatedData.wholesalePricing.tier2.costPlusPricingMethodTier2Wholesale,
      updatedData.wholesalePricing.tier2.multiplierTier2Wholesale,
      updatedData.wholesalePricing.tier2.discountPercentageTier2Wholesale,
      updatedData.wholesalePricing.tier2.wholesalePriceTier2,
      
      // Wholesale Tier 3 (1-20kg)
      updatedData.wholesalePricing.tier3.costPlusPricingMethodTier3Wholesale,
      updatedData.wholesalePricing.tier3.multiplierTier3Wholesale,
      updatedData.wholesalePricing.tier3.discountPercentageTier3Wholesale,
      updatedData.wholesalePricing.tier3.wholesalePriceTier3,
      
      updatedData.test,
      // Note: We don't include the ID here as it shouldn't be updated
    ];

    console.log('Updated row data:', JSON.stringify(updatedRow, null, 2));

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Prices Calculator!A${rowIndex + 1}:AM${rowIndex + 1}`, // Include all columns up to W; +1 because sheets are 1-indexed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });

    console.log(`Updated row ${rowIndex + 1} in Prices Calculator sheet`);

    // Return the updated data
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating product in Prices Calculator:', error);
    throw error;
  }
}
*/

/* v.3
  I updated in this function the `updatedRow` array to include all the new fields for retail and wholesale pricing, including
  the cost-plus pricing methods, multipliers, discount percentages, and calculated prices for each category.
*/
async function updateProductInPricesCalculator(tenantId, organizationId, id, mergedData) {
  console.log('updateProductInPricesCalculator called with:', { tenantId, organizationId });

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');

    // Get the current data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A:AN', // Adjust the range to include new columns
    });

    const rows = response.data.values;
    // Find the row index based on the ID in the last column (AN)
    const rowIndex = rows.findIndex(row => row[row.length - 1] === id);

    if (rowIndex === -1) {
      console.error('Product not found. Available IDs:', rows.map(row => row[row.length - 1]));
      throw new Error(`Product with ID ${id} not found`);
    }

    console.log('Found product at row index:', rowIndex);

    console.log('mergedData before creating updatedRow:', JSON.stringify(mergedData, null, 2));

    // Prepare the updated row data
    const updatedRow = [
      mergedData.coffeeProduct,
      mergedData.greenCoffeePrice,
      mergedData.deliveryCost,
      mergedData.batchSize,
      mergedData.weightLoss,
      mergedData.postRoastCost,
      mergedData.labelUnitPrice,
      mergedData.packagingUnitPrice,
      mergedData.packed1kgCost,
      mergedData.packed200gCost,
      
      // Retail pricing for 200g
      mergedData.retailPricing['200g'].costPlusPricingMethod200gRetail,
      mergedData.retailPricing['200g'].multiplier200gRetail,
      mergedData.retailPricing['200g'].discountPercentage200gRetail,
      mergedData.retailPricing['200g'].retailPrice200g,
      
      // Retail pricing for 1kg
      mergedData.retailPricing['1kg'].costPlusPricingMethod1kgRetail,
      mergedData.retailPricing['1kg'].multiplier1kgRetail,
      mergedData.retailPricing['1kg'].discountPercentage1kgRetail,
      mergedData.retailPricing['1kg'].retailPrice1kg,
      
      // Wholesale 200g
      mergedData.wholesalePricing['200g'].costPlusPricingMethod200gWholesale,
      mergedData.wholesalePricing['200g'].multiplier200gWholesale,
      mergedData.wholesalePricing['200g'].discountPercentage200gWholesale,
      mergedData.wholesalePricing['200g'].wholesalePrice200g,
      
      // Wholesale 1kg (List Price)
      mergedData.wholesalePricing['1kg'].costPlusPricingMethod1kgWholesale,
      mergedData.wholesalePricing['1kg'].multiplier1kgWholesale,
      mergedData.wholesalePricing['1kg'].discountPercentage1kgWholesale,
      mergedData.wholesalePricing['1kg'].wholesalePrice1kg,
      
      // Wholesale Tier 1 (75KG+)
      mergedData.wholesalePricing.Tier1.costPlusPricingMethodTier1Wholesale,
      mergedData.wholesalePricing.Tier1.multiplierTier1Wholesale,
      mergedData.wholesalePricing.Tier1.discountPercentageTier1Wholesale,
      mergedData.wholesalePricing.Tier1.wholesalePriceTier1,
      
      // Wholesale Tier 2 (20-75kg)
      mergedData.wholesalePricing.Tier2.costPlusPricingMethodTier2Wholesale,
      mergedData.wholesalePricing.Tier2.multiplierTier2Wholesale,
      mergedData.wholesalePricing.Tier2.discountPercentageTier2Wholesale,
      mergedData.wholesalePricing.Tier2.wholesalePriceTier2,
      
      // Wholesale Tier 3 (1-20kg)
      mergedData.wholesalePricing.Tier3.costPlusPricingMethodTier3Wholesale,
      mergedData.wholesalePricing.Tier3.multiplierTier3Wholesale,
      mergedData.wholesalePricing.Tier3.discountPercentageTier3Wholesale,
      mergedData.wholesalePricing.Tier3.wholesalePriceTier3,
      
      mergedData.test,
      // Note: We don't include the ID here as it shouldn't be updated
    ];

    console.log('Updated row data:', JSON.stringify(updatedRow, null, 2));

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Prices Calculator!A${rowIndex + 1}:AN${rowIndex + 1}`, // Include all columns up to W; +1 because sheets are 1-indexed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });

    console.log(`Updated row ${rowIndex + 1} in Prices Calculator sheet`);

    // Return the updated data
    return {
      id,
      ...mergedData
    };
  } catch (error) {
    console.error('Error updating product in Prices Calculator:', error);
    throw error;
  }
}


// Function to delete products from the Google Sheet
async function deleteProductsFromPricesCalculator(tenantId, organizationId, ids) {
  console.log('deleteProductsFromPricesCalculator called with:', { tenantId, organizationId });

  console.log('Attempting to delete products with IDs:', ids);

  if (!tenantId || !organizationId) {
    throw new Error(`Invalid tenantId or organizationId: tenantId=${tenantId}, organizationId=${organizationId}`);
  }
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');
    const sheetId = await getSheetIdforPricesCalculator(tenantId, organizationId, 'Prices Calculator');


    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prices Calculator!A:AN',
    });
    const rows = response.data.values;
    // After fetching the rows
    console.log('Total rows in sheet:', rows.length);

    // Find the rows to delete
    const rowsToDelete = rows.reduce((acc, row, index) => {
      if (ids.includes(row[row.length - 1])) { // Assuming ID is in the last column
        acc.push(index + 1); // +1 because sheet rows are 1-indexed
      }
      return acc;
    }, []);
    // When finding rows to delete
    console.log('Rows to delete:', rowsToDelete);

    // Sort in descending order to avoid shifting issues when deleting
    rowsToDelete.sort((a, b) => b - a);

    // Delete the rows
    for (const rowIndex of rowsToDelete) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex
                }
              }
            }
          ]
        }
      });
    }

    console.log(`Deleted ${rowsToDelete.length} products from Prices Calculator sheet`);
  } catch (error) {
    console.error('Error deleting products from Prices Calculator:', error);
    throw error;
  }
}

// Helper function that finds the correct sheet ID for the "Prices Calculator" sheet.
// Some advanced operations, particularly those involving formatting or data validation (like adding dropdowns or checkboxes), require the specific sheet ID within the spreadsheet.
async function getSheetIdforPricesCalculator(tenantId, organizationId, sheetName) {
  const sheets = google.sheets({ version: 'v4', auth: await getAuthClient() });
  const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'COFFEE_PRICES');
  const response = await sheets.spreadsheets.get({
    spreadsheetId
  });
  
  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet.properties.sheetId;
}

//////////////////////////////////////////////* Timeline View Gantt Chart tooling ▼ ▼ ▼ */

async function getTimelineData(tenantId, organizationId) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'TIMELINE');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Timeline!A2:G',
    });

    return response.data.values.map(row => ({
      id: row[0],
      taskName: row[1],
      startDate: row[2],
      endDate: row[3],
      assignee: row[4],
      progress: row[5],
      dependencies: row[6] ? row[6].split(',') : []
    }));
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
}

async function createTimelineItem(tenantId, organizationId, newItem) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'TIMELINE');

    const values = [
      [
        newItem.id,
        newItem.taskName,
        newItem.startDate,
        newItem.endDate,
        newItem.assignee,
        newItem.progress,
        newItem.dependencies.join(',')
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Timeline!A2:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return newItem;
  } catch (error) {
    console.error('Error creating timeline item:', error);
    throw error;
  }
}

async function updateTimelineItem(tenantId, organizationId, id, updatedItem) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'TIMELINE');

    // Find the row with the matching id
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Timeline!A2:A',
    });

    const idColumn = response.data.values.flat();
    const rowIndex = idColumn.indexOf(id) + 2; // +2 because of header row and 0-indexing

    if (rowIndex === 1) {
      throw new Error('Task not found');
    }

    const range = `Timeline!A${rowIndex}:G${rowIndex}`;
    const values = [
      [
        updatedItem.id,
        updatedItem.taskName,
        updatedItem.startDate,
        updatedItem.endDate,
        updatedItem.assignee,
        updatedItem.progress,
        updatedItem.dependencies.join(',')
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return updatedItem;
  } catch (error) {
    console.error('Error updating timeline item:', error);
    throw error;
  }
}

async function deleteTimelineItem(tenantId, organizationId, id) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = await getSpreadsheetId(tenantId, organizationId, 'TIMELINE');

    // Find the row with the matching id
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Timeline!A2:A',
    });

    const idColumn = response.data.values.flat();
    const rowIndex = idColumn.indexOf(id) + 2; // +2 because of header row and 0-indexing

    if (rowIndex === 1) {
      throw new Error('Task not found');
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming Timeline is the first sheet
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex
              }
            }
          }
        ]
      }
    });

  } catch (error) {
    console.error('Error deleting timeline item:', error);
    throw error;
  }
}

//////////////////////////////////////////////* End ▲ ▲ ▲ */


module.exports = {
  getSpreadsheetId,
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
  deleteProductsFromPricesCalculator,
  getTimelineData,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  // ... any other functions I'm exporting
};
  
