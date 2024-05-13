---
title: Hello Example
category: Tutorials
position: 8
---
# Example

Here is an example to show you how to use the RoboCon libarry. Its a program
which:
1. Turns until it see's a cube of interest
2. Aligns itself with that cube
3. Drives to the cube
4. Drives back home

```py
import time
import robot

# --- Constants ---
# TODO: FOR YOU TO UPDATE FOR YOUR ROBOT, SEE HOW FAST YOUR ROBOT IS ABLE TO
# DRIVE 1 METER AND TURN 90 DEGREES AND UPDATE THE NUMBERS BELOW.
R = robot.Robot()  # Initialize the robot

MOTOR_POWER_1 = 100   # The power which is used with the first motor
MOTOR_POWER_2 = 100   # The power which is used with the second motor
TIME_FOR_1M = 1.5     # Time to travel 1 meter
TIME_FOR_90DEG = 1.5  # Time to turn 90 degrees
SEARCH_ANGLE = 60     # Angle increment for marker search
ALIGN_TOLERANCE = 10  # Tolerance for marker alignment (degrees)
ALIGN_ATTEMPTS = 3    # Max attempts to align with a marker
STEP_SIZE_M = 1       # Distance to drive in each step

# The markers which are on the arena wall behind our home zone
# R.zone() is your starting zone
HOME_WALL_MARKERS = [i + R.zone() + 100 for i in range(0, 5)]

# List of the cubes for your robot to go and find
CUBES_TO_FIND = [i + R.zone() for i in range(0, 5)]


# --- Functions ---

def drive_forward(distance):
    """TODO: You may need to change the sign depending on how your robot is
    wired"""
    R.motors[1] = MOTOR_POWER_1
    R.motors[2] = MOTOR_POWER_2
    time.sleep(distance * TIME_FOR_1M)
    R.motors[1] = 0
    R.motors[2] = 0


def turn_clockwise(angle):
    """TODO: You may need to change the sign depending on how your robot is
    wired"""
    R.motors[1] = MOTOR_POWER_1
    R.motors[2] = -MOTOR_POWER_2
    time.sleep(angle * TIME_FOR_90DEG)
    R.motors[1] = 0
    R.motors[2] = 0


def align_with_marker(code):
    """`code` - the code of the marker to which the robot should align
    Returns:
     - True if the robot is aligned with the marker
     - False otherwise
     """
    for i in range(0, ALIGN_ATTEMPTS):
        markers = R.see(look_for=code)
        if len(markers) == 0:
            return False
        marker = markers[0]
        if -ALIGN_TOLERANCE < marker.bearing.y < ALIGN_TOLERANCE:
            return True
        # Saw marker but we need to turn to be aligned
        turn_clockwise(marker.bearing.y)
    return False


def find_and_face_marker(marker_type):
    """Turn the robot twice round to find a marker of a given marker_type.
    `marker_type` - The marker_type of the marker to look for
    Returns:
     - True: The robot is facing the marker marker_type
     - False: The robot couldn't find the marker
     """
    for i in range(0, 720, SEARCH_ANGLE):
        markers = R.see(look_for=marker_type)
        if len(markers) == 0:
            # No markers found so turn and we might see one next time
            turn_clockwise(SEARCH_ANGLE)
        else:
            marker = markers[0]  # The closest marker
            if align_with_marker(marker.code) is True:
                # The robot is now facing the marker
                return marker
            # We couldn't see the marker this time that we looked
            print("Lost tracking on marker")
    return False


def drive_to_marker(marker, overshoot):
    """Drive in steps realigning each step towards a given marker
    `marker` - The marker to drive towards
    `overshoot` - The distance to drive further than the marker. This makes sure
                  that we get there. Negative values will drive short of the
                  marker.
    Returns:
    - True: The robot has reached the marker
    - False: The robot lost sight of the marker
    """
    while marker.dist > STEP_SIZE_M:
        drive_forward(STEP_SIZE_M)
        markers = R.see(look_for=id)
        if len(markers) == 0:
            # We drove forward and can no longer see the marker
            # Return False to show we failed to reach the marker
            return False
        marker = markers[0]
        align_with_marker(marker.code)
    drive_forward(marker.dist + overshoot)
    return True


def go_to_marker(marker_type, overshoot=0.0):
    """Will turn and drive until the robot is at a marker of the given marker_type.
    `overshoot` - The distance to drive further than the marker. This makes sure
                  that we get there. Negative values will drive short of the
                  marker.
    Returns:
    - True: The robot has reached the marker
    - False: The robot lost sight of the marker
    """
    while True:
        marker = find_and_face_marker(marker_type)
        if marker is False:
            print(f"{marker_type} not found, driving forward to improve the view")
            drive_forward(STEP_SIZE_M)
        else:
            if drive_to_marker(marker, overshoot) is False:
                print("Lost marker whilst driving to it")
            else:
                return True  # At the marker

        # Maybe we have hit something, so back up and try again
        drive_forward(-STEP_SIZE_M)


def main():
    """Forever drive to markers, then drive home. The reverse is included so
    as not to interfere with any other marker which we might have just carried
    home with us."""
    while True:
        go_to_marker(CUBES_TO_FIND, overshoot=0.1)
        go_to_marker(HOME_WALL_MARKERS, overshoot=-0.1)
        drive_forward(-0.2)
        turn_clockwise(180)


main()
```