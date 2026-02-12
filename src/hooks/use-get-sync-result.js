import { useEffect, useState } from 'react'

const useGetSyncResult = (syncDownResult) => {
	const [data, setData] = useState({
		hasProduct: false,
		hasOpenedSales: false,
		hasClosedSales: false,
		hasCategories: false,
		hasCustomers: false,
	})

	useEffect(() => {
		setData({
			hasProduct: !!syncDownResult?.syncDownResultDocuments?.hasProduct,
			hasOpenedSales: !!syncDownResult?.syncDownResultDocuments?.hasOpenedSales,
			hasClosedSales: !!syncDownResult?.syncDownResultDocuments?.hasClosedSales,
			hasCategories: !!syncDownResult?.syncDownResultDocuments?.hasCategories,
			hasCustomers: !!syncDownResult?.syncDownResultDocuments?.hasCustomers,
		})
	}, [syncDownResult])

	return data
}

export { useGetSyncResult }
