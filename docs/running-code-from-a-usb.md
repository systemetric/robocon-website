---
title: USB Tricks
category: Tools
position: 4
---
# USB Tricks

**INFO** : The brain only checks for the presence of USB sticks at boot, only plug and unplug USB sticks when the brain is off (front panel blue light off).

:::warning  

During the competition we need to have unrestricted access to at least one USB port, if you want to use a USB stick during the competition it must leave enough space around at least one port to insert our low profile arena stick.

:::

## **Running your code from a USB :**

When started, using the start button the robot will default to running the last piece of code written in the editor. In some cases at the competition it can be useful to be able to run code from a USB stick.

1. Place a file called `main.py` or `code.zip` (which must include a file called `main.py`) in the root directory of the USB stick on another computer.
2. Turn on the robot using the red power button.
3. The file will be automatically copied from the USB stick
4. Press the black start button

:::warning  

* During the competition we need to have unrestricted access to at least one USB port, if you want to use a USB stick during the competition it must leave enough space around at least one port to insert our low profile arena stick.
* Code copied from USB sticks is not listed, sufficiently broken code may crash not just the user code, but also the web interface preventing the robot from reaching "Blinky". See [troubleshooting](https://hr-robocon.org/docs/troubleshooting.html#troubleshooting) for details about what the LEDs mean. It is highly recommended for users to export working code from the editor to the USB stick rather than editing code directly. See [troubleshooting]((https://hr-robocon.org/docs/troubleshooting.html#the-brainbox-appears-to-power-up-but-i-can-t-connect-to-the-website-and-the-blue-led-lights-but-never-starts-flashing).) for how to recover a robot which does not boot to Blinky.

:::

**INFO** : Code uploaded using the USB stick will not appear in the editor.

**INFO** : To run the code uploaded from the USB stick use the Black "Start Button" or http://robot.go/run. The code can only be run once per boot.
