const googleSheetsService = require('../services/googleSheetsService');

const pricingMethodKeys = {
  "Fixed Percentage Markup": "markupPercentage",
  "Fixed Amount Markup": "markupAmount",
  "Desired Profit Margin": "desiredProfit",
  "Keystone Pricing (100% Markup)": "keystone",
  // "Tiered Markup Based on Cost": "tiered"
};

/*
// v.1
function calculateWholesalePrices(cost, method, controllerValue) {
  console.log('Calculating wholesale prices:', { cost, method, controllerValue });
  
  cost = parseFloat(cost);
  if (isNaN(cost)) {
    console.error('Invalid cost:', cost);
    throw new Error('Invalid cost provided');
  }

  const methodKey = pricingMethodKeys[method] || method;

  switch (methodKey) {
    case 'markupPercentage':
      let markupPercentage = parseFloat(controllerValue);
      if (isNaN(markupPercentage) || markupPercentage < 0) {
        console.warn('Invalid markup, using default of 20%');
        markupPercentage = 0.20;
      }
      return {
        wholesale1kgPrice: cost * (1 + markupPercentage),
        wholesaleTier1: cost * (1 + markupPercentage * 0.85),
        wholesaleTier2: cost * (1 + markupPercentage * 0.90),
        wholesaleTier3: cost * (1 + markupPercentage * 0.95)
      };

    case 'markupAmount':
      let markupAmount = parseFloat(controllerValue);
      if (isNaN(markupAmount) || markupAmount < 0) {
        console.warn('Invalid fixed markup, using default of $5');
        markupAmount = 5;
      }
      return {
        wholesale1kgPrice: cost + markupAmount,
        wholesaleTier1: cost + markupAmount * 0.85,
        wholesaleTier2: cost + markupAmount * 0.90,
        wholesaleTier3: cost + markupAmount * 0.95
      };

    case 'desiredProfit':
      let margin = parseFloat(controllerValue);
      if (isNaN(margin) || margin < 0 || margin >= 1) {
        console.warn('Invalid profit margin, using default of 20%');
        margin = 0.20;
      }
      const basePrice = cost / (1 - margin);
      return {
        wholesale1kgPrice: basePrice,
        wholesaleTier1: basePrice * 0.95,
        wholesaleTier2: basePrice * 0.97,
        wholesaleTier3: basePrice * 1.02
      };

    case 'keystone':
      return {
        wholesale1kgPrice: cost * 2,
        wholesaleTier1: cost * 1.85,
        wholesaleTier2: cost * 1.90,
        wholesaleTier3: cost * 1.95
      };

    case 'tiered':
      let tiers;
      try {
        tiers = controllerValue.split(',').map(tier => {
          const [threshold, markup] = tier.split(':');
          return { threshold: parseFloat(threshold), markup: parseFloat(markup) };
        });
        tiers.sort((a, b) => b.threshold - a.threshold);
      } catch (error) {
        console.warn('Invalid tiered markup, using default tiers');
        tiers = [
          { threshold: 100, markup: 0.3 },
          { threshold: 50, markup: 0.4 },
          { threshold: 0, markup: 0.5 }
        ];
      }
      const appliedMarkup = tiers.find(tier => cost >= tier.threshold)?.markup || tiers[tiers.length - 1].markup;
      return {
        wholesale1kgPrice: cost * (1 + appliedMarkup),
        wholesaleTier1: cost * (1 + appliedMarkup * 0.90),
        wholesaleTier2: cost * (1 + appliedMarkup * 0.95),
        wholesaleTier3: cost * (1 + appliedMarkup * 1.05)
      };
    
    default:
      console.error('Invalid pricing method:', method);
      throw new Error('Invalid pricing method');
  }
}
  */

