import _ from 'lodash';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';

import { getUID } from '../../util';

import { PRODUCT, SALE } from '../../repository';
import {
  refFirestoreCollectionAccount,
  firestoreCreateBatch,
  firestoreServerTimestamp,
  firestoreDoc,
  firestoreSetDoc,
  firestoreUpdateDoc,
} from '../../integrations';

const DOCUMENT_COLLECTION = 'documents';

const IGNORE_UPDATED_FIELDS = ['virtual', 'stock', 'stockActive', 'accountBalance'];

export const syncUpDocument = async (modelName, document, isUpdated) => {
  const updateDoc = isUpdated && (modelName === SALE || modelName === PRODUCT);
  const deviceUniqueId = DeviceInfo.getUniqueId();
  const mountDocumentServer = setDocumentServer(modelName, document, isUpdated);
  const documentServer = {
    ...mountDocumentServer,
    metadata: { ...mountDocumentServer.metadata, deviceId: deviceUniqueId },
  };

  if (updateDoc) return updateFirebaseDoc(document.id, documentServer, modelName);

  try {
    const documentRef = firestoreDoc(refDocumentsAccountCollection(), document.id);
    firestoreSetDoc(documentRef, documentServer, { merge: true })
      .catch((ex) => loggerSyncUpException(ex, modelName, document));
  } catch (error) {
    if (__DEV__) {
      console.tron.logImportant('firestore: ', error);
    }
  }
};

const updateFirebaseDoc = async (id, document, modelName) => {
  try {
    const keyValueArray = [];

    const refDocument = firestoreDoc(refDocumentsAccountCollection(), id);

    Object.entries(document.data).forEach(([key, value]) => {
      keyValueArray.push(...[`data.${key}`, value]);
    });

    await firestoreUpdateDoc(refDocument, ...keyValueArray, 'metadata', document.metadata);
  } catch (error) {
    loggerSyncUpException(error, modelName, document);
  }
};

const loggerSyncUpException = (ex, modelName, document) => {
  // TODO: log this error in somewhere
};

export const syncUpManyDocument = async (modelName, data) => {
  const dataChunk = _.chunk(data, 400);
  const deviceUniqueId = await DeviceInfo.getUniqueId();

  dataChunk.forEach((documents) => {
    const batch = firestoreCreateBatch();
    documents.forEach((document) => {
      const mountDocumentServer = setDocumentServer(modelName, document);
      const documentServer = {
        ...mountDocumentServer,
        metadata: { ...mountDocumentServer.metadata, deviceId: deviceUniqueId },
      };
      const documentRef = firestoreDoc(refDocumentsAccountCollection(), document.id);
      batch.set(documentRef, documentServer);
    });
    batch.commit();
  });
};

const setDocumentServer = (modelName, document, isUpdated) => {
  let data;
  try {
    data = { ...document.toJSON() };
  } catch (ex) {
    data = { ...document };
  }

  if (isUpdated) IGNORE_UPDATED_FIELDS.forEach((f) => delete data[f]);

  return {
    metadata: {
      model: modelName,
      originUID: getUID(),
      dinc: firestoreServerTimestamp(),
      timezone: RNLocalize.getTimeZone(),
    },
    data,
  };
};

const refDocumentsAccountCollection = () => refFirestoreCollectionAccount(DOCUMENT_COLLECTION);
