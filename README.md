smartmirror
===========

This is a fork of MagicMirror which aims to be used without a webserver.
Also, it's in german.

Icons taken from

http://thenounproject.com/term/agriculture/4221/

http://thenounproject.com/term/grass/18888/

http://thenounproject.com/term/snowflake/30004/

http://thenounproject.com/term/umbrella/9933/


IPTables Rules included

Online Banking using HBCI with aqhbci

Quick Setup Guide for HBCI Info with PIN/Tan:

apt-get install aqbanking-tools

aqhbci-tool4 adduser -t pintan --context=1 -b blz -u username -c username -N "Your Realname" -s  https://url/to/the/PinTanServlet

aqhbci-tool4 getsysid

aqhbci-tool4 getaccounts

aqhbci-tool4 mkpinlist -o /path/to/pinfile



Add Pin to Pinfile

Done


Todo: Forecast


For more information on the source project, visit:

(http://michaelteeuw.nl/tagged/magicmirror)
