# Voyado Tag for Google Tag Manager Server Container

The Voyado platform now [supports server-side cookies](https://developer.voyado.com/en/web-activity-tracking/support-for-server-side-cookies.html), which are beneficial in scenarios like dealing with [Safari's Intelligent Tracking Prevention](https://stape.io/blog/safari-itp-update-limits-cookies-to-7-days-for-responses-from-3rd-party-ips) that caps the lifetime of client-side cookies at 7 days. So we, at Stape, decided to create a [Voyado tag](https://github.com/stape-io/voyado-tag#voyado-tag-for-google-tag-manager-server-container) for the server Google Tag Manager for you to take the most out of this platform.

### With our Voyado tag for server Google Tag Manager you can:

- Track [cart changes](https://developer.voyado.com/en/web-activity-tracking/tracking-cart-changes.html): monitor additions/removals, enable cart abandonment flow, measure the total value of items in a cart at any given time, allowing for better understanding of potential revenue.
- Track [product view](https://developer.voyado.com/en/web-activity-tracking/tracking-product-views.html): see which products are most viewed, how long users view certain products, what attributes they engage with and determine what referral sources or campaigns lead to specific product views.
- Track purchase: monitor the number of successful purchases, total revenue generated, and average order value.
- [Identify the user](https://developer.voyado.com/en/web-activity-tracking/identification-and-cookies.html): set a cookie with ContactId or email, for later use in tracked events.
### To configure the tag you need:

- Base url - Base URL in the following format: https://[client].voyado.com
- API key - your [Voyado Engage API key](https://developer.voyado.com/en/api/api-authentication.html).
- Email - email of the user.

You can also click on the checkbox “Use Optimistic Scenario” and the tag will call gtmOnSuccess() without waiting for a response from the API. 

## Useful link: 
- https://stape.io/blog/server-to-server-voyado-tracking-using-server-google-tag-manager 

## Open Source

Voyado Tag for GTM Server Side is developing and maintained by [Stape Team](https://stape.io/) under the Apache 2.0 license.
