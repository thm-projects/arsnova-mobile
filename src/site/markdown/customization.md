# Customization

## Branding

ARSnova allows you to easily include your own logo and slogan.
Multiple settings are avaible which are set in the backend's `arsnova.properties` configuration file:

* `ui.slogan`
* `ui.splashscreen.logo-path`
* `ui.splashscreen.slogan`
* `ui.splashscreen.min-delay`
* `ui.splashscreen.slogan-color`
* `ui.splashscreen.background-color`
* `ui.splashscreen.loading-ind-color`


## Theming

ARSnova Mobile provides a lot of configuration properties which allow you to adjust the color theme.
The color values can be changed in `src/main/webapp/resources/sass/_theme.scss`.
As a start we suggest you have a look at the variables starting with `brand-`.

To apply your changes you need to build ARSnova Mobile.
This requires you to set up a development environment as descriped in [Development](development.md).


## Custom Login and Registration Webpages

If you are using ARSnova's own user management or login via LDAP you can provide custom login pages.
Templates and additional instructions for these web pages are provided via the
[arsnova-customization repository](https://github.com/thm-projects/arsnova-customization).

You can also use your own icons for the login button.
Copy the image file to `src/resources/images` and add the following section to the `_theme.scss` to change the LDAP button's icon:

```css
	.iconBtnImg.login-icon-ldap {
	    margin: 0 !important;
	    width: 100% !important;
	    height: 100% !important;
	    background: url(resources/images/your-ldap-icon.png) no-repeat center center;
			color: transparent;
	}
```