// v.2
function calculateWholesalePrices(cost, method, multiplier1kgWholesale) {
  console.log('Calculating wholesale prices:', { cost, method, multiplier1kgWholesale });
  
  cost = parseFloat(cost);
  if (isNaN(cost)) {
    console.error('Invalid cost:', cost);
    throw new Error('Invalid cost provided');
  }

  const methodKey = pricingMethodKeys[method] || method;

  switch (methodKey) {
    case 'markupPercentage':
      let markupPercentage = parseFloat(multiplier1kgWholesale);
      if (isNaN(markupPercentage) || markupPercentage < 0) {
        console.warn('Invalid markup, using default of 20%');
        markupPercentage = 0.20;
      }
      return {
        wholesalePrice1kg: cost * (1 + markupPercentage),
        wholesalePriceTier1: cost * (1 + markupPercentage * 0.85),
        wholesalePriceTier2: cost * (1 + markupPercentage * 0.90),
        wholesalePriceTier3: cost * (1 + markupPercentage * 0.95),
        multiplier1kgWholesale: markupPercentage
      };

    case 'markupAmount':
      let markupAmount = parseFloat(multiplier1kgWholesale);
      if (isNaN(markupAmount) || markupAmount < 0) {
        console.warn('Invalid fixed markup, using default of $5');
        markupAmount = 5;
      }
      return {
        wholesalePrice1kg: cost + markupAmount,
        wholesalePriceTier1: cost + markupAmount * 0.85,
        wholesalePriceTier2: cost + markupAmount * 0.90,
        wholesalePriceTier3: cost + markupAmount * 0.95,
        multiplier1kgWholesale: markupAmount
      };

    case 'desiredProfit':
      let margin = parseFloat(multiplier1kgWholesale);
      if (isNaN(margin) || margin < 0 || margin >= 1) {
        console.warn('Invalid profit margin, using default of 20%');
        margin = 0.20;
      }
      const basePrice = cost / (1 - margin);
      return {
        wholesalePrice1kg: basePrice,
        wholesalePriceTier1: basePrice * 0.95,
        wholesalePriceTier2: basePrice * 0.97,
        wholesalePriceTier3: basePrice * 1.02,
        multiplier1kgWholesale: margin
      };

    case 'keystone':
      return {
        wholesalePrice1kg: cost * 2,
        wholesalePriceTier1: cost * 1.85,
        wholesalePriceTier2: cost * 1.90,
        wholesalePriceTier3: cost * 1.95,
        multiplier1kgWholesale: 1 // 100% markup
      };

    case 'tiered':
      let tiers;
      try {
        tiers = multiplier1kgWholesale.split(',').map(tier => {
          const [threshold, markup] = tier.split(':');
          return { threshold: parseFloat(threshold), markup: parseFloat(markup) };
        });
        tiers.sort((a, b) => b.threshold - a.threshold);
      } catch (error) {
        console.warn('Invalid tiered markup, using default tiers');
        tiers = [
          { threshold: 100, markup: 0.3 },
          { threshold: 50, markup: 0.4 },
          { threshold: 0, markup: 0.5 }
        ];
      }
      const appliedMarkup = tiers.find(tier => cost >= tier.threshold)?.markup || tiers[tiers.length - 1].markup;
      return {
        wholesalePrice1kg: cost * (1 + appliedMarkup),
        wholesalePriceTier1: cost * (1 + appliedMarkup * 0.90),
        wholesalePriceTier2: cost * (1 + appliedMarkup * 0.95),
        wholesalePriceTier3: cost * (1 + appliedMarkup * 1.05),
        multiplier1kgWholesale: appliedMarkup
      };
    
    default:
      console.error('Invalid pricing method:', method);
      throw new Error('Invalid pricing method');
  }
}

