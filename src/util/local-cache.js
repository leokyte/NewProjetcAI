// USER ACCOUNT
let _userAccount;

export const getUID = () => {
    return _userAccount.user.uid;
};

export const getAID = () => {
    return _userAccount.account._id;
};

export const getDID = () => {
    return _userAccount.did;
};

export const getOwnerUID = () => {
    return _userAccount.account.ownerUid;
};


export const getUserName = () => {
    return { name: _userAccount.user.displayName };
};

export const setUserAccountCache = (userAccount) => {
    _userAccount = userAccount;
};

export const getUserAccountCache = () => _userAccount;

export const getUserAccountIds = () => {
    const { user, store, account, did } = _userAccount;
    return { uid: user.uid, sid: store._id, aid: account._id, did: did ? did.toString() : '' };
};
