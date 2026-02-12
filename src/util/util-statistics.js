function adaptReceipt(entry, totalReceived) {
	const receiptTotal = entry.totalReceived ?? entry.total
	const percentage = (receiptTotal / totalReceived) * 100
	const updatedItem = { ...entry, total: receiptTotal, avg: percentage }

	return updatedItem
}

/**
 * This functions applies service fee into receipts object.
 *
 * @param receiptsByDateReceived
 * @returns adaptedReceiptsByDateReceived
 */
export function adaptReceiptsByDateReceived(receiptsByDateReceived) {
	const total = receiptsByDateReceived.reduce((acc, item) => (item.totalReceived ?? item.total) + acc, 0)

	const adaptedReceiptsByDateReceived = receiptsByDateReceived.map((receipt) => {
		const updatedItems = receipt.items.map((item) => adaptReceipt(item, total))
		const updatedReceipt = { ...adaptReceipt(receipt, total), items: updatedItems }

		return updatedReceipt
	})

	return adaptedReceiptsByDateReceived
}

export default { adaptReceiptsByDateReceived }
