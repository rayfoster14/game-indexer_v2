# Game Indexer v2

This script will scan and index games and export a JSON and XLSX file with the corresponding data. The script will dynamically find header information from the files it finds and will report on extra data.

## Usage

1. Download source or release
2. Run the executable, or run from source by using ```node main.js``` (if running from script, install dependencies with npm first with ```npm install```.)
3. On first run, a config file will need to be configured. Follow the steps accordingly. If failed after running the config setup, run once again.

## Program Instruction List

The script will follow this logical order: 

1. Get list of all files from directories
2. List sizes of all files found
3. Extract header data from each file
4. Lookup header data on database from each file
5. Extra processing (like looking for multi disc files or translation patches)
6. Organises records
7. Exports JSON and XLSX file

## Directory Structure

The script is making some assumptions on how roms are laid out. The choice was to have the most common layout either for ripping method or typical access methods. Please follow this structure:

| Platform | Structure | Notes |
|---|---|---|
|Gameboy | Single Directory | All GB, SGB and GBC games in one directory (_ENG appended to end for english patch)|
|Gameboy Advance| Single Directory| All GBA games in one directory|
| Nintendo DS | Single Directory | All NDS games in one directory|
| Nintendo 3DS | Single Directory | Trimmed 3DS games in one directory|
| NES/FAMICOM | Nested Directory | These games cannot be looked up on database. From root each game has it's own folder with the name of that folder being the title. Inside this folder CART.bin or CART.nes will be indexed. |
| SNES/SFC |Single Directory| SFC files will be in one directory (_ENG appended to end for english patch)|
| Nintendo64 | Single Directory | All z64 games added to one directory|
| Gamecube | Nested Directory | Each Gamecube game has it's own directory, and game.iso (disc1) and disc2.iso (disc2) will be indexed|
| Wii | Nested Directory | Each Wii Game has it's own directory, and the wbfs files will be indexed. |
| WiiU | Nested Directory | Each WiiU game will have it's own directory, a WUX file will be indexed, along with the game.key noted for decryption. If WUX file is not found, an RPX file will be assumed to exist, from a decompiled version of the game. (/code /content /meta version) |
| PS1 | Nested Directory | Each game will have it's own directory, .bin/.img will be indexed. If multiple bin files are found, ,multi disc is assumed and disc indexed order (1,2,3.etc) will be assumed in the order they're read (ie alphabetically) |
| PS2 | Single Directory | All .iso games will be in the one directory. Multi-disc will be assumed from header information |
| PS3 | Single Directory | All iso games will be in one directory |
| PSP | Nested Directory | Each game has it's own directory with the ISO file inside.|
| XBOX | Nested Directory | Each game has it's own directory with both the 00.iso and 01.iso inside. |
| XBOX360 | Nested Directory | Follows the exact same structure as an 'install to External disk' options from a regular unmodded xbox360. Navigate to the hidden folder in root of USB and find the directory with all of the games. This is what the script will be indexing. |