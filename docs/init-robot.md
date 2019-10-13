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


# Advanced
## `motor_max`

In order to prevent destruction of mini-bots the motor board by default will not provide more than 25% of the output power it is capable of through use of a scaling clamp.

:::warning
If your motors are rated at anything less than 12V then overriding this value could destroy your motors.
:::

If you are using your own motors and would like to overide this limit to make your robot run faster then you can by initalizing your robot object like so:

``` py
import robot
R = robot.Robot(motor_max=100)
```
The value you enter here represents the percentage the motor board will scale its voltage output by. The maxium voltage of 100% is 12V, 50% would give 6V and the default is 25% evqualting to 3V peak.
If you are using VEX motors then they are rated at 7.2V so you should not enter a value larger than 60%. Entering values above 100 will have no hardware effects and may cause software bugs.

## `servo_defaults`

You may want your robot to put its servos to a particular possition at the start of a round. You can do this by passing a dictionary of the servos and their possitions to the robot object like so:

```py
import robot

# Set servo 1 to 50 and servo 4 to -100
my_servo_positions = {
  1: 50
  4: -100
}

R = robot.Robot(servo_defaults=my_servo_positions)
```

## `init`

Allows the robot object to be instanstated without waiting for the start signal. You can then do stuff with the robot object and then when you are ready wait for start.

```py
import robot
R = robot.Robot(init=False)

# Get a look at the arena before the round starts
markers = R.see()

R.wait_start()

# The round code
```

:::warning
You should note that if your robot starts moving before the round begins then you are liable for any penatly at the judges descression including but not limited to disqualification from the round.
:::

## `use_usb_camera`
By default `False`. Set it to `True` and it will use an external camera connected to one of the USB ports. When `False` and `R.see()` is called, a photo is taken using the camera on the brainbox.
