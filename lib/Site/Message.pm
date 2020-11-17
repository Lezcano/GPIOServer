#!/dev/null
#
########################################################################################################################
########################################################################################################################
##
##      Copyright (C) 2020 Peter Walsh, Milford, NH 03055
##      All Rights Reserved under the MIT license as outlined below.
##
##  FILE
##
##      Site::Message.pm
##
##  DESCRIPTION
##
##      Messaging functions (status and error reporting to console) for applications
##
##  DATA
##
##      None.
##
##  FUNCTIONS
##
##      Message($Msg)                   # Print out a message to the user
##      ConsoleMessage($Msg)            # Print out a message on the console
##
##  ISA
##
##      None.
##
########################################################################################################################
########################################################################################################################
##
##  MIT LICENSE
##
##  Permission is hereby granted, free of charge, to any person obtaining a copy of
##    this software and associated documentation files (the "Software"), to deal in
##    the Software without restriction, including without limitation the rights to
##    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
##    of the Software, and to permit persons to whom the Software is furnished to do
##    so, subject to the following conditions:
##
##  The above copyright notice and this permission notice shall be included in
##    all copies or substantial portions of the Software.
##
##  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
##    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
##    PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
##    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
##    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
##    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
##
########################################################################################################################
########################################################################################################################

package Site::Message;
    use base "Exporter";

use strict;
use warnings;
use Carp;

use Sys::Syslog qw(:standard :macros);

our @EXPORT  = qw(&Message
                  &ConsoleMessage
                  );               # Export by default

our $VERSION = '2020.11_16';

########################################################################################################################
########################################################################################################################
##
## Message - Show message to the user
##
## Inputs:      Msg        Message to print
##              Fail       If message indicates a failure, (==1) print in Red, else (==0) print in Green
##
## Outputs:  None.
##
sub Message {
    my $Msg  = shift // "";
    my $Fail = shift // 0;

    #
    # Put the message in 3 places: System log, boot screen, and program log (captured from STDOUT)
    #
    ConsoleMessage ("**** AppDaemon: $Msg",$Fail);
    syslog(LOG_CRIT,"**** AppDaemon: $Msg");

    print "**** AppDaemon: $Msg\n";
    }


########################################################################################################################
########################################################################################################################
##
## ConsoleMessage - Show message in boot screen
##
## Inputs:      Msg        Message to print
##              Fail       If message indicates a failure, (==1) print in Red, else (==0) print in Green
##
## Outputs:  None.
##
sub ConsoleMessage {
    my $Msg  = shift;
    my $Fail = shift // 0;

    return
        unless IAmRoot();

    #
    # Colors for boot console messages
    #
    my $RED   = '\033[0;31m';
    my $GREEN = '\033[0;32m';
    my $NC    = '\033[0m';          # No Color

    if( $Fail ) { TimeoutCommand("sudo sh -c 'echo \"[${RED}FAILED${NC}] $Msg\"   >/dev/tty0'"); }
    else        { TimeoutCommand("sudo sh -c 'echo \"[${GREEN}  OK  ${NC}] $Msg\" >/dev/tty0'"); }
    }



#
# Perl requires that a package file return a TRUE as a final value.
#
1;
