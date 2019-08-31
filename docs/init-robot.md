---
title: Initialising the Robot
category: Programming
position: 2
---
# Initialising the Robot

When using Python to program your robot, you must remember to initialise the robot. If you're using Blockly, this is done automatically.

All of the code required to control the Robot is located in the `robot` python module.
To import the module, and initialise the robot use the following code:

```py
import robot
R = robot.Robot()
```

When you initialise the robot with `robot.Robot()`, your code will be paused until the hardware start button or Shepherd run button is pressed. When the Robot is waiting for either of these buttons to be pressed, the blue status LED will flash on and off.

# Advanced
## Providing more power to motors

In order to prevent destruction of mini-bots the motor board by default will not provide more than 25% of the output power it is capable of through use of a clamp.

:::warning
If your motors are rated at anything less than 12V then overriding this value could destroy your motors.
:::

If you are using your own motors and would like to overide this limit to make your robot run faster then you can by initalizing your robot object like so:

``` py
import robot
R = robot.Robot(motor_max=100)
```

Entering values above 100 will have no hardware effects and may cause software bugs.

## Servo default positions

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

## Spare computing power

To improve responsiveness of the vision system it is always running in the background and uses 4 threads, this and shepherd consumes about 95% of the avalible CPU time on the Pi. It also means that the `GIL` is constantly in use. If you want to do something either really computationally intensive or with threading you may want to reduce the number of threads running vision. To do this you can initalize the robot object with less threads dedicated to vision:

```py
import robot

# Set the worker count to 2 instead of 4
R = robot.Robot(vision_worker_thread_count=2)
```

## init

Allows the robot object to be instanstated without waiting for the start signal. You can then do stuff with the robot object and then when you are ready wait for start.

```py
import robot
R = robot.Robot(init=False)

# Get a look at the arena before the round starts
markers = R.see()

R.wait_start()

# The round code
```

You should note that if your robot starts moving before the round begins then you are liable for any penatly at the judges descression including but not limited to disqualification from the round.
