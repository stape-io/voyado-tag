const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const getContainerVersion = require('getContainerVersion');
const logToConsole = require('logToConsole');
const getRequestHeader = require('getRequestHeader');
const makeTableMap = require('makeTableMap');
const Promise = require('Promise');
const parseUrl = require('parseUrl');
const getAllEventData = require('getAllEventData');
const decodeUriComponent = require('decodeUriComponent');

const isLoggingEnabled = determinateIsLoggingEnabled();
const traceId = isLoggingEnabled ? getRequestHeader('trace-id') : undefined;

identify(data.type === 'identify')
  .then((contactId) => {
    if (data.type === 'trackCartChanges') {
      const cartModel = data.cartModel
        ? makeTableMap(data.cartModel, 'property', 'value')
        : {};
      cartModel.ContactId = contactId;
      sendEvent('/tracking/carts', 'AddToCart', cartModel);
    } else if (data.type === 'trackProductView') {
      const productViewApiModel = data.productViewApiModel
        ? makeTableMap(data.productViewApiModel, 'property', 'value')
        : {};
      productViewApiModel.ContactId = contactId;
      sendEvent('/tracking/productview', 'ProductView', productViewApiModel);
    } else if (data.type === 'trackPurchase') {
      const orderModel = data.orderModel
        ? makeTableMap(data.orderModel, 'property', 'value')
        : {};
      orderModel.contact = {
        matchKey: contactId,
        matchKeyType: 'ContactId',
      };
      sendEvent('/orders', 'Purchase', orderModel);
    } else {
      data.gtmOnSuccess();
    }
  })
  .catch(() => {
    data.gtmOnFailure();
  });

function identify(force) {
  return Promise.create((resolve, reject) => {
    if (!force) {
      const eventData = getAllEventData();
      const url = eventData.page_location || getRequestHeader('referer');
      if (url) {
        const urlParsed = parseUrl(url);
        if (urlParsed && urlParsed.searchParams.vtid) {
          const newContactId = decodeUriComponent(urlParsed.searchParams.vtid);
          storeCookie('_vaI', newContactId);
          return resolve(newContactId);
        }
      }
      const contactId = getCookieValues('_vaI')[0];
      if (contactId) {
        return resolve(contactId);
      }
    }
    const email = data.email;

    if (!email) {
      return reject();
    }

    getContactId(email)
      .then(resolve)
      .catch(() => {
        createContact(email).then(resolve).catch(reject);
      });
  });
}

function getContactId(email) {
  return Promise.create((resolve, reject) => {
    const requestUrl = data.baseURL + '/api/v2/contacts/id?email=' + email;
    if (isLoggingEnabled) {
      logToConsole(
        JSON.stringify({
          Name: 'Voyado',
          Type: 'Request',
          TraceId: traceId,
          EventName: 'GetContactId',
          RequestMethod: 'GET',
          RequestUrl: requestUrl,
        })
      );
    }
    sendHttpRequest(
      requestUrl,
      (statusCode, headers, body) => {
        if (isLoggingEnabled) {
          logToConsole(
            JSON.stringify({
              Name: 'Voyado',
              Type: 'Response',
              TraceId: traceId,
              EventName: 'GetContactId',
              ResponseStatusCode: statusCode,
              ResponseHeaders: headers,
              ResponseBody: body,
            })
          );
        }
        if (statusCode >= 200 && statusCode < 300) {
          storeCookie('_vaI', body);
          resolve(body);
        } else if (statusCode === 409) {
          const data = JSON.parse(body);
          if (
            data &&
            data.multipleMatchesFound &&
            data.multipleMatchesFound.length
          ) {
            resolve(data.multipleMatchesFound[0]);
          } else {
            reject();
          }
        } else {
          reject();
        }
      },
      { headers: { apikey: data.apikey } }
    );
  });
}

function createContact(email) {
  return Promise.create((resolve, reject) => {
    const requestUrl = data.baseURL + '/api/v2/contacts';

    if (isLoggingEnabled) {
      logToConsole(
        JSON.stringify({
          Name: 'Voyado',
          Type: 'Request',
          TraceId: traceId,
          EventName: 'CreateContact',
          RequestMethod: 'POST',
          RequestUrl: requestUrl,
        })
      );
    }

    sendHttpRequest(
      requestUrl,
      (statusCode, headers, body) => {
        if (isLoggingEnabled) {
          logToConsole(
            JSON.stringify({
              Name: 'Voyado',
              Type: 'Response',
              TraceId: traceId,
              EventName: 'CreateContact',
              ResponseStatusCode: statusCode,
              ResponseHeaders: headers,
              ResponseBody: body,
            })
          );
        }
        if (statusCode >= 200 && statusCode < 300) {
          const contactId = JSON.parse(body).id;
          storeCookie('_vaI', contactId);
          resolve(contactId);
        } else {
          reject();
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: data.apikey,
        },
        method: 'POST',
      },
      JSON.stringify({
        email: email,
      })
    );
  });
}

function sendEvent(path, eventName, voyadoEventData) {
  let url = data.baseURL + '/api/v2' + path;

  if (isLoggingEnabled) {
    logToConsole(
      JSON.stringify({
        Name: 'Voyado',
        Type: 'Request',
        TraceId: traceId,
        EventName: data.type,
        RequestMethod: 'POST',
        RequestUrl: url,
        RequestBody: voyadoEventData,
      })
    );
  }

  sendHttpRequest(
    url,
    (statusCode, headers, body) => {
      logToConsole(
        JSON.stringify({
          Name: 'Voyado',
          Type: 'Response',
          TraceId: traceId,
          EventName: eventName,
          ResponseStatusCode: statusCode,
          ResponseHeaders: headers,
          ResponseBody: body,
        })
      );

      if (!data.useOptimisticScenario) {
        if (statusCode >= 200 && statusCode < 300) {
          data.gtmOnSuccess();
        } else {
          data.gtmOnFailure();
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: data.apikey,
      },
      method: 'POST',
    },
    JSON.stringify(voyadoEventData)
  );

  if (data.useOptimisticScenario) {
    data.gtmOnSuccess();
  }
}

function storeCookie(name, value) {
  setCookie(name, value, {
    domain: 'auto',
    path: '/',
    samesite: 'Lax',
    secure: true,
    'max-age': 63072000, // 2 years
    httpOnly: false,
  });
}

function determinateIsLoggingEnabled() {
  const containerVersion = getContainerVersion();
  const isDebug = !!(
    containerVersion &&
    (containerVersion.debugMode || containerVersion.previewMode)
  );

  if (!data.logType) {
    return isDebug;
  }

  if (data.logType === 'no') {
    return false;
  }

  if (data.logType === 'debug') {
    return isDebug;
  }

  return data.logType === 'always';
}
