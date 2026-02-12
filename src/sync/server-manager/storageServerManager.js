import AsyncStorage from '@react-native-community/async-storage';
import { putStorageImage } from '../../integrations';
import { checkDeviceConnection } from '../../util';

const SYNC_STORAGE_KEY = 'sync-storage-62419';
const LIMIT_SYNC_ITEMS = 44;

let _syncItems = [];


export const initStorageServer = () => {
  AsyncStorage.getItem(SYNC_STORAGE_KEY).then(result => {
    _syncItems = result ? JSON.parse(result) : [];
    syncStorageItems();
  });
};

// SYNC UP
export const syncUpStorage = (document) => {
  const { aid, uid, id, image, gallery, variations } = document;
  if (image) addSyncItem(aid, uid, id, image);
  if (gallery && gallery.length) gallery.forEach(imageItem => addSyncItem(aid, uid, id, imageItem.url));
  if(variations && variations.length) {
    variations.forEach(variation => {
      variation?.options?.forEach(option => {
        if(option?.photos?.image) addSyncItem(aid, uid, id, option.photos.image);
      })
    });
  }
};

const addSyncItem = (aid, uid, id, image) => {
  if (hasSyncItem(image)) return;
  const syncItem = { aid, uid, id, image, isOk: false, retry: 0 };
  _syncItems.push(syncItem);
  AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(_syncItems));

  shootSyncItem(syncItem);
};

// cache / SHOOT

const syncStorageItems = async () => {
  const getConnectionInfo = await checkDeviceConnection();
  if (getConnectionInfo) {
    const updatedSyncItems = _syncItems.filter(s => !s.isOk);
    AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(updatedSyncItems), () => shootSyncItems(updatedSyncItems));
  }
};

const shootSyncItems = (syncItems) => {
  syncItems.slice(0, LIMIT_SYNC_ITEMS).forEach(shootSyncItem);
  if (syncItems.length > 44) {
    setTimeout(syncStorageItems, 30000);
  }
};

const shootSyncItem = (syncItem) => putStorageImage(syncItem, (image, error) => resolveCache(image, error));

const resolveCache = (image, error) => {
  const currentItem = _syncItems.find(s => s.image === image);
  currentItem.retry += 1;
  currentItem.isOk = !error;

  if (!error ||
    error.code === 'kyte/image-doesnt-exists-locally' ||
    error.code === 'kyte/image-already-uploaded'
  ) {
    const itemIndex = _syncItems.findIndex(s => s.image === image);
    _syncItems.splice(itemIndex, 1);
  }

  AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(_syncItems));
};


const hasSyncItem = (image) => _syncItems.some(s => s.image === image);
