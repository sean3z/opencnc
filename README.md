## OpenCnC
This is an open source WOLv2 emulator for Command and Conquer. It was originally created as a personal experiment to learn more about [node.js](http://nodejs.org/). Overall, this implementation isn't much different from other emulators such as PvPGN (minus the Blizzard overhead). Ladder support and User creation are WOL API wrappers for the [wol-ladder](https://github.com/sean3z/wol-ladder) project.

### Status
Active development
 
### Games Supported
* Tiberian Sun
* Firestorm
* Red Alert 2
* Yuri's Revenge

### Usage
1. Install [node.js](http://nodejs.org/) version >= 0.10.11. 
2. Edit `localhost` out of `src\WOLv2\servserv.js` to point to your server
3. `npm start`