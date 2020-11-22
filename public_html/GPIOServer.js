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
//      Config->
//          {GPIO#}->'5'
//              {Mode}   -> [  'Input', 'Output' ],        # (Required)
//              {Logic}  -> [ 'Normal', 'Invert' ],        # Whether On means High ("Normal") or Low ("Invert")
//              {Pull}   -> [   'High',    'Low' ],        # If Mode:Input,  whether input is pulled high or low
//              {Boot}   -> [     'On',    'Off' ],        # If Mode:Output, state set at boot time
//              {Value}  -> [     'On',    'Off' ],        # Current value
//              {Name}   -> "Keurig"                       # User assigned name
//              {Comment}-> "Coffee maker in the kitchen"  # User assigned comment
//
////////////////////////////////////////////////////////////////////////////////

    var ConfigSystem = location.hostname;
    var ConfigAddr   = "ws:" + ConfigSystem + ":2021";

    var ConfigSocket;
    var ConfigData;

    var WindowWidth;
    var WindowHeight;

    var GPIOConfig;
    var OrigGPIOConfig;

    //
    // One line of the GPIO control table listing
    //
    var GPIOTemplate = '\
        <tr><td style="width: 20%">&nbsp;</td>                              \
            <td>$UNAME</td><td>$ONOFF</td><td>$UDESC</td>                   \
            </tr>';

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

        ConfigConnect();
        }

    //
    // Send a command to the web page
    //
    function ConfigCommand(Command,Arg1,Arg2,Arg3) {
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

            console.log("Msg: "+Event.data);

            if( ConfigData["Type"] == "GetGPIOConfig" ) {
                GPIOConfig      = ConfigData.State;
                OrigGPIOConfig  = JSON.parse(Event.data).State;     // Deep clone
                console.log(GPIOConfig);

                SysNameElements = document.getElementsByClassName("SysName");
                for (i = 0; i < SysNameElements.length; i++) {
                    SysNameElements[i].innerHTML = OrigGPIOConfig.SysName;
                    };

                GotoPage("ControlPage");
                return;
                }

            if( ConfigData["Type"] == "SetGPIOConfig" ) {
//                console.log(ConfigData);
                return;
                }

            //
            // Unexpected messages
            //
            console.log(ConfigData);
            alert(ConfigData["Type"] + " received");
            };

        ConfigSocket.onopen = function(Event) {
            ConfigCommand("GetGPIOConfig");
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
    function PopulateControlPage() {
        var GPIOTable = document.getElementById("GPIOTable");
        GPIOTable.innerHTML = "";

        GPIOConfig.GPIOS.forEach(function (GPIO) { 

            //
            // Make an entry in the table for this GPIO
            //
            var GPIOEntry = GPIOTemplate.replaceAll("$UNAME",GPIO.UName)
                                        .replaceAll("$UDESC",GPIO.UDesc)
            GPIOTable.innerHTML += GPIOEntry;
            });
        }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // PopulateGPIOConfigPage - Populate the configuration page as needed
    //
    function PopulateConfigPage() {
        }
