---
title: Patching the Robot
category: Tools
position: 6
---
# Patching the Robot

An important part of looking after your robot is making sure its software is up to date. Over time **RoboCon** may release patches which will allow you to upgrade your robot. Follow the steps bellow to bring your robot up to date.

## Steps to Patch

1. Download the patch from the [blog](https://euc-word-edit.officeapps.live.com/blog/README.md) to the computer you will be connecting your BrainBox to. 
2. [Turn on](https://euc-word-edit.officeapps.live.com/docs/turning-everything-on.md) and [connect](https://euc-word-edit.officeapps.live.com/docs/connecting.md) to your robot. 
3. Navigate to the editor <http://robot.go/editor> by clicking the orange button 
4. Select the upload button (indicated below). 

   ![](images/upload-button.png)
5. Navigate to where you have saved the patch and click OK. 
6. Select the patch file in the left-hand pane. The patch will show on the code view as Base64 encoded data (random-looking text). 
7. Click the "Run" button (green arrow on right-hand pane). 

   ![](images/run-button.png)
8. After a few moments your BrainBox should reboot, and the LED will either turn off or remain on. You will lose connection with it while it does this. 
9. The BrainBox LED will eventually start flashing again to show it has rebooted successfully. 
10. If your PC has not automatically connected, connect to it using the WiFi. Once reconnected, refresh your browser and open a project from the left-hand side of the editor. Check that the patch version is correct in the right-hand side bar.  
11. If you have any issues, please contact us using the [forum](https://euc-word-edit.officeapps.live.com/forum/). 

:::tip
Your robot will restart as part of the patching process, so you will loose connectivity with it for about half a minute. Your laptop should automatically reconnect to the robot when it turns back on. If you cannot connect to your robot, please contact us using the [forum](/forum/).
:::