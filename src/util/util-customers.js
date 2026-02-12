export const calcTotalBalance = (customers) => {
  let debit = 0;
  let credit = 0;

  customers.forEach((c) => {
    if (c.accountBalance > 0) credit += c.accountBalance;
    else if (c.accountBalance < 0) debit += c.accountBalance;
  });

  return { debit, credit };
};
