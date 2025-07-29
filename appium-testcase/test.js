const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

const capabilities = {
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "emulator-5554",
  "appium:platformName": "Android",
  "appium:platformVersion": "13",
  "appium:app": "C:\\Users\\VC\\Downloads\\application-be52d262-fe1e-45c9-b5b1-f56efbdd65cc.apk",
  "appium:autoGrantPermissions": true,
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  path: '/',
  capabilities,
};

async function runTest() {
  const driver = await remote(wdOpts);
  //Enter code Before start the server
  let code = 'eyJ3YWxsZXRJZCI6IjA2NGM1ZGNjLWRkMWYtNDM1Yy1hZjc1LTVlYzUwMWU3Y2EyOSIsIndhbGxldEtleSI6IjVjMWU2MjdhLTFkZGMtNDI3Zi05M2I0LTQ5NGViMzI3ZmQ2MyIsImVtYWlsIjoiaGVtYS5sYXRoYUBicm9hZGNvbS5jb20iLCJjbGllbnRJRCI6IjI4N2JhMjI1LWRlMDctNGZlNy05YmNkLWRkMzI3YmVhYjhlZCIsInVzZXJJZCI6IjQ4MmIyYTJiLThjNzAtNGNkYy05MzRmLTA2MDdlMDQ0ODA4NCIsIkNsaWVudFRlbmFudE5hbWUiOiJzeXN0ZW0iLCJ0ZW5hbnROYW1lIjoiZGVmYXVsdCIsImFwaVVybCI6Imh0dHBzOi8vdmw4OTA5ODItZGV2LWZicGwyLnNzcGRldi5kZXYuYnJvYWRjb20uY29tL2RlZmF1bHQvIn0='
  let usernameVal = 'hemalatha'
  let passwordVal = 'Test@123'


  try {
    // await driver.getPageSource()
    const titleElement = await driver.$('android=new UiSelector().text("Configure Wallet")');
    const isDisplayed = await titleElement.isDisplayed();
    await driver.pause(5000);
    if (isDisplayed) {
      const inputField = await driver.$('android=new UiSelector().text("Enter the QR Code from Self Service Console.")');
      const isInputFieldDisplayed = await inputField.isDisplayed()
      if (isInputFieldDisplayed) {
        const QrCodeInput = await driver.$('//android.widget.EditText[@text="john@doe.com"]');
        await QrCodeInput.clearValue();
        await QrCodeInput.setValue(code);
        console.log('Entered QR code successfully');
        await driver.pause(3000);
        // Click the button
        const button = await driver.$('//android.widget.TextView[@text="Configue"]');
        await button.click();
        await driver.pause(3000);
      } else {
        console.log('Input field not visible');
      }

    } else {
      console.log("Its not displayed")
    }

    await driver.pause(3000);
    const loginHeader = await driver.$('android=new UiSelector().text("Connecting to WalletClient")');
    const isloginHeaderDisplayed = await loginHeader.isDisplayed()
    if (isloginHeaderDisplayed) {
      const usernameLable = await driver.$('//android.view.View[@text="Username"]');
      const isUsernameLableDisplayed = await usernameLable.isDisplayed()
      if (isUsernameLableDisplayed) {
        const usernameInput = await driver.$('android=new UiSelector().resourceId("usernameInput")')
        await usernameInput.clearValue();
        await usernameInput.setValue(usernameVal);
        console.log('Entered Username successfully');
        await driver.pause(3000);
        // Click the next button
        await driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()')
        const nextButton = await driver.$('//android.widget.Button[@text="Next"]');
        await nextButton.click();
        await driver.pause(3000);
        const passwordLable = await driver.$('android=new UiSelector().text("Password")')
        const isPasswordLableDisplayed = await passwordLable.isDisplayed()
        if (isPasswordLableDisplayed) {
          const usernameInput = await driver.$('android=new UiSelector().resourceId("passwordInput")')
          await usernameInput.clearValue();
          await usernameInput.setValue(passwordVal);
          console.log('Entered Password successfully');
          await driver.pause(3000);
          // Click the signin button
          await driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()')
          const sigInButton = await driver.$('//android.widget.Button[@text="Sign In"]');
          await sigInButton.click();
          await driver.pause(3000);
        } else {
          await driver.pause(4000);
          console.log('Password Input field not visible');
          console.error('Test error:', err);
        }
      } else {
        await driver.pause(4000);
        console.log('Username Input field not visible');
        console.error('Test error:', err);
      }
      await driver.pause(3000);
      const SignInHeader = await driver.$('//android.widget.TextView[@text="Welcome!"]');
      const isSignInHeaderDisplayed = await SignInHeader.isDisplayed()
      if (isSignInHeaderDisplayed) {
        const passwordInput = await driver.$('android=new UiSelector().text("Wallet Password")')
        await passwordInput.clearValue();
        await passwordInput.setValue(passwordVal);
        console.log('Entered Password successfully');
        // Click the signin button
        const sigInButton = await driver.$('android=new UiSelector().text("Sign In")');
        await sigInButton.click();
        await driver.pause(1000);
        console.log('Wallet Logged In successfully');
      } else {
        console.log('Password Input field not visible');
        console.error('Test error:', err);
      }
      await driver.pause(3000);
      const homeHeader = await driver.$('android=new UiSelector().text("Authenticator")');
      const isHomeDisplayed = await homeHeader.isDisplayed();
      // const homeEmailDisplayed = await driver.$('android=new UiSelector().text("hema.latha@broadcom.com")');
      // const ishomeEmailDisplayed = await homeEmailDisplayed.isDisplayed();
      if (isHomeDisplayed) {
        const allTab = await driver.$('android=new UiSelector().text("All")');
        const isAllTabDisplayed = await allTab.isDisplayed();
        const idpTab = await driver.$('android=new UiSelector().text("IdP")');
        const isIdpTabDisplayed = await idpTab.isDisplayed();
        await idpTab.click()
        await driver.pause(3000)
        const serviceAccountTab = await driver.$('android=new UiSelector().text("My Service Accounts")');
        const isServiceAccountTabDisplayed = await serviceAccountTab.isDisplayed();
        await serviceAccountTab.click()
        await driver.pause(3000)
        await idpTab.click()
        await driver.pause(3000)
        if (isAllTabDisplayed && isIdpTabDisplayed && isServiceAccountTabDisplayed) {
          const idpCredential = await driver.$('//android.view.ViewGroup[@content-desc="Username: hemalatha, Identity Type : IdP"]/android.view.ViewGroup/android.view.ViewGroup');
          const isIdpCredentialDisplayed = await idpCredential.isDisplayed();
          console.log('IDP Credentials visible successfully');
          if (isIdpCredentialDisplayed) {
            await idpCredential.click();
            await driver.pause(3000);
            const credentialInfo = await driver.$('//android.widget.TextView[@text="Credential Information"]')
            await credentialInfo.isDisplayed();
            await driver.pause(3000);
            const backToHome = await driver.$('//android.widget.ImageButton[@content-desc="Navigate up"]')
            await backToHome.isDisplayed();
            await backToHome.click();
            await driver.pause(3000);
            await homeHeader.isDisplayed();
          } else {
            console.log('IDP Credentials not visible');
            console.error('Test error IDP Credentials:', err);
          }
        } else {
          console.log('Tabs not visible');
          console.error('Test error Tabs:', err);
        }

        await driver.pause(3000);

        const syncBtn = await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(10)')
        const isSyncBtmDisplayed = syncBtn.isDisplayed()
        if (isSyncBtmDisplayed) {
          const syncBtnClick = await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(10)')
          await syncBtnClick.click();
          await driver.pause(3000)
          const syncSuccessAlert = await driver.$('android=new UiSelector().resourceId("com.broadcom.ssp.wallet:id/alert_title")')
          const isSyncSuccess = await syncSuccessAlert.isDisplayed();
          if (isSyncSuccess) {
            const syncSuccessOk = await driver.$('//android.widget.Button[@resource-id="android:id/button1"]')
            await syncSuccessOk.isDisplayed()
            await driver.pause(3000)
            await syncSuccessOk.click();
            await homeHeader.isDisplayed();
            await driver.pause(3000)
          }
        } else {
          console.log('Sync not visible');
          console.error('Test error Tabs:', err);
        }
      }
    }
  } catch (err) {
    await driver.pause(4000);
    console.error('Test error:', err);
  } finally {
    await driver.pause(8000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);
