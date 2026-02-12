import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

import {
  refFirestoreCollection,
  refFirestoreCollectionAccount,
  firestoreDoc,
  firestoreUpdateDoc,
} from './../integrations';


// require('firebase/firestore');

const ROOT_USER_COLLECTION = 'users';
const COLLECTION = 'notifications';

export const subscribeUserReceiveNotification = (cbReceive) => {
  notificationUserCollection()
    .where('read', '==', false)
    .onSnapshot(snap => {
      if (snap.docs.length) {
        const notifications = snap.docs.map(d => {
          return { id: d.id, ...d.data() };
        });
        cbReceive(notifications);
      }
    });
};

export const setUserNotificationRead = (idNotification) => {
  const docRef = firestoreDoc(notificationUserCollection(), idNotification);
  firestoreUpdateDoc(docRef, { read: true });
};


export const subscribeAccountReceiveNotification = async (cbReceive, isFirstNotification, setIsFirstNotification) => {
  const dateExpiredInt = parseInt(moment().format('YYYYMMDD'));
  const deviceUniqueId = await DeviceInfo.getUniqueId();

  notificationAccountCollection()
    .where('dateExpiredInt', '>=', dateExpiredInt)
    .onSnapshot(snap => {
      const notificationsUnread = snap.docs.filter(n => !n.metadata.hasPendingWrites && n.data().deviceRead[deviceUniqueId] === undefined);
      if (!notificationsUnread.length) {
        setIsFirstNotification(false);
        return;
      }

      const notifications = notificationsUnread.map(d => {
        const data = d.data();
        const payload = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
        return { id: d.id, ...data, payload, options: data.options };
      });

      const hasNotificationToSetAsRead = isFirstNotification && notifications.filter(n => n.options && n.options.setAsReadFirstNotification);
      if (hasNotificationToSetAsRead) {
        const notificationsSetAsRead = notifications.filter(n => n.options && n.options.setAsReadFirstNotification);
        notificationsSetAsRead.forEach(n => setAccountNotificationRead(n.id));
        setIsFirstNotification(false);
        return cbReceive(notifications.filter(n => !n.options || !n.options.setAsReadFirstNotification));
      }

      return cbReceive(notifications);
    });
};


export const setAccountNotificationRead = async (idNotification) => {
  const deviceUniqueId = await DeviceInfo.getUniqueId();
  const docRef = firestoreDoc(notificationAccountCollection(), idNotification);
  await firestoreUpdateDoc(docRef, { [`deviceRead.${deviceUniqueId}`]: true });
};

const notificationAccountCollection = () => refFirestoreCollectionAccount(COLLECTION);
const notificationUserCollection = () => refFirestoreCollection(ROOT_USER_COLLECTION, COLLECTION);
