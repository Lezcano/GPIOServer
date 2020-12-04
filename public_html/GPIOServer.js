////////////////////////////////////////////////////////////////////////////////
//
// GPIOServer.js - Javascript for GPIOServer pages
//
// Copyright (C) 2020 Peter Walsh, Milford, NH 03055
// All Rights Reserved under the MIT license as outlined below.
//
////////////////////////////////////////////////////////////////////////////////
//
//  MIT LICENSE
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of
//    this software and associated documentation files (the "Software"), to deal in
//    the Software without restriction, including without limitation the rights to
//    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
//    of the Software, and to permit persons to whom the Software is furnished to do
//    so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//    all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
//    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
////////////////////////////////////////////////////////////////////////////////
//
//      GPIOInfo->
//          {GPIOInfo}->[]
//              {UName}-> "Keurig",                         # User assigned name
//              {UDesc}-> "Coffee maker in the kitchen"     # User assigned comment
//              {HName}-> "Relay 1"                         # Hardware name
//              {Mode} -> [ 'Input', 'Output' ],
//              {Value}-> [    'On',    'Off' ],            # Current value
//              {ID}                                        # (unused by web page)
//
////////////////////////////////////////////////////////////////////////////////

    var ConfigSystem = location.hostname;
    var ConfigAddr   = "ws:" + ConfigSystem + ":2021";

    var ConfigSocket;
    var ConfigData;

    var WindowWidth;
    var WindowHeight;

    var GPIOInfo;
    var PrevGPIOInfo;
    var Populated = 0;      // TRUE if web page tables populated from GPIOInfo
    var SwitchOnSound;
    var SwitchOffSound;

    //
    // One line of the GPIO control table listing
    //
    var ControlTemplate = '                     \
        <tr><td>$UNAME</td>                     \
            <td><img id="Control$ID" class="$CLASS" src="images/SwitchOff.png" title="GPIO Value" onclick=ToggleGPIO(this) /></td>    \
            <td>$UDESC</td>                     \
            </tr>';

    //
    // One line of the GPIO config table listing
    //
    var ConfigTemplate = '\
        <tr><td>$HNAME:</td>                    \
            <td><input id="UName$ID" type="text" value="$UNAME" maxlength="8" size="10" \></td> \
            <td><input id="UDesc$ID" type="text" value="$UDESC" \></td> \
            </tr>';

    var InputText  = '<tr><td><h3>Inputs </h3></td><td></td></tr>';
    var OutputText = '<tr><td><h3>Outputs</h3></td><td></td></tr>';

    //
    // On first load, calculate reliable page dimensions and do page-specific initialization
    //
    window.onload = function() {
        //
        // (This crazy nonsense gets the width in all browsers)
        //
        WindowWidth  = window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth;
        WindowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        PageInit();     // Page specific initialization

        SwitchOnSound  = new Audio("images/SwitchOn.wav" );
        SwitchOffSound = new Audio("images/SwitchOff.wav");

        Populated = 0;
        ConfigConnect();
        }

    //
    // Send a command to the server
    //
    function ServerCommand(Command,Arg1,Arg2,Arg3) {
        ConfigSocket.send(JSON.stringify({
            "Type"  : Command,
            "Arg1"  : Arg1,
            "Arg2"  : Arg2,
            "Arg3"  : Arg3,
             }));
        }

    function ConfigConnect() {
        ConfigSocket = new WebSocket(ConfigAddr);
        ConfigSocket.onmessage = function(Event) {
            ConfigData = JSON.parse(Event.data);

            if( ConfigData["Error"] != "No error." ) {
                console.log("Error: "+ConfigData["Error"]);
                console.log("Msg:   "+Event.data);
                alert("Error: " + ConfigData["Error"]);
                return;
                }

            //
            // Most messages return a GPIOInfo struct, which updates the shown values
            //
            if( ConfigData["Type"] == "GetGPIOInfo" ||
                ConfigData["Type"] == "SetGPIOInfo" || 
                ConfigData["Type"] == "ToggleGPIO"  ||
                ConfigData["Type"] == "CycleGPIO"   ) {
//                console.log("Msg: "+Event.data);

                GPIOInfo = ConfigData.State;
//                console.log(GPIOInfo);

                SysNameElements = document.getElementsByClassName("SysName");
                for (i = 0; i < SysNameElements.length; i++) {
                    SysNameElements[i].innerHTML = GPIOInfo.SysName;
                    };

                PopulateGPIOPages();
                SetGPIOValues();
                GotoPage("ControlPage");
                return;
                }

            //
            // Unexpected messages
            //
            console.log(ConfigData);
            alert(ConfigData["Type"] + " received");
            };

        ConfigSocket.onopen = function(Event) {
            ServerCommand("GetGPIOInfo");
            }
        };

    //
    // Cycle through the various pages
    //
    function GotoPage(PageName) {

        Pages = document.getElementsByClassName("PageDiv");

        for (i = 0; i < Pages.length; i++) {
            Pages[i].style.display = "none";
            };

        if( PageName == "ControlPage" ) { PopulateControlPage(); }
        if( PageName == "ConfigPage"  ) { PopulateConfigPage() ; }

        document.getElementById(PageName).style.display = "block";
        };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // PopulateGPIOControlPage - Populate the landing page as needed
    //
    function PopulateControlPage() {}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // PopulateGPIOConfigPage - Populate the configuration page as needed
    //
    function PopulateConfigPage() {}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // PopulateGPIOPages - Populate the GPIO pages with config info
    //
    function PopulateGPIOPages() {

        //
        // Don't bother unless something has changed (in which case, var Populated fill be false)
        //
        if( Populated ) {
            return;
            }

        Populated = 1;

        var ValueTable = document.getElementById("GPIOValues");
        ValueTable.innerHTML = OutputText;

        var NamesTable = document.getElementById("GPIONames");
        NamesTable.innerHTML = OutputText;

        GPIOInfo.GPIOInfo.forEach(function (GPIO) { 

            if( GPIO.Mode == "Input" )
                return;

            //
            // Make an entry in both tables for this GPIO
            //
            var GPIOEntry = ControlTemplate.replaceAll("$ID"   ,GPIO.ID)
                                           .replaceAll("$UNAME",GPIO.UName)
                                           .replaceAll("$UDESC",GPIO.UDesc)
                                           .replaceAll("$CLASS","GPIOValue Switch");
            ValueTable.innerHTML += GPIOEntry;

            var NameEntry = ConfigTemplate.replaceAll("$ID"   ,GPIO.ID)
                                          .replaceAll("$UNAME",GPIO.UName)
                                          .replaceAll("$UDESC",GPIO.UDesc)
                                          .replaceAll("$HNAME",GPIO.HName);
            NamesTable.innerHTML += NameEntry;
            });

        ValueTable.innerHTML += InputText;
        NamesTable.innerHTML += InputText;

        GPIOInfo.GPIOInfo.forEach(function (GPIO) { 

            if( GPIO.Mode == "Output" )
                return;

            //
            // Make an entry in both tables for this GPIO
            //
            var GPIOEntry = ControlTemplate.replaceAll("$ID"   ,GPIO.ID)
                                           .replaceAll("$UNAME",GPIO.UName)
                                           .replaceAll("$UDESC",GPIO.UDesc)
                                           .replaceAll("$CLASS","GPIOValue LED");
            ValueTable.innerHTML += GPIOEntry;

            var NameEntry = ConfigTemplate.replaceAll("$ID"   ,GPIO.ID)
                                          .replaceAll("$UNAME",GPIO.UName)
                                          .replaceAll("$UDESC",GPIO.UDesc)
                                          .replaceAll("$HNAME",GPIO.HName);
            NamesTable.innerHTML += NameEntry;

            PrevGPIOInfo = GPIOInfo;
            });

        //
        // See if user is allowed to rename GPIOs
        //
        if( GPIOInfo.AllowRename == "No" ) {
            document.getElementById("ConfigButton").style.display = "none";
            }
        }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // SetGPIOValues - Set the appropriate GPIO values in the web pages
    //
    function SetGPIOValues() {

        ValueElements = document.getElementsByClassName("GPIOValue");

        for (i = 0; i < ValueElements.length; i++) {
            var Image    = ValueElements[i];
            var GPIOID   = Image.id.replace('Control','').replace('Config','');
            var GPIO     =     GPIOInfo.GPIOInfo.find(function (GPIO) { return GPIO.ID == GPIOID; });
            var PrevGPIO = PrevGPIOInfo.GPIOInfo.find(function (GPIO) { return GPIO.ID == GPIOID; });

            if( GPIO.Mode == "Input" ) { Image.src  = "images/LED"    + GPIO.Value + ".png"; }
            else                       { 
                if( GPIO.Value != PrevGPIO.Value ) {
                    if( GPIO.Value == "On" ) { SwitchOffSound.play(); }
                    else                     { SwitchOnSound.play();  }
                    }
                Image.src  = "images/Switch" + GPIO.Value + ".png";
                }
            };

        PrevGPIOInfo = GPIOInfo;
        }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // ToggleGPIO - Change state of GPIO output
    //
    function ToggleGPIO(Element) {
        var GPIOID = Element.id.replace('Control','').replace('Config','');
        var GPIO   = GPIOInfo.GPIOInfo.find(function (GPIO) { return GPIO.ID == GPIOID; });

        if( GPIO.Mode == "Input" ) {
            return;
            }

        ServerCommand("ToggleGPIO",GPIOID);
        }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // ChangeGPIONames - Change the GPIO user names (and comments)
    //
    function ChangeGPIONames() {

        GPIOInfo.GPIOInfo.forEach(function (GPIO) { 
            GPIO.UName = document.getElementById("UName" + GPIO.ID).value;
            GPIO.UDesc = document.getElementById("UDesc" + GPIO.ID).value;
            });

        Populated = 0;
        ServerCommand("SetGPIOInfo",GPIOInfo);
        GotoPage("ControlPage");
        }
