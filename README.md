smartmirror
===========

![alt tag](https://raw2.github.com/Hypfer/smartmirror/master/demo.png)


This is a fork of MagicMirror which aims to be used without a webserver.
Also, it's in german.


If you like my fork consider buying me something from my amazon wishlist
http://www.amazon.de/gp/registry/wishlist/6A82Q6JQNDVG

Weather Warnings from dwd.de
Weather Info from openweathermap.org


Icons taken from

http://thenounproject.com/term/agriculture/4221/

http://thenounproject.com/term/grass/18888/

http://thenounproject.com/term/snowflake/30004/

http://thenounproject.com/term/umbrella/9933/

http://thenounproject.com/term/thunderstorm/8712/

http://thenounproject.com/term/sunscreen/1228/

http://thenounproject.com/term/thermometer/20544/

http://thenounproject.com/term/wind/4252/

http://thenounproject.com/term/snow/20951/

http://thenounproject.com/term/fog/2605/



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



For more information on the source project, visit:

(http://michaelteeuw.nl/tagged/magicmirror)
