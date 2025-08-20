const { remote } = require("webdriverio");
const path = require("path");
const axios = require("axios");

const capabilities = {
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "emulator-5554",
  "appium:platformName": "Android",
  "appium:platformVersion": "14",
  "appium:app":
    "C:\\Users\\VC\\Downloads\\application-90dd3abc-dc29-40ae-995e-8cfac0a11ccf.apk",
  "appium:autoGrantPermissions": true,
  "appium:settings[shouldUseCompactResponses]": false,
  "appium:settings[includeNonModalElements]": true,
  "appium:showSemanticsInformation": true,
};

const iosCapability = {
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone15Pro_FaceID",
  "appium:platformName": "iOS",
  "appium:platformVersion": "18.5",
  "appium:app": "com.broadcom.ssp.wallet",
  "appium:settings[shouldUseCompactResponses]": false,
  "appium:settings[includeNonModalElements]": true,
  "appium:showSemanticsInformation": true,
};
const platform = process.env.PLATFORM;

console.log(platform, "platform");

const wdOpts = {
  hostname: process.env.APPIUM_HOST || "localhost",
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: "info",
  path: "/",
  capabilities: platform === "ios" ? iosCapability : capabilities,
};

let token = null;
let token_user_name = "hemalatha";
let token_password = "Test@123";
let qrCode = null;
let tenantUserInfo = null;
let policyId = null;
let searchVal = "hemalatha";

const BASEPATH = "https://vl890982-dev-fbpl2.sspdev.dev.broadcom.com/default";

const generateToken = () => {
  const clientID = "6cf96ef0-f63b-4428-bec5-fe8711afb1c2";
  const clientSecret = "4b483d2d-dc51-47f5-b149-17b6204d1ccd";
  const apiUrl = `${BASEPATH}/oauth2/v1/token`;
  const authString = `${clientID}:${clientSecret}`;
  const encodedAuth = btoa(authString);

  const body =
    "grant_type=client_credentials" +
    "&scope=" +
    encodeURIComponent("urn:iam:myscopes");
  axios
    .post(apiUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedAuth}`,
      },
    })
    .then(async (res) => {
      await console.log(res.data.access_token, "access token");
      accessToken = res.data.access_token;
      inititateAuth(accessToken);
    })
    .catch((err) => {
      console.error("Error fetching token:", err);
    });
};

const inititateAuth = (accessToken) => {
  const apiUrl = `${BASEPATH}/auth/v1/authenticate`;
  const payload = {
    channel: "web",
    subject: token_user_name,
    action: "authenticate",
    ipAddress: "10.10.123.124",
    acrValues: [],
  };
  axios
    .post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((res) => {
      console.log(res.data.flowState, "flow");
      const resData = res.data;
      inititateAuthPassword(accessToken, resData);
    })
    .catch((err) => {
      console.error("Error flow:", err);
    });
};

const inititateAuthPassword = (accessToken, resData) => {
  const apiUrl = `${BASEPATH}/factor/v1/PasswordAuthenticator`;
  const payload = {
    password: token_password,
  };
  axios
    .post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Flow-State": resData.flowState,
      },
    })
    .then((res) => {
      console.log(res);
      generateUserToken(res.data);
    })
    .catch((err) => {
      console.error("Error user password:", err);
    });
};

const generateUserToken = (res) => {
  let apiUrl = `${BASEPATH}/oauth2/v1/token`;
  const clientID = "a708d773-1017-4eb6-8bdc-abf6e15f2e90";
  const clientSecret = "b464a6ea-061e-400a-ab12-2b7251afd691";
  const authString = `${clientID}:${clientSecret}`;
  const encodedAuth = btoa(authString);

  const body =
    "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" +
    "&scope=" +
    encodeURIComponent("urn:iam:m.me") +
    `&assertion=${res.id_token}`;

  axios
    .post(apiUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedAuth}`,
      },
    })
    .then(async (res) => {
      await console.log(res.data, "user_access token");
      token = res.data.access_token;
      await fetchWalletClientId();
    })
    .catch((err) => {
      console.error("Error fetching token:", err);
    });
};