/*
// v.1
exports.addProduct = async (req, res) => {
  console.log('Received add product request:', req.body);
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    console.log('tenantId:', tenantId, 'organizationId:', organizationId);

    const {
      coffeeProduct,
      greenCoffeePrice,
      deliveryCost,
      batchSize,
      weightLoss,
      labelUnitPrice,
      packagingUnitPrice,
      costPlusPricing,
      controller
    } = req.body;

    // Convert weightLoss to a decimal
    const weightLossDecimal = parseFloat(weightLoss) / 100;
    const weightLossFormatted = `${parseFloat(weightLoss).toFixed(2)}%`;

    // Calculate Post Roast Cost of 1kg
    const postRoastCost = (greenCoffeePrice * (1 / (1 - weightLossDecimal))) + parseFloat(deliveryCost);

    // Calculate Packed costs
    const packed1kgCost = postRoastCost + parseFloat(labelUnitPrice) + parseFloat(packagingUnitPrice);
    const packed200gCost = (postRoastCost / 5) + parseFloat(labelUnitPrice) + parseFloat(packagingUnitPrice);

    // Default markup values
    const markupMultiplier200g = 2;
    const markupMultiplier1kg = 2;
    const markupMultiplierWholesale200g = 1.5;

    // Calculate retail and wholesale prices
    const retail200gPrice = packed200gCost * markupMultiplier200g;
    const retail1kgPrice = packed1kgCost * markupMultiplier1kg;
    const wholesale200gPrice = packed200gCost * markupMultiplierWholesale200g;

    // Calculate wholesale prices based on the selected method
    const wholesalePrices = calculateWholesalePrices(packed1kgCost, costPlusPricing, controller);

    const productData = [
      coffeeProduct,
      parseFloat(greenCoffeePrice).toFixed(2),
      parseFloat(batchSize).toFixed(2),
      weightLossFormatted.toFixed(2),
      postRoastCost.toFixed(2),
      parseFloat(labelUnitPrice).toFixed(2),
      parseFloat(packagingUnitPrice).toFixed(2),
      packed1kgCost.toFixed(2),
      packed200gCost.toFixed(2),
      markupMultiplier200g.toFixed(2),
      retail200gPrice.toFixed(2),
      markupMultiplier1kg.toFixed(2),
      retail1kgPrice.toFixed(2),
      costPlusPricing,
      markupMultiplierWholesale200g.toFixed(2),
      wholesale200gPrice.toFixed(2),
      controller.toFixed(2),
      wholesalePrices.wholesale1kgPrice.toFixed(2),
      wholesalePrices.wholesaleTier1.toFixed(2),
      wholesalePrices.wholesaleTier2.toFixed(2),
      wholesalePrices.wholesaleTier3.toFixed(2),
      '', // Empty string Placeholder for Test column
    ];

    const id = await googleSheetsService.appendProductToPricesCalculator(tenantId, organizationId, productData);
    res.status(201).json({ message: 'Product added successfully', id });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};
*/

