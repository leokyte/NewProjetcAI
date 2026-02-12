import { fetchByAIDWithFilter, fetchOneByUID, filterAID, fetch, PRODUCT, SALE, CUSTOMER, STORE } from './repository';
import models from './models.js';
import { getUID } from "../util";

export const totalLocalData = () => {
  const totalSale = fetchByAIDWithFilter(SALE).length;
  const totalProduct = fetchByAIDWithFilter(PRODUCT).length;
  const totalCustomer = fetchByAIDWithFilter(CUSTOMER).length;
  return { totalSale, totalProduct, totalCustomer };
};

export const getMyDocumentsWithImage = () => new Promise(resolve => {
    let documentsWithImage = [];
    fetch(PRODUCT).then(products => {
      documentsWithImage = products.filter(p => !!p.image && p.uid === getUID()) || [];
      fetchOneByUID(STORE).then(store => {
        if (store && store.image) {
          documentsWithImage.push(store);
        }
        resolve(documentsWithImage);
      });
    });
  });


export const getAllDocumentsWithImage = () => new Promise(resolve => {
    let documentsWithImage = [];
    fetch(PRODUCT).then(products => {
      documentsWithImage = products.filter(p => !!p.image) || [];
      fetchOneByUID(STORE).then(store => {
        if (store && store.image) {
          documentsWithImage.push(store);
        }
        resolve(documentsWithImage);
      });
    });
  });

export const getProductByCode = (code) => {
  // call Realm
  const products = models.objects(PRODUCT)
                    .filtered('active = true')
                    .filtered(filterAID())
                    .filtered(`code = "${code}" OR variants.code = "${code}"`);
  
  // Format and return
  if (products.length) {
    const product = JSON.parse(JSON.stringify(products[0]));
    
    if (product?.variants?.length > 0) {
      const variant = product.variants.find(item => item.code === code)
      return variant
        ? { ...variant, id: variant._id }
        : null;
    }

    return product;
  };

  // If no match is found, return null
  return null;
};
