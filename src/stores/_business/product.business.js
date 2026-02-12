export const getVirtualStockReservedByItems = (itemsProducts, isSaleCancelled) => {
    const productsStockReserved = itemsProducts.filter(i => !!i.product && !!i.product.stock)
        .map(({ product, item }) => getVirtualStockReservedByProduct(product, item, isSaleCancelled));

    return productsStockReserved;
};

const getVirtualStockReservedByProduct = (product, item, isSaleCancelled) => {
    const productStockReserved = { id: product.id, virtual: { stockReserved: setNewVirtualStock(product, item, isSaleCancelled) } };
    return productStockReserved;
};

const setNewVirtualStock = (product, item, isSaleCancelled) => {
    const currentStockReserved = product.virtual ? product.virtual.stockReserved : 0;    
    const quantity = item.product.isFractioned ? item.fraction : item.amount;
    const stockReserved = isSaleCancelled ? currentStockReserved + quantity : currentStockReserved - quantity;    
    
    return stockReserved;
};
