function simplifyDebts(balances) {
  // Step 1: split people into two lists
  const creditors = []; // should receive money
  const debtors = [];   // should pay money

  const ids = Object.keys(balances);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const amount = balances[id];

    if (amount > 0) {
      creditors.push({ id: id, amount: amount });
    } else if (amount < 0) {
      debtors.push({ id: id, amount: -amount }); // make it positive
    }
  }

   const payments = [];

  while (creditors.length > 0 && debtors.length > 0) {
    // biggest amount first
    creditors.sort(function (a, b) { return b.amount - a.amount; });
    debtors.sort(function (a, b) { return b.amount - a.amount; });

    const creditor = creditors[0];
    const debtor = debtors[0];

    // payment is the smaller of the two amounts
    let paymentAmount = creditor.amount;
    if (debtor.amount < paymentAmount) {
      paymentAmount = debtor.amount;
    }

    payments.push({ from: debtor.id, to: creditor.id, amount: paymentAmount });

    creditor.amount = creditor.amount - paymentAmount;
    debtor.amount = debtor.amount - paymentAmount;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();

     }

  return payments;
}

module.exports = simplifyDebts;
