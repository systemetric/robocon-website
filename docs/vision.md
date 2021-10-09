---
title: Vision
category: Programming
position: 6
---
# Vision

Computer Vision allows your robots to understand their environment. For the competition, this is used to locate markers. It will give you information about the type of the marker, the distance/angle to the marker, etc.

## Python

To look for markers call `see()`:

```python
markers = R.see()

print(markers)
```

`markers` is a Python list of `marker objects`. Which looks like a the following:

```
[arena Marker 0: 0.856m @0.754 degrees
{
  type = arena
  code = 0
  dist = 0.856
  bearing.y = 0.754
  bearing.x = 1.03e+02
  rotation.y = 5.1
  rotation.x = -11.4
  rotation.z = 9.47
  info = TO BIG TO PRINT
  detection = TO BIG TO PRINT
}
]
```

 Full reference of the properties are further below but some useful properties are:

| Property                  | Description                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `marker.dist`             | Distance to the marker in metres                                                          |
| `marker.bearing.y`        | The angle your robot needs to turn to get to the marker in degrees                                                            |
| `marker.code`             | Numeric code of the marker                                                                |
| `marker.type`             | One of `MARKER_TYPE_ARENA` or `MARKER_TYPE_BASKET`                                        |



## Blockly

Blocks for vision can be found in the **Vision** section.

<!--PI_REMOVE-->

Here's an example of a Blockly program that does some basic vision stuff:

<BlocklySnippet img="vissnip.png" width="779" height="188" />
<!--END_PI_REMOVE-->


## Objects of the Vision System

### `Marker`

- - -

A `Marker` object contains information about a *detected* marker. It has the following attributes:

`dist` :   The distance to the marker from the camera in meters.

