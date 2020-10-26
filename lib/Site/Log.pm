#!/dev/null
#
########################################################################################################################
########################################################################################################################
##
##      Copyright (C) 2020 Peter Walsh, Milford, NH 03055
##      All Rights Reserved under the MIT license as outlined below.
##
##  FILE
##      Site::Log.pm
##
##  DESCRIPTION
##      Simple logging functions for error handling.
##
##  DATA
##
##      $::Mask                     # syslog() log mask
##
##  FUNCTIONS
##
##      InitLog($Name,$Verbose)     # Initialize logging to specific log name
##
##      LogDebug ($Msg)             # Report debugging information
##      LogNotice($Msg)             # Report informational note and return
##      LogError ($Msg)             # Report an error and return
##      LogCrit  ($Msg)             # Report a severe error and die
##
##      CallerName()                # Return name and line number of caller
##
##  NOTE1
##
##      All the Log() functions return a function value of undef. These may safely be
##        used in a return statement to both log a message and return a failed call.
##
##      Example:
##
##          return LogError("FileNotFound: $Filename")
##              unless -e $FileName;
##
##  NOTE2
##
##      The CallerName() formats the [grand-]caller's function name appropriate for
##        appending to a message.
##
##      Example usage:
##
##          "Some Message &CallerName()" => "Some Message (Modulus.pm: line 120)"
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

package Site::Log;
    use base Exporter;

use strict;
use warnings;
use Carp;

use Sys::Syslog qw(:standard :macros);
use File::Basename;

our @EXPORT  = qw(&InitLog
                  &LogDebug
                  &LogNotice
                  &LogError
                  &LogCrit
                  &CallerName);     # Export by default

########################################################################################################################
########################################################################################################################
##
## Data declarations
##
########################################################################################################################
########################################################################################################################

our $Verbose = 0;           # TRUE if Debug messages should be printed

our $Mask = LOG_MASK(LOG_NOTICE) | LOG_MASK(LOG_ERR) | LOG_MASK(LOG_CRIT);

########################################################################################################################
########################################################################################################################
#
# InitLog - Initialize the logging system
#
# Inputs:   Name of log to open (== name of log file in /var/log)
#           TRUE  if verbose mode enabled
#
# Outputs:  None.
#
sub InitLog {
    my $LogPrefix = shift;
       $Verbose   = shift;

    # 
    # LOG_DEBUG : When is run with $Verbose TRUE
    # LOG_NOTICE: General state changes: server up/down, remote connection established, &c.
    # LOG_ERROR : Non-fatal error, such as web requesting an unknown keypress
    # LOG_CRIT  : Fatal (to this program) error, such as "cannot open KB device"
    #
    openlog($LogPrefix, $Verbose > 0 ? "perror" : "",LOG_LOCAL0);    # Print to stderr if verbose

    $Mask |= LOG_MASK(LOG_DEBUG)
        if $Verbose;

    setlogmask($Mask);
    }


########################################################################################################################
########################################################################################################################
#
# LogDebug - Log debugging informational message
#
# Inputs:      Message to log
#
# Outputs:     undef
#
# NOTE: Used for non-error messages.
#
sub LogDebug {
    my $Msg = shift;

    syslog(LOG_DEBUG,$Msg);

    return undef;
    }


########################################################################################################################
########################################################################################################################
#
# LogNotice - Log informational messages
#
# Inputs:      Message to log
#
# Outputs:     undef
#
# NOTE: Used for non-error messages.
#
sub LogNotice {
    my $Msg = shift;

    syslog(LOG_NOTICE,$Msg);

    return undef;
    }


########################################################################################################################
########################################################################################################################
##
## LogError - Manage detected errors which are not critical to the caller
##
## Inputs:      Message describing error
##
## Outputs:     undef
##
## NOTE: Used for non-fatal (to this program) errors, such as bad user request
##
sub LogError {
    my $Msg    = shift;
    my $Severe = shift // 1;
    
    syslog(LOG_ERR,"**** $Msg" . CallerName());

    return undef;
    }


########################################################################################################################
########################################################################################################################
##
## LogCrit - Log critical error and die
##
## Inputs:      Message to log
##
## Outputs:     None. (Never returns)
##
## NOTE: Used for fatal (to this program) errors, kills the process, never returns.
##
sub LogCrit {
    my $Msg = shift;
    
    syslog(LOG_CRIT,"**** $Msg " . CallerName());
    syslog(LOG_CRIT,"**** Critical error - exiting.");
    syslog(LOG_CRIT,"");
    syslog(LOG_CRIT,"");

    exit(1);
    }


########################################################################################################################
########################################################################################################################
##
## CallerName - Return name of calling function and line number (for logging)
##
## Inputs:      None.
##
## Outputs:     Formatted string of [grand-]caller for log messages (ex: "MDInit, line 10")
##
## NOTE: Called from log functions, goes back 2 frames to get log message caller.
##
sub CallerName {

    #
    # Remove paths from the filename for a more pleasing output.
    #
    my ($Package, $Filename, $Line, @unused) = caller(1);
    my ($BaseName,$Path,$Suffix) = fileparse($Filename, qr/\.[^.]*/);

    return " ($BaseName$Suffix: line $Line)";
    }



#
# Perl requires that a package file return a TRUE as a final value.
#
1;
