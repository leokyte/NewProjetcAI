export const isFixedTax = (tax) => {
  return tax.typePercentFixed === 'fixed-tax';
};

export const receiptTaxesLabel = (tax) => {
  return `${tax.name}${!isFixedTax(tax) ? ` (${tax.percent}%)` : ''}: `;
};
