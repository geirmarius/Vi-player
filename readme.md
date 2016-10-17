# Vi player
Vi player, or simply Vi, is a customizable user interface which wraps html5 video and audio.

![Example audio player](http://i.imgur.com/Eacn4L0.png)

| Key technologies | Version | Support                                                                           |
| ---------------- | ------: | --------------------------------------------------------------------------------- |
| Custom Elements  | V1      | [caniuse.com/#feat=custom-elementsv1](http://caniuse.com/#feat=custom-elementsv1) |
| Shadow DOM       | V1      | [caniuse.com/#feat=shadowdomv1](http://caniuse.com/#feat=shadowdomv1)             |

## How to use
Vi is built to be very easy to lay out, and be extremly expandable. Here's how to use it "as-is". Check out the [wiki]() (wiki coming soon) for how to customize and write extensions.

![Photo of reference player](http://i.imgur.com/xuZYh86.png)

### HTML
```html
<vi-player autoplay sublang="no">
    <video src="northern-lights.mp4"></video> <!-- Optional -->
	<vi-controls>
	    <vi-button data-viid="prev"></vi-button>
        <vi-button data-viid="play" class="big"></vi-button>
		<vi-button data-viid="next"></vi-button>
		<vi-slider data-viid="seeker"></vi-slider>
		<div data-viid="remaining-time"></div>
		<vi-slider data-viid="volume-slider" exponential></vi-slider>
        <vi-button data-viid="fullscreen"></vi-button>
        <!-- and / or any other controls -->
	</vi-controls>
</vi-player>
```
Got your own styled buttons, text elements etc.?
```html
<vi-controls>
    <input type="range" min="0" max="1" step="0.001" data-viid="seeker"></button>
    <button class="btn btn--video" data-viid="mark-done">Mark EP1 done</button>
</vi-controls>
```
#### Vi player `<vi-player>`
The host element. This is where most of your interactions with the player is.

#### Media `<video> | <audio>`
This is your browsers native media player and is what Vi listens and sends commands to. If a `src` attribute is present, Vi will not autoplay the media for you, and you'll have to define the `autoplay` attribute yourself. This element is optional and if left out a `<video>` tag will automatically be generated.

#### Vi controls `<vi-controls>`
This is where you place the controls linked to the parent player. It needs to be inside the `<vi-player>` tag (as of now!). Using the `data-viid` attribute or `dataset.viid` property on any child will link the element to the respective [_event set_](#) (link to event sets coming soon).

### JavaScript
```javascript
const player = document.querySelector('vi-player');

player.queue.add({
    src: '/media/tears_of_steel.webm', // This is the only required property
    subtitles: {
        no: '/subtitles/TOS_no.vtt',
        en: '/subtitles/TOS_en.vtt',
    },
    detail: {
        title: 'Tears of steel',
    },
});
```
#### Source `src`
Required path to either a browser compitable video or audio file.

#### Subtitles `subtitles`
The subtitles property is used to render native html5 subtitles. It will default to showing the players `sublang` attribute and can be changed at any time with `player.srclang = 'en'`.

#### Detail `detail`
The detail property is where all your extra information for your own use will go. It is accessable for the current queue at all times with `player.currentQueue.detail`. To get the detail for other queue items, you need to dig through the `player.queue.list` array.

## Tips
Consider support no-script users by adding a `<noscript>` tag in vi-player.
```html
<vi-player>
    <noscript>
        <video controls autoplay src="/media/tears_of_steel.webm">
            <track ...>
            ...
        </video>
    </noscript>

    <vi-controls>
        <!-- this is hidden when controls are enabled on the video / audio tag --->
    </vi-controls>
</vi-player>
```
You can add multiple queue items in one call.
```javascript
player.queue.add({ src: '/video1.webm' }, { src: '/video2.webm' });
```
