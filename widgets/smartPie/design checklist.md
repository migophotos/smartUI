## Color 
- [ ] Uses consistent colors throughout 
- [ ] Uses non-clashing colors 
- [ ] The color choice makes sense for the business purpose of the site 
## Text 
- [ ] The text has padding on both sides. 
- [ ] The line-height is 1.5-2.0 
- [ ] There's padding between paragraphs 
- [ ] If your headings are in all caps, there's increased word spacing 
- [ ] Blocks of text are un-justified 
- [ ] Blocks of text are left-aligned 
- [ ] Sans-serif fonts are used for body text 
- [ ] A maximum of two fonts are used - one decorative or serif and one sans-serif 
- [ ] body text isn't pure black on white 
- [ ] body text is 16-18px and is scalable 
## Backgrounds 
- [ ] Use a pattern or simple image 
- [ ] A text shadow is used to make headings readable 
- [ ] The background isn't too bright 
## Calls to Action 
- [x] Important information is highlighted in order to attract user interaction

Contrast measuring site:
- https://marijohannessen.github.io/color-contrast-checker/

Color psychology
- https://graf1x.com/color-psychology-emotion-meaning-poster/

Color schemes generator
- https://coolors.co/

Color pelettes from instagram
- https://www.instagram.com/colours.cafe/

Color page of Materialize
- https://materializecss.com/color.html

Example of using CSS variables for colors in your site
```js
body { 
  --pink: #CF92B7; 
  --green: #59876B; 
  --grey: #4A4A4A; 
} 
h1 { 
  color: var(--pink); 
}
```

Example of using container for text on the page
```js
<style> 
.container { 
  width: 80%; margin: 0 auto; 
} 
</style> 
<div class="container"> 
  <p> 
  Lorem ipsum dolor amet master cleanse cloud bread brunch pug PBR&B
  actually. Thundercats marfa art party man bun gluten-free
  sriracha. DIY tofu cred blue bottle etsy. Retro listicle normcore
  glossier next level etsy lumbersexual polaroid pour-over 90's
  slow-carb health goth banjo. Unicorn chicharrones 8-bit poke 
  glossier. 
  </p> 
</div>
```

The W3C recomended set the line-height from 1.5 to 2.0.
```js
p { 
  font-size: 18px; 
  line-height: 2.0; 
}
```

Add padding in between paragraphs
```js
p { 
  padding-bottom: 27px; 
}
```

Increase word spacing for a header
```js
h1 { 
  word-spacing: 9px; 
}
```

Split the page for text and images
```js
<style> 
  .container { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
  } 
</style>
<div class="container"> 
  <div class="text">My Text</div>
  <img src="path/to/img"> 
</div>
```

Add text shadows
```js
.text { 
  text-shadow: #4A4A4A 1px 1px 8px; 
}
```



more read:
- https://medium.freecodecamp.org/a-web-design-crash-course-from-one-non-designer-to-another-a6f8da0e6aa

