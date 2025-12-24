GameGlobal.URLSearchParams = class { };

console.log(`wx.env.USER_DATA_PATH = ${ wx.env.USER_DATA_PATH }`);
console.log('wx.getAccountInfoSync()', wx.getAccountInfoSync());

require('./dist/index');