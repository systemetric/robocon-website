---
title: 'Software Update #1'
date: '2019-01-12 10:19:07'
excerpt: >-
  We've released a patch for the robots. Learn how to apply it so you're using
  the latest software.
layout: PostLayout
---

Download it [here](/patch-2019-01-12.zip), and learn how to apply it [here](/docs/patching-the-robot.md).

## Changelog

### Shepherd *(The Web Interface)*
* Updated the on-robot documentation
* Added a Blockly block for determining the zone the robot started in
* Added other resolutions to the Blockly vision block
* Added the ability to hide the sidebars of the editor

### Internals
* Added mechanism for patching the robot
* Reduced the boot time of the robot from ~24s to ~17s
* Fixed issues with USB sticks being detected
* Updated the robot library to recommend the latest versions of the internal BrainBox components