const fetchWalletClientId = () => {
  const apiUrl = `${BASEPATH}/me/v1/Settings`;
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res.data);
      const walletClientInfo = res.data;
      UserInfo(walletClientInfo);
      // createWallet(walletClientInfo)
    })
    .catch((err) => {
      console.log(err, "setting wallet error");
    });
};

// const UserInfo = (walletClientInfo) => {
//   const apiUrl = `${BASEPATH}/oauth2/v1/userinfo`;
//   axios
//     .get(apiUrl, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//     .then((res) => {
//       console.log(res.data, 'user_info');
//       let userInfo = res.data;
//       createWallet(walletClientInfo, userInfo);
//     })
//     .catch((err) => {
//       console.log(err, "setting wallet error");
//     });
// };

const UserInfo = (walletClientInfo) => {
  const apiUrl = `${BASEPATH}/oauth2/v1/userinfo`;
  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      // console.log(res.data, "userinfo");
      let userInfo = null;
      function parseJwt(token) {
        try {
          if (!token) throw new Error("No token provided");

          const base64Url = token.split(".")[1];
          if (!base64Url) throw new Error("Invalid token format");

          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );

          const parsed = JSON.parse(jsonPayload);
          console.log("User JSON:", parsed);

          return (userInfo = parsed);
        } catch (error) {
          console.error("JWT parsing failed:", error.message);
          return null;
        }
      }
      await parseJwt(res.data);

      await createWallet(walletClientInfo, userInfo);
    })
    .catch((err) => {
      console.log(err, "setting wallet error");
    });
};

const deleteWallet = () => {
  let payload = {
    walletId: tenantUserInfo.walletId,
    accountId: tenantUserInfo.userId,
  };
  const apiUrl = `${BASEPATH}/machineid/v1/me/wallet/api/DeleteWallet`;
  axios
    .post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log("Wallet Deleted Successfully");
    })
    .catch((err) => {
      console.log(err, "Delete wallet error");
    });
};

const deletePolicy = () => {
  let apiUrl = `${BASEPATH}/me/v1/Machine2MachinePolicies/${policyId}`;
  axios
    .delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log("Policy Deleted Successfully");
    })
    .catch((err) => {
      console.log(err, "Delete Policy error");
    });
};

const CreatePolicy = async () => {
  let apiUrl = `${BASEPATH}/me/v1/Machine2MachinePolicies`;
  let payload = {
    description: "Sample Machine2Machine policy testcase",
    status: "inactive",
    policyName: "Sample Machine2Machine policy",
    policyPriority: 1,
    startDate: "2025-08-04 00:00 AM UTC",
    endDate: "2025-08-30 00:00 PM UTC",
    tags: ["test"],
  };

  axios
    .post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then(async (response) => {
      console.log("policy data:", response.data);
      policyId = response.data.policyId;
      policyUpdate(response.data.policyId);
    })
    .catch((error) => {
      console.error("Error creating policy:", error);
    });
};

const policyUpdate = (id) => {
  let payload = {
    description: "Sample Machine2Machine policy testcase",
    status: "active",
    policyName: "Sample Machine2Machine policy",
    policyPriority: 1,
    startDate: "2025-08-04 00:00 AM UTC",
    endDate: "2025-08-30 00:00 PM UTC",
    tags: ["test"],
    rules: [
      {
        conditions: {
          serviceAccount: {
            operator: "in",
            value: ["dbbackup"],
          },
          principal: {
            user: {
              operator: "in",
              value: ["hemalatha"],
            },
          },
          sourceMachine: {
            hostFqdn: {
              operator: "in",
              value: ["test-VM-Machine 4o6tevivja"],
            },
            hostIp: {
              operator: "in",
              value: ["42.226.85.135"],
            },
          },
          destinationMachine: {
            hostFqdn: {
              operator: "not",
              value: ["test-vm-16.passwordless.com"],
            },
            hostIp: {
              operator: "in",
              value: ["20.64.169.92"],
            },
          },
        },
        result: {
          effect: "allow",
          reAuth: "true",
          reAuthFrequency: "EveryTime",
          msg: "This policy is for login in mobile testcase",
          rulePriority: 2,
        },
      },
    ],
  };
  let apiUrl = `${BASEPATH}/me/v1/Machine2MachinePolicies/${id}`;
  axios
    .put(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(res.data, "POLICY UPDATE");
      console.log("POLICY CREATED SUCCESSFULLY");
    })
    .catch((err) => {
      console.log("error unable to update policy: ", err);
    });
};

