# SkinsAPI

A simple and fast Minecraft avatar API built with JS, ExpressJs and MongoDB.

A public endpoint for this can be found at `https://skins.danielraybone.com/`.

## Features

- [x] Player name support
- [x] UUID Support
- [x] Request custom size
- [x] Get skin
- [x] Get head
- [x] Get 2d full front body of skin
- [x] Get 2d bust of skin
- [x] Get cape
- [x] Get profile of player (See example below)
- [x] Support for second layer of skin
- [x] Get 3d Model of skin
- [x] Get 3d Model of head
- [ ] Proxy requests when being rate limited

## Endpoints

### Global info

All API requests are GET requests.  
:name - Can be a players username (iAverage) or UUID (1b8f18cf-7fb6-4a7a-8c25-c1ef296459f2) with or without dashes (-)  
If a invalid name or UUID is given, steve will be returned instead.  
The second layer of the skin is enabled by default and can be disabled by using the query string params `?overlay=false`
When a skin needs to be rechecked for updated, the api will return the skin in the cache. It will also begin to check for a updated skin.

### v1

`/v1/profile/:name` - Returns the players profile.  
`/v1/skin/:name` - Returns the skin of the player.  
`/v1/head/:name` - Returns the head of the player.  
`/v1/body/:name` - Returns the 2d version of the players full body, as if you was facing them in game. [Example](https://skins.danielraybone.com/v1/body/iAverage)  
`/v1/cape/:name` - Returns the users first cape (Doesn't include Optifine capes)
`/v1/bust/:name` - Returns the bust of the players skin (Top half of the skin) [Example](https://skins.danielraybone.com/v1/bust/iAverage)  
`/v1/render/body/:name` - Returns a 3d render of the players full body. [Example](https://skins.danielraybone.com/v1/render/body/iAverage)  
`/v1/render/head/:name` - Returns a 3d render of the players head. [Example](https://skins.danielraybone.com/v1/render/head/iAverage)

### v1 - Query string params

`?overlay=true|false` - Option to disable the players second layer. Currently only works on 2d renders (head, body, bust).
`?base64=true` - Option to return a base64 version of the image. Applies to routes returning an image.
`?width=300` - Custom return width in pixels. Max `1000`. Currently doesn't work with 3d renders.
`?height=300` - Custom return height in pixels. Max `1000`. Currently doesn't work with 3d renders.

### v1 - Headers

`X-Error` - If any errors or problems occur while processing the request, this header will be set. All routes will return some info, steve skin/profile or a previously cached skin/profile.
