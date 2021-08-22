# SkinsAPI

A simple and fast Minecraft avatar API built with JS, ExpressJs and MongoDB.

I made this a while ago so the code isn't that great.

## Features

- [x] Player name support
- [x] UUID Support
- [x] Request custom size
- [x] Get skin
- [x] Get head
- [x] Support for second layer of skin
- [ ] Get 3d Model of skin
- [ ] Get 3d Model of head
- [ ] Proxy requests when being rate limited

## Usage

A public endpoint for this can be found at `https://skins.danielraybone.com/`.  
*name can be a uuid*

`/head/:name` - Request the head for a user.  
`/skin/:name` - Request the raw skin for a user.
`/3d/skin/:name` - Request the 3D skin for a user.
`/3d/head/:name` - Request the 3D head for a user.

All endpoints (but skin) can return a custom size. Append ?width=\<size in px> to the request. This can also be done with height. (If only the width/height is given, both are set to the same value given)  
By default, the head endpoint returns a 300x300 px head.  

Example: `https://skins.danielraybone.com/head/jeb_?width=100`  
Example: `https://skins.danielraybone.com/head/jeb_?height=100`  
Example: `https://skins.danielraybone.com/head/jeb_?width=230&height=100`  

If a invalid name or UUID is given, steve will be returned instead.

You can also add `?return=base64` as a parameter to have a base64 version of the image returned.