const generateTokenForAuthRequest = () => {
  const clientID = "a708d773-1017-4eb6-8bdc-abf6e15f2e90";
  const clientSecret = "b464a6ea-061e-400a-ab12-2b7251afd691";
  const apiUrl = `${BASEPATH}/oauth2/v1/token`;
  const authString = `${clientID}:${clientSecret}`;
  const encodedAuth = btoa(authString);

  const body =
    "grant_type=client_credentials" +
    "&scope=" +
    encodeURIComponent("urn:iam:myscopes");
  axios
    .post(apiUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedAuth}`,
      },
    })
    .then(async (res) => {
      await console.log(res.data.access_token, "access token");
      accessToken = res.data.access_token;
      sendPresentationRequest(accessToken);
    })
    .catch((err) => {
      console.error("Error fetching token:", err);
    });
};

const sendPresentationRequest = (accessToken) => {
  const apiUrl = `${BASEPATH}/machineid/v1/client/auth/api/v3/do-authenticationV4`;
  const payload = {
    username: "hemalatha",
    hostname: "test-vm-14.passwordless.com",
    groupName: "",
    credentialType: "ServiceAccount",
    requestId: "",
    sourceIp: "42.226.85.135",
    port: "9999",
  };
  axios
    .post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(res, "IDP PRESENTATION REQUEST");
    })
    .catch((err) => {
      console.log(err, "UNABLE SEND IDP PRESENTATION REQUEST");
    });
};

async function testSearchCredential(driver) {
  const searchInput = await driver.$("~searchCredentials");
  const isSearchDisplayed = await searchInput.isDisplayed();
  if (isSearchDisplayed) {
    await searchInput.clearValue();
    await searchInput.setValue("");
    await searchInput.setValue("muthu");
    const noCredentialFound = await driver.$("~noCredentialFound");
    await noCredentialFound.isDisplayed();
    await driver.pause(2000);
    await searchInput.setValue("");
    await driver.pause(2000);

    if (platform === "ios") {
      await searchInput.click();
      const currentValue = await searchInput.getValue();
      if (currentValue) {
        const backspaces = new Array(currentValue.length).fill("\uE003");
        await driver.keys(backspaces);
        await driver.pause(2000);
      }
    } else {
      await searchInput.clearValue();
    }
    await driver.pause(3000);
    await searchInput.setValue(searchVal);
    const idpCredential = await driver.$("~credential_0");
    await idpCredential.isDisplayed();
    console.log("Credentials Found");
  } else {
    console.error("Test error search username:", err);
  }
}

async function testSyncCredential(driver) {
  await driver.pause(3000);

  const syncBtn = await driver.$("~SyncButtonIcon");
  const isSyncBtmDisplayed = syncBtn.isDisplayed();
  if (isSyncBtmDisplayed) {
    const syncBtnClick = await driver.$("~SyncButtonIcon");
    await syncBtnClick.click();
    await driver.pause(3000);

    const syncSuccessAlert = await driver.$(
      platform === "ios"
        ? '//XCUIElementTypeStaticText[@name="Success"]'
        : 'android=new UiSelector().resourceId("com.broadcom.ssp.wallet:id/alert_title")'
    );
    const isSyncSuccess = await syncSuccessAlert.isDisplayed();
    if (isSyncSuccess) {
      const syncSuccessOk = await driver.$(
        platform === "ios"
          ? '//XCUIElementTypeButton[@name="OK"]'
          : '//android.widget.Button[@resource-id="android:id/button1"]'
      );
      await syncSuccessOk.isDisplayed();
      await driver.pause(3000);
      await syncSuccessOk.click();
      // await homeHeader.isDisplayed();
      await driver.pause(3000);
    }
  } else {
    console.log("Sync not visible");
    console.error("Test error Tabs:", err);
  }
  await driver.pause(3000);
}

async function testActivityLog(driver) {
  const activityLogTab = await driver.$(`~tabActivityLog`);
  await activityLogTab.isDisplayed();
  await activityLogTab.click();
  await driver.pause(3000);

  const activityLogScreen = await driver.$("~activityLogHeader");
  await activityLogScreen.isDisplayed();
  await driver.pause(3000);
}

async function testRejectAuthenticationRequest(driver) {
  await generateTokenForAuthRequest();
  await console.log("Waiting for Authentication Screen...");
  await driver.pause(5000);
  await driver.pause(5000);
  await driver.pause(5000);
  await console.log("Authentication screen opened successfully...");
  const authenticationRequestHeader = await driver.$(
    "~allowAuthenticationHeader"
  );
  const isAuthenticationRequestHeaderDisplayed =
    await authenticationRequestHeader.isDisplayed();
  if (isAuthenticationRequestHeaderDisplayed) {
    const rejectAuthenticationButton = await driver.$(
      "~rejectAuthenticationButton"
    );
    const rejectBtnDisplayed = await rejectAuthenticationButton.isDisplayed();
    if (rejectBtnDisplayed) {
      await rejectAuthenticationButton.click();
      await testFingerPrint(driver);
    } else {
      console.log("Authentication Reject Button not visible");
      console.log("TestCase Failed");
      console.error("Test error:", err);
    }
  } else {
    console.log("Authentication Screen not visible");
    console.log("TestCase Failed");
    console.error("Test error:", err);
  }
}

async function testApproveAuthenticationRequest(driver) {
  await generateTokenForAuthRequest();
  await console.log("Waiting for Authentication Screen...");
  await driver.pause(5000);
  await driver.pause(7000);
  await driver.pause(5000);
  await console.log("Authentication screen opened successfully...");
  const authenticationRequestHeader = await driver.$(
    "~allowAuthenticationHeader"
  );
  const isAuthenticationRequestHeaderDisplayed =
    await authenticationRequestHeader.isDisplayed();
  if (isAuthenticationRequestHeaderDisplayed) {
    const approveAuthenticationButton = await driver.$(
      "~approveAuthenticationButton"
    );
    const rejectBtnDisplayed = await approveAuthenticationButton.isDisplayed();
    if (rejectBtnDisplayed) {
      await approveAuthenticationButton.click();
      await testFingerPrint(driver);
    } else {
      console.log("Authentication Accept Button not visible");
      console.log("TestCase Failed");
      console.error("Test error:", err);
    }
  } else {
    console.log("Authentication Screen not visible");
    console.log("TestCase Failed");
    console.error("Test error:", err);
  }
}

async function testSSPLogin(driver) {
  let usernameVal = "hemalatha";
  let passwordVal = "Test@123";
  let searchVal = "hemalatha";

  const loginHeader = await driver.$(
    'android=new UiSelector().text("Connecting to WalletClient")'
  );
  const isloginHeaderDisplayed = await loginHeader.isDisplayed();
  if (isloginHeaderDisplayed) {
    const usernameLable = await driver.$(
      '//android.view.View[@text="Username"]'
    );
    const isUsernameLableDisplayed = await usernameLable.isDisplayed();
    if (isUsernameLableDisplayed) {
      const usernameInput = await driver.$(
        'android=new UiSelector().resourceId("usernameInput")'
      );
      await usernameInput.clearValue();
      await usernameInput.setValue(usernameVal);
      console.log("Entered Username successfully");
      await driver.pause(3000);
      // Click the next button
      await driver.$(
        "android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()"
      );
      const nextButton = await driver.$(
        '//android.widget.Button[@text="Next"]'
      );
      await nextButton.click();
      await driver.pause(3000);
      const passwordLable = await driver.$(
        'android=new UiSelector().text("Password")'
      );
      const isPasswordLableDisplayed = await passwordLable.isDisplayed();
      if (isPasswordLableDisplayed) {
        const usernameInput = await driver.$(
          'android=new UiSelector().resourceId("passwordInput")'
        );
        await usernameInput.clearValue();
        await usernameInput.click();
        await usernameInput.setValue(passwordVal);
        console.log("Entered Password successfully");
        await driver.pause(3000);
        // Click the signin button
        await driver.$(
          "android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()"
        );
        const sigInButton = await driver.$(
          '//android.widget.Button[@text="Sign In"]'
        );
        await sigInButton.click();
        await driver.pause(3000);
      } else {
        await driver.pause(4000);
        console.log("Password Input field not visible");
        console.error("Test error:", err);
      }
    } else {
      await driver.pause(4000);
      console.log("Username Input field not visible");
      console.error("Test error:", err);
    }
  } else {
    await deleteWallet();
    await deletePolicy();
  }
}

async function testIOSSSPLogin(driver) {
  let usernameVal = "hemalatha";
  let passwordVal = "Test@123";
  let searchVal = "hemalatha";

  // const loginHeader = await driver.(`~Connecting to` && `~WalletClient`)
  const loginHeader = await driver.$(
    '//XCUIElementTypeStaticText[@name="Sign In"]'
  );
  const isloginHeaderDisplayed = await loginHeader.isDisplayed();
  if (isloginHeaderDisplayed) {
    // const usernameLable = await driver.$(`~Username`)
    const usernameLable = await driver.$(
      '//XCUIElementTypeOther[@name="Username"]'
    );
    const isUsernameLableDisplayed = await usernameLable.isDisplayed();
    if (isUsernameLableDisplayed) {
      const usernameInput = await driver.$(
        '//XCUIElementTypeTextField[@name="Username"]'
      );
      await usernameInput.clearValue();
      await usernameInput.setValue(usernameVal);
      console.log("Entered Username successfully");
      await driver.pause(3000);
      // Click the next button
      await driver.execute("mobile: swipe", { direction: "down" });
      // const nextButton = await driver.$(`~Next`)
      const nextButton = await driver.$(
        '//XCUIElementTypeButton[@name="Next"]'
      );
      await nextButton.click();
      await driver.pause(3000);
      // const passwordLable = await driver.$(`~Password`)
      const passwordLable = await driver.$(
        '//XCUIElementTypeStaticText[@name="Password"]'
      );
      const isPasswordLableDisplayed = await passwordLable.isDisplayed();
      if (isPasswordLableDisplayed) {
        const usernameInput = await driver.$(
          '//XCUIElementTypeSecureTextField[@name="Password"]'
        );
        await usernameInput.clearValue();
        await usernameInput.setValue(passwordVal);
        console.log("Entered Password successfully");
        await driver.pause(3000);
        // Click the signin button
        await driver.execute("mobile: swipe", { direction: "down" });
        const sigInButton = await driver.$(
          '//XCUIElementTypeButton[@name="Sign In"]'
        );
        await sigInButton.click();
        await driver.pause(1000);

        const savePasswords = await driver.$(
          '//XCUIElementTypeStaticText[@name="Save Password?"]'
        );
        const isSavePasswordsDisplayed = await savePasswords.isDisplayed();
        if (isSavePasswordsDisplayed) {
          const notnowButton = await driver.$(
            '(//XCUIElementTypeOther[@name="Horizontal scroll bar, 1 page"])[7]'
          );
          await notnowButton.isDisplayed();
          await notnowButton.click();
        } else {
          console.log("Save Password prompt is not displayed");
        }
        const testOpenApp = await driver.$(
          '//XCUIElementTypeTextView[@name="Open in “com.broadcom.ssp.wallet”?"]'
        );
        const isOpenAppDisplayed = await testOpenApp.isDisplayed();
        if (isOpenAppDisplayed) {
          const openAppButton = await driver.$(
            '//XCUIElementTypeStaticText[@name="Open"]'
          );
          await openAppButton.isDisplayed();
          await openAppButton.click();
          console.log("Wallet Logged In successfully");
          await driver.pause(3000);
        } else {
          console.log("Open App prompt is not displayed");
        }
        await driver.pause(3000);
      } else {
        await driver.pause(4000);
        console.log("Password Input field not visible");
        console.error("Test error:", err);
      }
    } else {
      await driver.pause(4000);
      console.log("Username Input field not visible");
      console.error("Test error:", err);
    }
  } else {
    await deleteWallet();
    await deletePolicy();
  }
}

async function testFingerPrint(driver) {
  if (platform === "ios") {
    await driver.execute("mobile: sendBiometricMatch", {
      type: "faceId",
      match: true,
    });
    return driver.pause(2000);
  } else {
    const fingerprintAuthenticate = await driver.$(
      'android=new UiSelector().text("Authenticate")'
    );
    const isFIngerprintAuthDisplayed =
      await fingerprintAuthenticate.isDisplayed();
    if (isFIngerprintAuthDisplayed) {
      await driver.fingerPrint(1);
      // const success = await driver.$('//android.widget.TextView[@text="Authenticated!"]');
      // await expect(success).toBeDisplayed(); await driver.pause(3000)

      await driver.pause(2000);
    } else {
      console.log("Unable to authenticate");
    }
  }
}

const mainFunction = async () => {
  const driver = await remote(wdOpts);

  let usernameVal = "hemalatha";
  let passwordVal = "Test@123";

  try {
    // await driver.getPageSource()
    await CreatePolicy();
    const titleElement = await driver.$("~configureWalletHeading");
    const isDisplayed = await titleElement.isDisplayed();
    await driver.pause(5000);
    if (isDisplayed) {
      const inputField = await driver.$("~qrInputLabel");
      const isInputFieldDisplayed = await inputField.isDisplayed();
      if (isInputFieldDisplayed) {
        const QrCodeInput = await driver.$("~qrCodeInput");
        await QrCodeInput.clearValue();
        await QrCodeInput.setValue(qrCode);
        console.log("Entered QR code successfully");
        await driver.pause(3000);
        // Click the button
        const button = await driver.$("~configureWalletButton");
        await button.click();
        await driver.pause(3000);
      } else {
        console.log("Input field not visible");
      }
    } else {
      console.log("Its not displayed");
    }
    await console.log("Waiting for login screen...");
    await driver.pause(9000);

    if (platform === "ios") {
      await testIOSSSPLogin(driver);
    } else {
      await testSSPLogin(driver);
    }
    await driver.pause(4000);
    if (platform === "ios") {
      await driver.execute("mobile: sendBiometricMatch", {
        type: "faceId",
        match: true,
      });
    } else {
      const SignInHeader = await driver.$("~SignInHeader");
      const isSignInHeaderDisplayed = await SignInHeader.isDisplayed();

      const fingerprintAuthenticate = await driver.$(
        'android=new UiSelector().text("Authenticate")'
      );
      const isFIngerprintAuthDisplayed =
        await fingerprintAuthenticate.isDisplayed();
      if (isSignInHeaderDisplayed) {
        const passwordInput = await driver.$("~passwordInput");
        await passwordInput.clearValue();
        await passwordInput.setValue(passwordVal);
        console.log("Entered Password successfully");
        // Click the signin button
        const sigInButton = await driver.$("~signInButton");
        await sigInButton.click();
        await driver.pause(3000);
        console.log("Wallet Logged In successfully");
      } else if (isFIngerprintAuthDisplayed) {
        // Simulate fingerprint match
        await driver.fingerPrint(1);
        console.log("Authentication successful:");
      } else {
        console.log("Password Input field not visible");
        console.error("Test error:", err);
      }
    }

    await driver.pause(3000);
    const homeHeader = await driver.$("~homeHeader");
    const isHomeDisplayed = await homeHeader.isDisplayed();
    const homeEmailDisplayed = await driver.$("~emailTextDisplayedInHome");
    await homeEmailDisplayed.isDisplayed();
    if (isHomeDisplayed) {
      const allTab = await driver.$("~tabAll");
      const isAllTabDisplayed = await allTab.isDisplayed();
      const idpTab = await driver.$("~tabIDP");
      const isIdpTabDisplayed = await idpTab.isDisplayed();
      await idpTab.click();
      await driver.pause(4000);
      const serviceAccountTab = await driver.$("~tabServiceAccount");
      const isServiceAccountTabDisplayed =
        await serviceAccountTab.isDisplayed();
      await serviceAccountTab.click();
      await driver.pause(3000);
      await idpTab.click();
      await driver.pause(3000);
      if (
        isAllTabDisplayed &&
        isIdpTabDisplayed &&
        isServiceAccountTabDisplayed
      ) {
        const idpCredential = await driver.$("~credential_0");
        const isIdpCredentialDisplayed = await idpCredential.isDisplayed();
        console.log("IDP Credentials visible successfully");
        if (isIdpCredentialDisplayed) {
          await idpCredential.click();
          await driver.pause(3000);
          const credentialInfo = await driver.$(`~credentialInformationHeader`);
          await credentialInfo.isDisplayed();
          await driver.pause(3000);
          const backToHome = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeButton[@name="(tabs)"]'
              : '//android.widget.ImageButton[@content-desc="Navigate up"]'
          );
          await backToHome.isDisplayed();
          await backToHome.click();
          await driver.pause(3000);
          await homeHeader.isDisplayed();
          await allTab.isDisplayed();
          await allTab.click();
        } else {
          console.log("IDP Credentials not visible");
          console.error("Test error IDP Credentials:", err);
        }
        //TEST SEARCH CREDENTIALS
        await testSearchCredential(driver);
      } else {
        console.log("Tabs not visible");
        console.error("Test error Tabs:", err);
      }

      // SYNC CREDENTIAL BUTTON
      await testSyncCredential(driver);

      // //DENY CREDENTIAL
      // const denyCredential = await driver.$("~acceptCredentialHeader");
      // const isDenyCredentialDisplayed = await denyCredential.isDisplayed();
      // if (isDenyCredentialDisplayed) {
      //   const acceptBtn = await driver.$("~rejectCredentialButton");
      //   await acceptBtn.isDisplayed();
      //   await acceptBtn.click();

      //   await testFingerPrint(driver);
      // } else {
      //   console.log("Authentication Failed");
      // }
      // // await deletePolicy();
      // await driver.pause(4000);
      // await CreatePolicy();
      // console.log("Creating Policy.....");
      // await driver.pause(6000);

      // //SYNC Credential TO ACCEPT CREDENTIAL
      // await driver.pause(6000);

      // await testSyncCredential(driver);
      // await driver.pause(6000);

      //ACCEPT CREDENTIAL
      await driver.pause(2000);
      const acceptCredential = await driver.$("~acceptCredentialHeader");
      const isAcceptCredentialDisplayed = await acceptCredential.isDisplayed();
      if (isAcceptCredentialDisplayed) {
        const acceptBtn = await driver.$("~acceptCredentialButton");
        await acceptBtn.isDisplayed();
        await acceptBtn.click();

        await testFingerPrint(driver);
      } else {
        console.log("Authentication Failed");
      }
      //ACTIVITY TAB
      await testActivityLog(driver);

      //Reject Authentication Request
      await testRejectAuthenticationRequest(driver);
      await driver.pause(3000);

      //Approve Authentication Request
      await testApproveAuthenticationRequest(driver);
      await driver.pause(3000);

      //ACTIVITY TAB
      await testActivityLog(driver);
      await driver.pause(3000);

      //ACCOUNT TAB
      const accountTab = await driver.$("~tabAccount");
      await accountTab.isDisplayed();
      await accountTab.click();
      await driver.pause(3000);
      const accountHeader = await driver.$("~accountHeader");
      const isAccountHeaderDisplayed = await accountHeader.isDisplayed();
      if (isAccountHeaderDisplayed) {
        const logoutBtn = await driver.$("~logoutAuthenticatorButton");
        const isLogoutBtnDisplayed = await logoutBtn.isDisplayed();
        await logoutBtn.click();
        if (isLogoutBtnDisplayed) {
          const logoutConfirmationTitle = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeStaticText[@name="Logout Wallet"]'
              : 'android=new UiSelector().resourceId("com.broadcom.ssp.wallet:id/alert_title")'
          );
          await logoutConfirmationTitle.isDisplayed();
          const cancleLogoutBtn = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeButton[@name="Cancel"]'
              : 'android=new UiSelector().resourceId("android:id/button2")'
          );
          await cancleLogoutBtn.isDisplayed();
          await cancleLogoutBtn.click();
          await accountTab.isDisplayed();
          await logoutBtn.isDisplayed();

          await logoutBtn.click();
          const okBtn = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeButton[@name="OK"]'
              : 'android=new UiSelector().resourceId("android:id/button1")'
          );
          await okBtn.isDisplayed();
          await okBtn.click();

          await testFingerPrint(driver);
          const testOpenApp = await driver.$(
            '//XCUIElementTypeTextView[@name="Open in “com.broadcom.ssp.wallet”?"]'
          );
          const isOpenAppDisplayed = await testOpenApp.isDisplayed();
          if (isOpenAppDisplayed) {
            const openAppButton = await driver.$(
              '//XCUIElementTypeStaticText[@name="Open"]'
            );
            await openAppButton.isDisplayed();
            await openAppButton.click();
            await driver.pause(3000);
          } else {
            console.log("Open App prompt is not displayed");
          }
          const walletLoginScreen = await driver.$("~walletLogin");
          const isWalletLoginScreenDisplayed =
            await walletLoginScreen.isDisplayed();
          if (isWalletLoginScreenDisplayed) {
            const loginBtn = await driver.$("~walletLoginButton");
            await loginBtn.isDisplayed();
            await loginBtn.click();
            await driver.pause(9000);
            await console.log("Waiting for login screen...");
            if (platform === "ios") {
              await testIOSSSPLogin(driver);
            } else {
              await testSSPLogin(driver);
            }
            await driver.pause(3000);
            await accountTab.isDisplayed();
            await accountTab.click();
            await driver.pause(3000);
          } else {
            console.log("Login screen is not displayed");
          }
        }
        const resetWalletBtn = await driver.$("~resetAuthenticatorButton");
        const isResetBtmDisplayed = await resetWalletBtn.isDisplayed();
        if (isResetBtmDisplayed) {
          await resetWalletBtn.click();
          const resetConfirmationTitle = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeStaticText[@name="Reset Wallet"]'
              : 'android=new UiSelector().resourceId("com.broadcom.ssp.wallet:id/alert_title")'
          );
          await resetConfirmationTitle.isDisplayed();
          const okBtn = await driver.$(
            platform === "ios"
              ? '//XCUIElementTypeButton[@name="OK"]'
              : 'android=new UiSelector().resourceId("android:id/button1")'
          );
          await okBtn.isDisplayed();
          await okBtn.click();
          await testFingerPrint(driver);
          await driver.pause(4000);
          const titleElement = await driver.$(
            'android=new UiSelector().text("Configure Wallet")'
          );
          const isDisplayed = await titleElement.isDisplayed();
          if (isDisplayed) {
            console.log("Testcase Ended Successfully");
            await driver.pause(5000);
          }
        } else {
          console.log("Reset Wallet Button is not Displayed");
        }
      } else {
        console.log("Account Screen is not visiable");
      }
    }
  } catch (err) {
    // await driver.pause(4000);
    await deleteWallet();
    await deletePolicy();
    console.log("Wallet Deleted Successfully");
  } finally {
    await deleteWallet();
    await deletePolicy();
    console.log("Wallet Deleted Successfully");
    await driver.pause(3000);
    await driver.deleteSession();
  }
};
const createWallet = (walletClientInfo, userInfo) => {
  let payload = {
    deviceName: "Test Android Wallet",
  };
  const apiUrl = `${BASEPATH}/machineid/v1/me/wallet/api/createWallet`;
  axios
    .post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (response) => {
      console.log("Order data:", response.data);
      const walletInfo = response.data;
      const walletJson = {
        walletId: walletInfo.walletId,
        walletKey: walletInfo.walletKey,
        email: walletInfo.email,
        userId: userInfo.user_guid,
        clientID: walletClientInfo.walletClientId,
        ClientTenantName: walletClientInfo.walletClientTenant,
        tenantName: "default",
        apiUrl: userInfo.iss + "/",
      };
      tenantUserInfo = {
        walletId: walletInfo.walletId,
        userId: userInfo.user_guid,
      };
      qrCode = Buffer.from(JSON.stringify(walletJson)).toString("base64");
      await mainFunction();
    })
    .catch((error) => {
      console.error("Error creating Wallet:", error);
    });
};

async function runTest() {
  await generateToken();
}

runTest().catch(console.error);
