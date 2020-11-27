# GPIOServer: Easy end-user control of RasPi hardware

## Installing

This is an application-level program, not a system command or system feature. It is an add-on to your
product software, and as such there is no global "apt-get install". You will need a copy of the source
to modify for your needs.

### Step 1: Install AppDaemon

Install the "AppDaemon" project, per instructions found in that project. Continue with the next step
once the example application from that project is working.

[AppDaemon on GitHub](https://github.com/ToolChainGang/AppDaemon "AppDaemon on GitHub")

[AppDaemon on Hackaday.io]([AppDaemon on GitHub](https://github.com/ToolChainGang/AppDaemon "AppDaemon on GitHub")
 "AppDaemon on Hackaday.io")


### Step 2: Copy this project to the /home/pi directory.


```
> git clone https://github.com/ToolChainGang/GPIOServer.git
```

### Step 3: Upgrade your system 

The project subdir "install" contains a script to upgrade your system and install needed packages.
These scripts install extra packages needed for this project, but not installed as part of the
AppDaemon install process.

For proper installation, each script should be run multiple times, fixing errors as needed until the
output contains nothing but a list of "already have most recent version" messages.

```
(as root)

> cd /home/pi/GPIOServer/install
> ./05-UpgradeInstall.sh

Go get lunch, then rerun the script

> ./05-UpgradeInstall.sh

Verify that the output contains nothing but a list of "newest version" messages.

```

### Step 4: Configure your GPIO hardware

Edit the file "etc/GPIO.conf" and make whatever changes you need to configure your specific
hardware. The commentary at the top of that file is self-explanatory, and there are several
example configurations to help get you started.

IMPORTANT: The GPIOs shown by the GPIOServer must *NOT* include the ones used by the AppDaemon!

For example, suppose your rc.local contains the following:

```
nohup /root/AppDaemon/bin/AppDaemon -v --config-gpio=4 --led-gpio=19  \
                                       --web-dir /home/pi/GPIOServer/public_html
```

In this example, the GPIOServer will be unable to access GPIOs 4 and 19, since the AppDaemon
will have already opened them.

### Step 5: Test your GPIO hardware

The "gpio" system command can be used to test individual bits of your hardware. Use that
command verify that your input hardware works, your output hardware works, and so on.

Some useful gpio commands are:

```
gpio -h             # Show usage

gpio readall        # Read and display all GPIO modes and values

gpio read 12        # Read GPIO 12 and display the value

gpio blink 15       # Blink GPIO 15 on and off continuously, as an LED
```

### Step 6: Install into AppDaemon

The AppDaemon is currently running the sample application, it only remains to switch it
over to running the GPIOServer application.

Change the /etc/rc.local file so that the AppDaemon invokes the GPIOServer instead of the
sample application.

For example, put this in your /etc/rc.local file:

```
########################################################################################################################
#
# Start the GPIOServer
#
set +e

ConfigGPIO=4;       # Config switch WPi07, Connector pin  7, GPIO (command) BCM 04
LEDGPIO=19;         # Config LED    WPi24, Connector pin 35, GPIO (command) BCM 19

Verbose="-v"        # AppDaemon gets very talky
#Verbose=           # AppDaemon shuts up

nohup /root/AppDaemon/bin/AppDaemon $Verbose --config-gpio=$ConfigGPIO --led-gpio=$LEDGPIO  \
                                             --web-dir /home/pi/GPIOServer/public_html      \
                                             --user=pi /home/pi/GPIOServer/bin/GPIOServer &

set -e
```

A sample rc.local file that does this is included with the project, so for a quick test you can do the following:

```
(as root) 

> cd /home/pi/GPIOServer/install
> cp /etc/rc.local /etc/rc.local.bak
> cp rc.local.SAMPLE /etc/rc.local
> reboot
```

### Step 5: Verify that everything is running

Once everything is running the /home/pi/GPIOServer/install directory is no longer needed - you can delete it.

Open a browser and connect to the IP address of your raspberry pi, and verify the GPIOs are displayed correctly,
that they control your hardware in the correct manner, and so on.

For example, if your RasPi has IP address 192.168.1.31, enter "http://192.168.1.31/" into the address bar to
see the GPIOServer pages.

If you have trouble, check out /home/pi/GPIOServer/install/DEBUGGING.txt for hints on how to proceed.