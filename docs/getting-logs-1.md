---
title: Getting Logs
category: Tools
position: 5
---
![](/images/binarycode.jpg)

# Getting Logs

When running your robot code you can see the logs from the robot in the editor. Sometimes it's useful to be able to view the logs later to analyse what happened.

:::warning

* Be careful when reusing USB sticks to avoid accidentally running code from the USB Stick!

:::

1. Insert a USB stick in the robot before turning it on.
2. The log file will be automatically written to the USB stick as "logs.txt"
3. Remember to fully power down the robot before removing the USB stick

**INFO** **:** 

* Logs are collected whatever way the code is run, but only the most recent logs are preserved
* The log files are also collected during system shutdown leading to worrying messages like:


```
Exception in thread Thread-2:


Traceback (most recent call last):


  File "/usr/lib/python2.7/threading.py", line 801, in __bootstrap_inner

     self.run()

  File "/usr/lib/python2.7/threading.py", line 754, in run

     self.\_\_target(\*self.\_\_args, \**self.__kwargs)

  File "/root/.local/share/virtualenvs/shepherd2-rSdGMoSR/local/lib/python2.7/site

     self.run()

  File "/usr/lib/python2.7/threading.py", line 754, in run

     self.\_\_target(\*self.\_\_args, \**self.__kwargs)

 -packages/robot/wrapper.py", line 251, in wait_start_blink

     self._internal.set_status_led(v)

  File "/root/.local/share/virtualenvs/shepherd2-rSdGMoSR/local/lib/python2.7/site-packages/robot/greengiant.py", line 87, in set_status_led

     self._bus.write_byte_data(_GG_I2C_ADDR, _GG_STATUS, int(on))

  File "/root/.local/share/virtualenvs/shepherd2-rSdGMoSR/local/lib/python2.7/site-packages/smbus2/smbus2.py", line 377, in write_byte_data

     ioctl(self.fd, I2C_SMBUS, msg)

IOError: \[Errno 121] Remote I/O error
```

 These can safely be ignored unless you also see them on the web interface.