`bearing` :   How far the BrainBox would have to rotate to face that marker in degrees. Uses `x` and `y` to describe the rotation from a line projected straight ahead from the BrainBox. See [bearing](#Bearing) for a definition of axises.

`rotation` :   How much the marker would need to be rotated to face the BrainBox. See [rotation](#Rotation) for a definition of axises.

`code`  : What is the ID number of the marker?

`type`  : What kind of marker

`info` :   A [`MarkerInfo` object](#MarkerInfo) describing static properties of the marker.

### `MarkerInfo`

- - -

The `MarkerInfo` object contains information about a marker. It has the following attributes:

`code` :   The numeric code of the marker.

`marker_type` :   The type of object that this marker represents.<br />     One of:

* `MARKER_TYPE_ARENA`
* `MARKER_TYPE_BASKET`

`basket` :    The numeric code of the basket the marker belongs to. `None` if the marker is not a basket. <br />

`offset` :   The offset of the numeric code of the marker from the lowest numbered marker of its type.

`size` :   The size of the marker in metres.
    This is the length of the side of the main black body of the marker.

### `Point`

- - -

A `Point` object describes a position in three different ways. These are accessed through the following attributes:

**image** :   The pixel coordinates of the point in the image, with the origin (0,0) in the top-left of the image.
    This has two attributes: `x` and `y`.

**world** :   The [Cartesian coordinates](https://en.wikipedia.org/wiki/Cartesian_coordinate_system) of the point in 3D space.     This has three attributes: `x`, `y`, and `z`, each of which specifies a distance in metres.     Positions in front of, to the right, or above the camera are positive.
    Positions to the left or below are negative.

**polar** :   The [polar coordinates](https://en.wikipedia.org/wiki/Polar_coordinate_system) of the point in 3D space.<br /> This has three attributes:

`length` :   The distance to the point.

`rot_x` :   Rotation about the x-axis in degrees.
    Positions above the camera are positive.

`rot_y` :   Rotation about the y-axis in degrees.
    Positions to the right of the camera are positive.

For example, the following code displays the polar coordinate of a `Point` object

```python
    print "length", p.polar.length
    print "rot_x", p.polar.rot_x
    print "rot_y", p.polar.rot_y
```

### `Orientation`

- - -

An `Orientation` object describes the orientation of a marker.  It has three attributes:

`rot_x` :   Rotation of the marker about the x-axis.

Leaning a marker away from the camera increases the value of `rot_x`, while leaning it towards the camera decreases it. A value of 0 indicates that the
marker is upright.

`rot_y` :   Rotation of the marker about the y-axis.

Turning a marker clockwise (as viewed from above) increases the value of `rot_y`, while turning it anticlockwise decreases it. A value of 0 means that the marker is perpendicular to the line of sight of the camera.

`rot_z` :   Rotation of the marker about the z-axis.

Turning a marker anticlockwise (as viewed from the camera) increases the value of `rot_z`, while turning it clockwise decreases it. A value of 0 indicates that the marker is upright.


## Definition of Axes

The axis definitions match those in common use, as follows:

**x-axis** :   The horizontal axis running left-to-right in front of the camera.
    Rotation about this axis is equivalent to leaning towards or away from
    the camera.

**y-axis** :   The vertical axis running top-to-bottom in front of the camera.
    Rotation about this axis is equivalent to turning on the spot,
    to the left or right.

**z-axis** :   The axis leading away from the camera to infinity.
    Rotation about this axis is equivalent to being rolled sideways.

:::tip
Axes are all defined relative to the camera not your robot. Since we have
no way to know how you've mounted your camera
:::

## Changing the resolution

The default the camera takes pictures at a resolution of **640x480px**. You can change this by specifying a `res` parameter to `R.see()`. This maybe be helpful when trying to see things far away with more accuracy.

```python
markers = R.see(res=(1920, 1088))
```

You must use one of the following resolutions:

* `(640, 480)`
* `(1296, 736)` *(default)*
* `(1296, 976)`
* `(1920, 1088)`
* `(1920, 1440)`

:::warning Using a higher resolution will increase the amount of time it takes to process the image, but you may be able to see more. Using a smaller resolution will be faster, but markers further away may stop being visible.
:::

Here's a more complete example:

```python
import robot

R = robot.Robot()

markers = R.see()

for marker in markers:
   if marker.info.token_type == robot.TOKEN_GOLD:
       move(marker.dist)
```

## Using USB camera's

:::warning Your robots ability to see is very much dependant on the camera you use. We strongly recomend testing your webcams accuracy and maxium distance against that of the Pi cam in the Brain Box.

Cheap webcameras do tend to hurt how well your robot can see. :::

To use a USB camera you will need to initialize the robot object with the `use_usb_camera` parameter. Then just call `R.see()` as you would normally.

```python
import robot

R = robot.Robot(use_usb_camera=True)

print R.see()
```

You will then need to calibrate your camera as the distance that it reports will not be accurate. You can do this by changing the value in the `usbcamera_focal_lengths` dictionary up or down.

To get the current value print it:

```python
import robot.vision as vision

print vision.usbcamera_focal_lengths
```

Assign a new value and print the distance and rotation use the following code.

```python
# usbcamera_focal_lengths[(resx, resy)] = (newValue,newValue)
# Where (resx, resy) is the resolution that you want to tune
# To set the resolution (640, 480) to the focal length (100,100) do

import robot.vision as vision

vision.usbcamera_focal_lengths[(640, 480)] = (100, 100)

R = robot.Robot(use_usb_camera=True)

while True:
    markers = R.see()
    for marker in markers:
        dist = marker.dist
        rot_y = marker.rot_y
        print "dist:", dist, "rot_y:", rot_y
```

We recommend that you tune this value by placing a marker exactly 2m away, printing `R.see()` (remember to take an average), and tuning the focal length up or down until you get a value that is close to 2m. If you are feeling fancy you could even write a function to automatically tune the value.

The default resolutions are as follows.

```python
usbcamera_focal_lengths = {
    (1920, 1440): (1393, 1395),
    (1920, 1088): (2431, 2431),
    (1296, 976): (955, 955),
    (1296, 736): (962, 962),
    (640, 480): (463, 463),
}
```