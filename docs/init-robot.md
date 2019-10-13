---
title: Initialising the Robot
category: Programming
position: 2
---
# Initialising the Robot

When using Python to program your robot, you must remember to initialise the robot. If you're using Blockly, this is done automatically.

All of the code required to control the Robot is located in the `robot` python module.
To import the module, and initialise the robot use the following code:

```python
import robot
R = robot.Robot()
```

When you initialise the robot with `robot.Robot()`, your code will be paused until the hardware start button or Shepherd run button is pressed. When the Robot is waiting for either of these buttons to be pressed, the blue status LED will flash on and off.

## Optional Parameters
```python
robot.Robot(use_usb_camera=False, motor_max=25, servo_defaults=None)
```

### `use_usb_camera`
By default `False`. Set it to `True` and it will use an external camera connected to one of the USB ports. When `False` and `R.see()` is called, a photo is taken using the camera on the brainbox.

:::warning While the option is there, as of 2019 external USB cameras are not supported:::

### `motor_max`
The maximum power to allow for the motors. By default it is set to 25. This is because the motors we give out are rated for 3V, so they are not suitible for the 12V the brainbox can supply when motor power is at 100.

### `servo_defaults`
If your robot requires servos to be set in a position before wating for start, set this parameter to a dictionary containing the required positions.
```python
R = robot.Robot(servo_defaults={1: 25, 2:50})
```
