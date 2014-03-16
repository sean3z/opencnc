## OpenCnC
This is an open source WOLv2 emulator for Command and Conquer. It was originally created as a personal experiment to learn more about [node.js](http://nodejs.org/). Overall, this implementation isn't much different from other emulators such as PvPGN (minus the Blizzard overhead). Ladder support and User creation have been intentionally removed from this release.

### Status
Passive development
 
### Games Supported
* Tiberian Sun
* Firestorm
* Red Alert 2
* Yuri's Revenge

### Usage
1. You'll need to install [node.js](http://nodejs.org/) version >= 0.10.11. 
2. Edit `localhost` out of `servers\WOLv2\servserv.js` to point to your server
3. Afterward, you can either use `./run.sh` (built for \*nix) or startup each server individually.
   
    ```
    $ node servserv.js
    $ node tiberiansun.js
    ```

    *__Note__: for RA2 to function, both gameres.js and ladder.js must also be running*

### Contributing
Feel free to fork submit pull requests.

### License
OpenCnC is licensed under the [MIT license](https://github.com/sean3z/opencnc/blob/master/LICENSE.txt).