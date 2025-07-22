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
};

const wdOpts = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    logLevel: 'info',
    capabilities,
};


async function testQRScanner(driver) {

    // Wait for scanner to be ready
    await driver.pause(3000);
    const walletScreen = await driver.$('//*[@text="scan-qr"]');
    await walletScreen.waitForDisplayed({ timeout: 5000 });

    // // // ✅ Push QR Code image to Android gallery
    // // const imagePath = path.resolve(__dirname, './qrcode.png');
    // // const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    // // await driver.pushFile('/sdcard/Pictures/qrcode.png', imageBase64);
    // // console.log('✅ QR image pushed to device');

    // // Wait to allow app to react to the QR scan
    // await driver.pause(3000);

    // // ✅ Simulate QR scan data being decoded and stored
    // const qrData = {
    //   walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
    //   walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
    //   email: "hema.latha@broadcom.com",
    //   userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
    //   clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
    //   ClientTenantName: "system",
    //   tenantName: "default",
    //   apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
    // };
    // await driver.pushFile(
    //   '/sdcard/Download/fakeQrData.json',
    //   Buffer.from(JSON.stringify(qrData)).toString()
    // );
    // console.log('✅ Simulated QR data injected');

    // await driver.pause(3000);

    // // Pull and verify
    // const pulled = await driver.pullFile('/sdcard/Download/fakeQrData.json');
    // const decoded = Buffer.from(pulled, 'base64').toString('utf8');
    // console.log('✅ File contents:', decoded);

    // const nextScreenTitle = await driver.$('~Authenticator');
    // await nextScreenTitle.waitForDisplayed({ timeout: 5000 });

    // // Assert something on the new screen
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

async function testQRScanners(driver) {
    // 1. Wait for the app to load
    await driver.pause(3000);

    // 2. Switch to WebView context
    const contexts = await driver.getContexts();
    const webviewContext = contexts.find(c => c.includes('WEBVIEW'));
    if (!webviewContext) throw new Error('❌ WebView context not found');

    await driver.switchContext(webviewContext);
    console.log('✅ Switched to WebView');

    // 3. Define the full data set
    const localStorageData = {
        tenantInfo: {
            walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
            walletKey: "bc3ae293-5f1f-4f65-9911-541a883748d7",
            email: "hema.latha@broadcom.com",
            userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
            clientID: "9caaa2a8-0ea8-42ad-bedd-427bc3c9d415",
            ClientTenantName: "system",
            tenantName: "default",
            apiUrl: "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default/"
        },
        userInfo: {
            userId: "1fafa8b8-cbaa-4fe3-9456-c074f24abac4",
            userRole: "",
            tenantId: "aac45c33-f917-4ad0-b7b3-f46e6efc85ca",
            orgId: "",
            walletId: "9e743572-49dc-444c-a211-68ab6a8df6cf",
            holderDid: "",
            credentialCount: 0,
            secretKey: "",
            code: 200,
            status: "Success",
            message: "Wallet successfully registered",
            email: "hema.latha@broadcom.com"
        },
        token: "dummy_token",
        idToken: "dummy_idtoken",
        registerStatus: "success"
    };

    // 4. Store each key-value pair into localStorage
    await driver.executeAsync((data, done) => {
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
        done();
    }, localStorageData);
    console.log('✅ All data stored in localStorage');

    // 5. Navigate to /home
    await driver.execute('window.location.href = "/home"');
    console.log('🚀 Navigated to /home');

    await driver.pause(3000);

    // 6. Verify home screen
    const homeTitle = await driver.$('h1=Home'); // Change this selector to match your actual screen
    await homeTitle.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Home page is displayed');
}

async function testNewScanning(driver) {
    // Wait for scanner to be ready
    await driver.pause(3000);
    const walletScreen = await driver.$('//*[@text="scan-qr"]');
    await walletScreen.waitForDisplayed({ timeout: 5000 });

    // ✅ Push QR Code image to Android gallery
    const imagePath = path.resolve(__dirname, './qrcode.png');
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    await driver.pushFile('/sdcard/Pictures/qrcode.png', imageBase64);
    console.log('✅ QR image pushed to device');

    // Wait to allow app to react to the QR scan
    await driver.pause(3000);

    // // Step 3: Inject QR code image into emulator camera
    // const { exec } = require('child_process');
    // const injectCommand = `adb emu camera inject-image ${imagePath}`;

    // await new Promise((resolve, reject) => {
    //   exec(injectCommand, (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Camera injection failed: ${stderr}`);
    //       return reject(error);
    //     }
    //     console.log('QR image injected into emulator camera.');
    //     resolve();
    //   });
    // });

    await driver.execute('mobile: shell', {
        command: 'am',
        args: [
            'broadcast',
            '-a',
            'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
            '-d',
            'file:///sdcard/Pictures/qrcode.png',
        ],
    });

    // Step 4: Verify scan result
    const resultText = await driver.$('~scan-qr'); // Replace with your locator
    await expect(resultText).toHaveTextContaining('ExpectedQRCodeValue');


    // // Step 4: Wait for scan result (change selector as per your app)
    // const resultElement = await driver.$('~scan-qr');
    // await resultElement.waitForDisplayed({ timeout: 5000 });

    // const resultText = await resultElement.getText();
    // console.log('QR Scan Result:', resultText);

}


async function runTest() {
    const driver = await remote(wdOpts);
    try {
        console.log("Running test: Allow Notification");
        // await testCreateWallet(driver);
        await testQRScanner(driver)
        // await testNewScanning(driver)
        console.log("Running test: Resister Wallet");
        // await testWallet(driver)
    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await driver.pause(1000);
        await driver.deleteSession();
    }
}

runTest().catch(console.error);
