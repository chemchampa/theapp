const googleSheetsService = require('../services/googleSheetsService');

const pricingMethodKeys = {
  "Fixed Percentage Markup": "markupPercentage",
  "Fixed Amount Markup": "markupAmount",
  "Desired Profit Margin": "desiredProfit",
  "Keystone Pricing (100% Markup)": "keystone",
  // "Tiered Markup Based on Cost": "tiered"
};

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


exports.getAllProducts = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    console.log('req.tenantId:', req.tenantId);
    console.log('req.organizationId:', req.organizationId);
    
    const products = await googleSheetsService.getPricesCalculatorData(req.tenantId, req.organizationId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// v.6 - this is working now althoguh with that intermediate state
exports.updateProduct = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const organizationId = req.organizationId;
    const { id } = req.params;
    const updatedData = req.body;

    console.log('tenantId:', tenantId, 'organizationId:', organizationId);
    console.log('Received update request for ID:', id);
    console.log('Updated data:', updatedData);

    if (!id) {
      throw new Error('No ID provided for update');
    }

    // Validate and ensure necessary fields
    if (!updatedData.packed1kgCost || isNaN(parseFloat(updatedData.packed1kgCost))) {
      throw new Error('Invalid or missing packed1kgCost');
    }
    if (!updatedData.costPlusPricing) {
      throw new Error('Invalid or missing costPlusPricing method');
    }

    let recalculatedPrices = null;

    // Determine recalculations based on the updated field
    if (updatedData.recalculateWholesale) {
      if (updatedData.wholesale1kgPrice !== undefined) {
        recalculatedPrices = calculateWholesalePricesBackwards(
          parseFloat(updatedData.packed1kgCost),
          updatedData.costPlusPricing,
          parseFloat(updatedData.wholesale1kgPrice)
        );
        updatedData.controller = recalculatedPrices.controller.toFixed(2);
      } else if (updatedData.controller !== undefined) {
        recalculatedPrices = calculateWholesalePrices(
          parseFloat(updatedData.packed1kgCost),
          updatedData.costPlusPricing,
          updatedData.controller
        );
      }
    } else if (updatedData.costPlusPricing) {
      recalculatedPrices = calculateWholesalePrices(
        parseFloat(updatedData.packed1kgCost),
        updatedData.costPlusPricing,
        updatedData.controller
      );
    }

    if (recalculatedPrices) {
      updatedData.wholesale1kgPrice = recalculatedPrices.wholesale1kgPrice.toFixed(2);
      updatedData.wholesaleTier1 = recalculatedPrices.wholesaleTier1.toFixed(2);
      updatedData.wholesaleTier2 = recalculatedPrices.wholesaleTier2.toFixed(2);
      updatedData.wholesaleTier3 = recalculatedPrices.wholesaleTier3.toFixed(2);
    }

    const updatedProduct = await googleSheetsService.updateProductInPricesCalculator(tenantId, organizationId, id, updatedData);

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

function calculateWholesalePricesBackwards(cost, method, wholesale1kgPrice) {
  const methodKey = pricingMethodKeys[method] || method;
  let controller;

  switch (methodKey) {
    case 'markupPercentage':
    case 'desiredProfit':
      controller = (wholesale1kgPrice / cost) - 1;
      break;
    case 'markupAmount':
      controller = wholesale1kgPrice - cost;
      break;
    case 'keystone':
      controller = 1; // Always 100% for keystone pricing
      break;
    default:
      throw new Error('Invalid pricing method for backwards calculation');
  }

  return {
    wholesale1kgPrice: parseFloat(wholesale1kgPrice),
    wholesaleTier1: parseFloat((cost + (controller * cost * 0.85)).toFixed(2)),
    wholesaleTier2: parseFloat((cost + (controller * cost * 0.90)).toFixed(2)),
    wholesaleTier3: parseFloat((cost + (controller * cost * 0.95)).toFixed(2)),
    controller: parseFloat(controller.toFixed(4))
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
  
  