// v.2
exports.addProduct = async (req, res) => {
  console.log('Received add product request:', req.body);
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    console.log('tenantId:', tenantId, 'organizationId:', organizationId);

    const {
      coffeeProduct,
      greenCoffeePrice,
      deliveryCost,
      batchSize,
      weightLoss,
      labelUnitPrice,
      packagingUnitPrice,
      costPlusPricing1kgWholesale,
      multiplier1kgWholesale
    } = req.body;

    // Convert weightLoss to a decimal
    const weightLossDecimal = parseFloat(weightLoss) / 100;
    const weightLossFormatted = `${parseFloat(weightLoss).toFixed(2)}%`;

    // Calculate Post Roast Cost of 1kg
    const postRoastCost = (greenCoffeePrice * (1 / (1 - weightLossDecimal))) + parseFloat(deliveryCost);

    // Calculate Packed costs
    const packed1kgCost = postRoastCost + parseFloat(labelUnitPrice) + parseFloat(packagingUnitPrice);
    const packed200gCost = (postRoastCost / 5) + parseFloat(labelUnitPrice) + parseFloat(packagingUnitPrice);

    // Default markup values
    const multiplier200gRetail = 2;
    const multiplier1kgRetail = 2;
    const multiplier200gWholesale = 1.5;

    // Calculate retail and wholesale prices
    const retailPrice200g = packed200gCost * multiplier200gRetail;
    const retailPrice1kg = packed1kgCost * multiplier1kgRetail;
    const wholesalePrice200g = packed200gCost * multiplier200gWholesale;

    // Calculate wholesale prices based on the selected method
    const wholesalePrices = calculateWholesalePrices(packed1kgCost, costPlusPricing1kgWholesale, multiplier1kgWholesale);

    const productData = [
      coffeeProduct,
      parseFloat(greenCoffeePrice).toFixed(2),
      parseFloat(batchSize).toFixed(2),
      weightLossFormatted,
      postRoastCost.toFixed(2),
      parseFloat(labelUnitPrice).toFixed(2),
      parseFloat(packagingUnitPrice).toFixed(2),
      packed1kgCost.toFixed(2),
      packed200gCost.toFixed(2),
      
      // Retail 200g
      'Fixed Percentage Markup', // costPlusPricingMethod200gRetail
      multiplier200gRetail.toFixed(2), // multiplier200gRetail
      '0.00', // discountPercentage200gRetail
      retailPrice200g.toFixed(2), // retailPrice200g
      
      // Retail 1kg
      'Fixed Percentage Markup', // costPlusPricingMethod1kgRetail
      multiplier1kgRetail.toFixed(2), // multiplier1kgRetail
      '0.00', // discountPercentage1kgRetail
      retailPrice1kg.toFixed(2), // retailPrice1kg
      
      // Wholesale 200g
      'Fixed Percentage Markup', // costPlusPricingMethod200gWholesale
      multiplier200gWholesale.toFixed(2), // multiplier200gWholesale
      '0.00', // discountPercentage200gWholesale
      wholesalePrice200g.toFixed(2), // wholesalePrice200g
      
      // Wholesale 1kg
      costPlusPricing1kgWholesale, // costPlusPricingMethod1kgWholesale
      multiplier1kgWholesale.toFixed(2), // multiplier1kgWholesale
      '0.00', // discountPercentage1kgWholesale
      wholesalePrices.wholesale1kgPrice.toFixed(2), // wholesalePrice1kg
      
      // Wholesale Tier 1
      costPlusPricing1kgWholesale, // costPlusPricingMethodTier1Wholesale
      (multiplier1kgWholesale * 0.85).toFixed(2), // multiplierTier1Wholesale
      '0.00', // discountPercentageTier1Wholesale
      wholesalePrices.wholesaleTier1.toFixed(2), // wholesalePriceTier1
      
      // Wholesale Tier 2
      costPlusPricing1kgWholesale, // costPlusPricingMethodTier2Wholesale
      (multiplier1kgWholesale * 0.90).toFixed(2), // multiplierTier2Wholesale
      '0.00', // discountPercentageTier2Wholesale
      wholesalePrices.wholesaleTier2.toFixed(2), // wholesalePriceTier2
      
      // Wholesale Tier 3
      costPlusPricing1kgWholesale, // costPlusPricingMethodTier3Wholesale
      (multiplier1kgWholesale * 0.95).toFixed(2), // multiplierTier3Wholesale
      '0.00', // discountPercentageTier3Wholesale
      wholesalePrices.wholesaleTier3.toFixed(2), // wholesalePriceTier3
      
      '', // Empty string Placeholder for Test column
    ];

    const id = await googleSheetsService.appendProductToPricesCalculator(tenantId, organizationId, productData);
    res.status(201).json({ message: 'Product added successfully', id });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    // console.log('req.user:', req.user);
    // console.log('req.tenantId:', req.tenantId);
    // console.log('req.organizationId:', req.organizationId);
    
    const products = await googleSheetsService.getPricesCalculatorData(req.tenantId, req.organizationId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};


// v.17
exports.updateProduct = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const { id } = req.params;
    const updatedData = req.body;

    // console.log('tenantId:', tenantId, 'organizationId:', organizationId);
    // console.log('Received update request for ID:', id);
    console.log('Updated data:', updatedData);

    if (!id) {
      throw new Error('No ID provided for update');
    }

    // Fetch all products
    const allProducts = await googleSheetsService.getPricesCalculatorData(tenantId, organizationId);
    
    // Find the existing product
    const existingProduct = allProducts.find(product => product.id === id);

    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Merge existing data with updated data
    const mergedData = {
      ...existingProduct,  // This spreads all existing product properties
      ...updatedData,      // This spreads all updated properties, potentially overwriting existing ones
      // Now we handle nested objects separately to ensure deep merging
      retailPricing: {
        '200g': {
          ...existingProduct.retailPricing['200g'],
          ...updatedData.retailPricing['200g'],
        },
        '1kg': {
          ...existingProduct.retailPricing['1kg'],
          ...updatedData.retailPricing['1kg'],
        },
      },
      wholesalePricing: {
        '200g': {
          ...existingProduct.wholesalePricing['200g'],
          ...updatedData.wholesalePricing['200g'],
        },
        '1kg': {
          ...existingProduct.wholesalePricing['1kg'],
          ...updatedData.wholesalePricing['1kg'],
        },
        Tier1: {
          ...existingProduct.wholesalePricing.Tier1,
          ...updatedData.wholesalePricing.Tier1,
        },
        Tier2: {
          ...existingProduct.wholesalePricing.Tier2,
          ...updatedData.wholesalePricing.Tier2,
        },
        Tier3: {
          ...existingProduct.wholesalePricing.Tier3,
          ...updatedData.wholesalePricing.Tier3,
        },
      },
    };

    console.log('Merged data before calculations:', JSON.stringify(mergedData, null, 2));

    // Validate and ensure necessary fields
    if (!mergedData.packed1kgCost || isNaN(parseFloat(mergedData.packed1kgCost))) {
      throw new Error('Invalid or missing packed1kgCost');
    }
    if (!mergedData.packed200gCost || isNaN(parseFloat(mergedData.packed200gCost))) {
      throw new Error('Invalid or missing packed200gCost');
    }

    // Retail pricing calculations
    ['200g', '1kg'].forEach(key => {
      if (mergedData.retailPricing && mergedData.retailPricing[key]) {
        const cost = key === '200g' ? mergedData.packed200gCost : mergedData.packed1kgCost;
        const retailData = mergedData.retailPricing[key];
        
        if (updatedData.retailPricing && updatedData.retailPricing[key] && updatedData.retailPricing[key][`retailPrice${key}`] === undefined) {
          // Only calculate if the retail price wasn't directly updated
          const price = parseFloat(cost) * (1 + parseFloat(retailData[`multiplier${key}Retail`]));
          retailData[`retailPrice${key}`] = price.toFixed(2);
        }

        // Apply discount
        if (retailData[`discountPercentage${key}Retail`]) {
          retailData[`retailPrice${key}`] = applyDiscount(
            parseFloat(retailData[`retailPrice${key}`]),
            parseFloat(retailData[`discountPercentage${key}Retail`])
          ).toFixed(2);
        }
      }
    });

    // Wholesale pricing calculations
    if (mergedData.wholesalePricing) {
      // 1kg wholesale pricing
      if (mergedData.wholesalePricing['1kg']) {
        const cost = parseFloat(mergedData.packed1kgCost);
        const wholesaleData = mergedData.wholesalePricing['1kg'];
        
        if (updatedData.wholesalePricing && updatedData.wholesalePricing['1kg'] && updatedData.wholesalePricing['1kg'].wholesalePrice1kg === undefined) {
          // Only calculate if the wholesale price wasn't directly updated
          let price;
          switch (wholesaleData.costPlusPricingMethod1kgWholesale) {
            case 'Fixed Percentage Markup':
            case 'Desired Profit Margin':
              price = cost * (1 + parseFloat(wholesaleData.multiplier1kgWholesale));
              break;
            case 'Fixed Amount Markup':
              price = cost + parseFloat(wholesaleData.multiplier1kgWholesale);
              break;
            case 'Keystone Pricing (100% Markup)':
              price = cost * 2;
              break;
            default:
              price = cost;
          }
          wholesaleData.wholesalePrice1kg = price.toFixed(2);
        }

        // Calculate tier prices based on the 1kg price
        ['Tier1', 'Tier2', 'Tier3'].forEach(tier => {
          if (mergedData.wholesalePricing[tier]) {
            if (updatedData.wholesalePricing && updatedData.wholesalePricing[tier] && updatedData.wholesalePricing[tier][`wholesalePrice${tier}`] === undefined) {
              const tierData = mergedData.wholesalePricing[tier];
              let tierPrice;
              switch (tierData[`costPlusPricingMethod${tier}Wholesale`]) {
                case 'Fixed Percentage Markup':
                case 'Desired Profit Margin':
                  tierPrice = parseFloat(wholesaleData.wholesalePrice1kg) * (1 + parseFloat(tierData[`multiplier${tier}Wholesale`] || 0));
                  break;
                case 'Fixed Amount Markup':
                  tierPrice = parseFloat(wholesaleData.wholesalePrice1kg) + parseFloat(tierData[`multiplier${tier}Wholesale`] || 0);
                  break;
                default:
                  tierPrice = parseFloat(wholesaleData.wholesalePrice1kg);
              }
              tierData[`wholesalePrice${tier}`] = tierPrice.toFixed(2);
            }
      
            // Apply discount for each tier
            const discountPercentage = mergedData.wholesalePricing[tier][`discountPercentage${tier}Wholesale`];
            if (discountPercentage) {
              mergedData.wholesalePricing[tier][`wholesalePrice${tier}`] = applyDiscount(
                parseFloat(mergedData.wholesalePricing[tier][`wholesalePrice${tier}`] || 0),
                parseFloat(discountPercentage)
              ).toFixed(2);
            }
          }
        });
      }

      // 200g wholesale pricing
      if (mergedData.wholesalePricing['200g']) {
        const cost = parseFloat(mergedData.packed200gCost);
        const wholesaleData200g = mergedData.wholesalePricing['200g'];
        
        if (updatedData.wholesalePricing && updatedData.wholesalePricing['200g'] && updatedData.wholesalePricing['200g'].wholesalePrice200g === undefined) {
          // Only calculate if the wholesale price wasn't directly updated
          let price;
          switch (wholesaleData200g.costPlusPricingMethod200gWholesale) {
            case 'Fixed Percentage Markup':
            case 'Desired Profit Margin':
              price = cost * (1 + parseFloat(wholesaleData200g.multiplier200gWholesale));
              break;
            case 'Fixed Amount Markup':
              price = cost + parseFloat(wholesaleData200g.multiplier200gWholesale);
              break;
            case 'Keystone Pricing (100% Markup)':
              price = cost * 2;
              break;
            default:
              price = cost;
          }
          wholesaleData200g.wholesalePrice200g = price.toFixed(2);
        }

        // Apply discount
        if (wholesaleData200g.discountPercentage200gWholesale) {
          wholesaleData200g.wholesalePrice200g = applyDiscount(
            parseFloat(wholesaleData200g.wholesalePrice200g),
            parseFloat(wholesaleData200g.discountPercentage200gWholesale)
          ).toFixed(2);
        }
      }
    }

    const updatedProduct = await googleSheetsService.updateProductInPricesCalculator(tenantId, organizationId, id, mergedData);

    console.log('Data received in backend update route:', JSON.stringify(req.body, null, 2));

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};


