import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData };
      const keys = name.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Overlay>
      <EditFormContainer>
        <FormTitle>Edit Product: {product.coffeeProduct}</FormTitle>
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
                  <EditProductFormLabel>
                    Green Coffee Price
                  </EditProductFormLabel>
                  <StyledInput
                    name="greenCoffeePrice"
                    value={formData.greenCoffeePrice}
                    onChange={handleChange}
                    type="number"
                  />
                </FormGroupProduct>
                <FormGroupProduct>
                  <EditProductFormLabel>
                    Delivery Cost per 1kg
                  </EditProductFormLabel>
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
                  <EditProductFormLabel>
                    Packaging Unit Price
                  </EditProductFormLabel>
                  <StyledInput
                    name="packagingUnitPrice"
                    value={formData.packagingUnitPrice}
                    onChange={handleChange}
                    type="number"
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
                      <EditProductFormLabel>
                        Cost-plus Pricing Method
                      </EditProductFormLabel>
                      <StyledSelect
                        name={`retailPricing.${type}.costPlusPricingMethod`}
                        value={
                          formData.retailPricing?.[type]
                            ?.costPlusPricingMethod || ""
                        }
                        onChange={handleChange}
                      >
                        <option value="Fixed Percentage Markup">
                          Fixed Percentage Markup
                        </option>
                        <option value="Fixed Amount Markup">
                          Fixed Amount Markup
                        </option>
                        <option value="Desired Profit Margin">
                          Desired Profit Margin
                        </option>
                        <option value="Keystone Pricing">
                          Keystone Pricing (100% Markup)
                        </option>
                      </StyledSelect>
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>
                        Multiplier
                      </EditProductFormLabel>
                      <EditFormStyledInput
                        name={`retailPricing.${type}.multiplier`}
                        value={formData.retailPricing?.[type]?.multiplier || ""}
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Discount %</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`retailPricing.${type}.discountPercentage`}
                        value={
                          formData.retailPricing?.[type]?.discountPercentage ||
                          ""
                        }
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>
                        Retail {type} Price
                      </EditProductFormLabel>
                      <StyledInput
                        name={`retailPricing.${type}.retailPrice`}
                        value={
                          formData.retailPricing?.[type]?.retailPrice || ""
                        }
                        onChange={handleChange}
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
                  { key: "tier1", label: "1kg Tier 1 (75KG+)" },
                  { key: "tier2", label: "1kg Tier 2 (20-75kg)" },
                  { key: "tier3", label: "1kg Tier 3 (1-20kg)" },
                ].map((item, index) => (
                  <FormRow key={item.key}>
                    <RowLabel>{item.label}:</RowLabel>
                    <FormGroupPrices>
                      <EditProductFormLabel>Cost-plus Pricing Method</EditProductFormLabel>
                      <StyledSelect
                        name={`wholesalePricing.${item.key}.costPlusPricingMethod`}
                        value={
                          formData.wholesalePricing?.[item.key]
                            ?.costPlusPricingMethod || ""
                        }
                        onChange={handleChange}
                      >
                        <option value="Fixed Percentage Markup">
                          Fixed Percentage Markup
                        </option>
                        <option value="Fixed Amount Markup">
                          Fixed Amount Markup
                        </option>
                        <option value="Desired Profit Margin">
                          Desired Profit Margin
                        </option>
                        <option value="Keystone Pricing">
                          Keystone Pricing (100% Markup)
                        </option>
                      </StyledSelect>
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>
                        Multiplier
                      </EditProductFormLabel>
                      <EditFormStyledInput
                        name={`wholesalePricing.${item.key}.multiplier`}
                        value={
                          formData.wholesalePricing?.[item.key]?.multiplier ||
                          ""
                        }
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>Discount %</EditProductFormLabel>
                      <EditFormStyledInput
                        name={`wholesalePricing.${item.key}.discountPercentage`}
                        value={
                          formData.wholesalePricing?.[item.key]
                            ?.discountPercentage || ""
                        }
                        onChange={handleChange}
                        type="number"
                      />
                    </FormGroupPrices>
                    <FormGroupPrices>
                      <EditProductFormLabel>
                        {index === 0
                          ? "Wholesale 200g Price"
                          : index === 1
                          ? "Wholesale List 1kg Price"
                          : `Wholesale Tier ${index - 1} Price`}
                      </EditProductFormLabel>
                      <StyledInput
                        name={`wholesalePricing.${item.key}.${
                          index === 1 ? "wholesaleListPrice" : "wholesalePrice"
                        }`}
                        value={
                          formData.wholesalePricing?.[item.key]?.[
                            index === 1
                              ? "wholesaleListPrice"
                              : "wholesalePrice"
                          ] || ""
                        }
                        onChange={handleChange}
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
