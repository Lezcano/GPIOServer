# GPIOServer: Easy end-user control of RasPi hardware

## Modifying

The GPIOServer is meant to be integrated into your application. Once you get the system running, 
modify it to look like a part of your project.

## Changing the page styles

The page "public_html/index.html" contains all the web pages. Feel free to add your
company logo, and make the page branding closer to your own such as the colors, font face
and so on.

The accompanying GPIOServer.js and GPIOServer.css file are also relevant.

## Disallowing user changes

The Config icon on the web page is disabled if the global var AllowRename in the config file
("/home/pi/GPIOServer/etc/GPIO.conf") is missing or set to "no". This will prevent the user
from setting the UName and UDesc of the GPIOs.

## Example configuration for GPIO.conf

For reference, here's an example GPIO configuration for the GPIO.conf file:

<pre><code>

##      AllowRename yes             # Allow user to change UName and UDesc
##      
##      #
##      # Comment
##      #
##      GPIO    7
##          Mode=Input              # One of:   Input   Output
##          Logic=Invert            #           Invert  Normal
##          Pull=High               #           High    Low    Off (== no pull resistor)
##          Boot=Low                # Value to take at bootup
##          HName="Relay 1"         # Hardware name
##          UName="Keurig"          # User's   assigned name
##          UDesc="Coffee maker in the kitchen"
##

</code></pre>

## Porting GPIOControl to other systems

The program "GPIOServer/bin/GPIOControl", is meant to be
compiled as a standalone executable for other architectures.

To get a version compiled for a specific architecture, you will need to
install perl on a system running that architecture, compile the program
on that architecture, and the resulting executable should be compatible
with any system that uses that architecture.

## Porting to Windows or IOS

<b>NOTE: I do not have access to a Windows or IOS system. What follows is my best
guess as to how to compile the control program for those systems. If you run into
problems, please sort it out and let me know so that I can update the
documentation.</b>

The following procedure can be used to compile the GPIOControl into a
Windows compatible executable:

1) Install perl on the development Windows system
2) Install extra needed perl libraries, as listed in install/06-UpgradePerl.sh
3) Compile the executable:

```
> pp -o GPIOControl.exe GPIOControl
```

This will generate the command "GPIOControl.exe", compatible with
other windows systems. No extra installed libraries will be needed to
run this on other systems.

Supply that file ("GPIOControl.exe") to your customers as needed.