// Helper function to apply discount
function applyDiscount(price, discountPercentage) {
  return price * (1 - (discountPercentage / 100));
}


// Helper function to calculate retail price
function calculateRetailPrice(cost, multiplier, discountPercentage) {
  const price = cost * multiplier;
  return applyDiscount(price, discountPercentage);
}


// v.2
function calculateWholesalePricesBackwards(cost, method, wholesalePrice1kg) {
  const methodKey = pricingMethodKeys[method] || method;
  let multiplier1kgWholesale;

  switch (methodKey) {
    case 'markupPercentage':
    case 'desiredProfit':
      multiplier1kgWholesale = (wholesalePrice1kg / cost) - 1;
      break;
    case 'markupAmount':
      multiplier1kgWholesale = wholesalePrice1kg - cost;
      break;
    case 'keystone':
      multiplier1kgWholesale = 1; // Always 100% for keystone pricing
      break;
    default:
      throw new Error('Invalid pricing method for backwards calculation');
  }

  return {
    wholesalePrice1kg: parseFloat(wholesalePrice1kg),
    wholesalePriceTier1: parseFloat((cost + (multiplier1kgWholesale * cost * 0.85)).toFixed(2)),
    wholesalePriceTier2: parseFloat((cost + (multiplier1kgWholesale * cost * 0.90)).toFixed(2)),
    wholesalePriceTier3: parseFloat((cost + (multiplier1kgWholesale * cost * 0.95)).toFixed(2)),
    multiplier1kgWholesale: parseFloat(multiplier1kgWholesale.toFixed(4))
  };
}

exports.deleteProducts = async (req, res) => {
  console.log('deleteProducts called');
  console.log('req.user:', req.user);
  console.log('req.tenantId:', req.tenantId);
  console.log('req.organizationId:', req.organizationId);

  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty array of IDs' });
    }

    await googleSheetsService.deleteProductsFromPricesCalculator(tenantId, organizationId, ids);
    res.status(200).json({ message: 'Products deleted successfully' });
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ message: 'Failed to delete products', error: error.message });
  }
};
  
  
