const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

const capabilities = {
  // platformName: 'Android',
  // 'appium:automationName': 'UiAutomator2',
  // 'appium:deviceName': 'emulator-5554',
  // 'appium:platformVersion':'13',
  // 'appium:appPackage': 'com.authnull.authenticator',
  // 'appium:appActivity': '.MainActivity', 
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "emulator-5554",
  // "appium:twcekjzx9xtwwg5t": "twcekjzx9xtwwg5t",
  "appium:platformName": "Android",
  "appium:platformVersion": "13",
  "appium:app": "C:\\Users\\VC\\Downloads\\passwordless Setup 1.1.7-964c1906-617a-47a1-8b73-4618346d0a61.apk",
  "appium:autoGrantPermissions": true,
  // 'appium:enableStorage': true,
  // 'appium:plugin:storage': {
  //   enabled: true
  // },
  // 'appium:plugins': {
  //   storage: {}
  // }
  "appium:plugins": {
    storage: {
      active: true
    }
  }

};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  path: '/',
  capabilities,

  services: [
    ['appium', {
      args: ['--use-plugins', 'storage'],
    }]
  ],

};

async function testQRScanner(driver) {

  // Wait for scanner to be ready
  await driver.pause(3000);
  const walletScreen = await driver.$('//*[@text="scan-qr"]');
  await walletScreen.waitForDisplayed({ timeout: 5000 });

  // const filePath = path.join(__dirname, 'mock-data.json');
  // const base64Data = fs.readFileSync(filePath, 'base64');

  // const response = await driver.execute('storage: put', {
  //   name: 'mock-data.json',
  //   data: base64Data,
  // });
  // console.log('📁 File stored at:', response);

  const qrData = {
    walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
    walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
    email: "hema.latha@broadcom.com",
    userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
    clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
    ClientTenantName: "system",
    tenantName: "default",
    apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
  };
  await driver.pushFile(
    '/sdcard/Download/fakeQrData.json',
    Buffer.from(JSON.stringify(qrData)).toString()
  );
  console.log('✅ Simulated QR data injected');

  await driver.pause(3000);

  // Pull and verify
  const pulled = await driver.pullFile('/sdcard/Download/fakeQrData.json');
  const decoded = Buffer.from(pulled, 'base64').toString('utf8');
  console.log('✅ File contents:', decoded);

  // const nextScreenTitle = await driver.$('~Authenticator');
  // await nextScreenTitle.waitForDisplayed({ timeout: 5000 });
  // Assert something on the new screen
  // expect(await nextScreenTitle.isDisplayed()).toBe(true);
  // if (await walletScreen.isDisplayed()) {
  //   console.log('🎉 QR scan succeeded. Wallet registration screen visible.');
  // } else {
  //   throw new Error('❌ QR scan failed or next screen not visible.');
  // }
  // await driver.switchContext({
  //   url: /.*my-app\/home/,
  //   androidWebviewConnectionRetryTime: 500,
  //   androidWebviewConnectTimeout: 7000,
  // });

}

async function injectAsyncStorageData(driver) {

  // const filePath = path.join(__dirname, './Asyncstorage.json');
  // const base64Data = fs.readFileSync(filePath, 'base64');

  // const targetPath = '/data/data/com.broadcom.ssp.wallet/files/react-native-async-storage/AsyncStorage.json';
  // await driver.pushFile(targetPath, base64Data);
  // console.log("✅ Mock AsyncStorage injected.");


  const jsonData = fs.readFileSync('./AsyncStorage.json', 'utf-8');


  // await driver.execute('storage: set', {
  //   path: 'react-native-async-storage/AsyncStorage.json',
  //   key: null,
  //   data: jsonData,
  // });
  // const result = await driver.execute('getSession');
  // console.log('🔍 Session info:', result);

  // await driver.execute('storage: set', [{
  //   path: 'react-native-async-storage/AsyncStorage.json',
  //   data: JSON.stringify({
  //     tenantInfo: JSON.stringify({
  //       walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
  //       walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
  //       email: "hema.latha@broadcom.com",
  //       userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
  //       clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
  //       ClientTenantName: "system",
  //       tenantName: "default",
  //       apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
  //     })
  //   })
  // }]);

  const asyncStorageJson = {
    tenantInfo: JSON.stringify({
      walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
      walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
      email: "hema.latha@broadcom.com",
      userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
      clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
      ClientTenantName: "system",
      tenantName: "default",
      apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
    })
  };

  // await driver.pushFile(
  //   '/data/data/com.broadcom.ssp.wallet/files/react-native-async-storage/AsyncStorage.json',
  //   Buffer.from(JSON.stringify(asyncStorageJson)).toString('base64')
  // );
  // console.log('✅ AsyncStorage mock data pushed to app directory');

  // console.log('✅ Mock AsyncStorage injected');

  const status = await driver.status();
  console.log('Appium Server Status:', status);


  try {
    await driver.execute('storage: set', [{
      path: 'react-native-async-storage/AsyncStorage.json',
      data: JSON.stringify(asyncStorageJson)
    }]);

    console.log('✅ AsyncStorage mock data injected successfully');
  } catch (err) {
    console.error('❌ Failed to inject mock data:', err);
  }

}

// async function storedata(driver) {
//   const mockData = {
//     tenantInfo: JSON.stringify({
//       walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
//       walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
//       email: "hema.latha@broadcom.com",
//       userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
//       clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
//       ClientTenantName: "system",
//       tenantName: "default",
//       apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
//     })
//   };

//   // Convert JSON to escaped string for shell
//   const jsonString = JSON.stringify(mockData).replace(/"/g, '\\"');

//   await driver.execute('mobile: shell', {
//     command: 'run-as',
//     args: [
//       'com.authnull.authenticator',
//       'sh', '-c',
//       `mkdir -p files/react-native-async-storage && echo "${jsonString}" > files/react-native-async-storage/AsyncStorage.json`
//     ],
//     includeStderr: true,
//   });

//   console.log('✅ Injected AsyncStorage data via run-as');

// }

async function runTest() {
  const driver = await remote(wdOpts);
  try {
    console.log("Running test: Allow Notification");
    const sessionId = driver.sessionId;
    console.log('Session ID:', sessionId);
    await driver.pause(4000);

    // await testQRScanner(driver)
    await injectAsyncStorageData(driver)
    await driver.pause(4000);

    console.log("Running test: Resister Wallet");
  } catch (err) {
    await driver.pause(4000);

    console.error('Test error:', err);
  } finally {
    await driver.pause(8000);
    // await driver.deleteSession();
  }
}

runTest().catch(console.error);
