# IN DEVELOPMENT. Check back in about a week (Dec 1, 2020) for initial release (this line will be removed).

# GPIOServer: Easy end-user control of RasPi hardware

<table style="width: 100%;">
<tbody>
<tr>
<td>
Suppose you have a product using the RasPi GPIO connector.<p />

How does your customer control the attached hardware?<p />

For a RasPi relay board, how does the user control the relays when the Pi
is located in the attic? End-users might not have a spare display and
keyboard, and a display and keyboard may not be convenient at that location.

The GPIOServer presents a web page interface to the RasPi GPIO lines,
allowing the end user to read inputs and set outputs using any browser.
The GPIO config is specified by a file (that you supply) that limits the
user to valid actions.

The project also supplies executables that can control the GPIO system
directly without a browser. The programs can be used at the command line
or embeded into scripts as needed.
</td>
<td><img style="float: right; margin: 0px;" src="https://cdn.hackaday.io/images/7702931606497840554.png"></td>
</tr></tbody></table>

## How it works

GPIOServer runs on the Raspberry Pi and reads a configuration file
(that you supply) describing the GPIOs used by the attached hardware:
the mode (input/output), logic (normal/inverted), hardware name
("Relay 2"), and so on. The server initializes these GPIOs and
accepts JSON commands to read and/or set the values.

The system also spawns a web server with HTML pages showing the
GPIOs. The web interface lets the user read inputs and set outputs
using any web browser.

In addition to the web server, the project supplies programs that
communicate with the server directly. Knowing the IP address of the
Raspberry Pi system, the user can use these commands to remotely read
and control GPIO settings without using a browser. The commands can be
run at the command line, and may be embedded into scripts as needed.

## Integrating with your product application

The system is intended to be used with your hardware product.

After installing the project (using "git clone"), simply edit the
configuration file "GPIO.conf" to specify which GPIOs are presented to
the user, their mode specifics, and hardware names. Comment out any
GPIOs that you don't want users to access.

Add your product branding to the web pages as needed: background color,
fonts and styles, trademarks, and corporate logos.

This product is open source and free to use without attribution. Contact
me through this site if you need a more definitive legal document. (See
"private messages" at top of page.) 

## Installing

Installation instructions are in the file "INSTALL.md" supplied with the project.

## Bugs and errors

Please let me know about bugs and other issues so I can update the project.
