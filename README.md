This is a demo app because I couldn't resist trying. I saw the challenge that [Ryan Florence](https://x.com/remix_run/status/1747711520510038035?s=20) put out for other framework authors, or anyone, to remake his [Trellix](https://github.com/remix-run/example-trellix) demo (inspired by Trello) and see if they can make it better than [Remix](https://remix.run/). No one was making anything quite as Ryan's demo (or at least enough to get an A from him). So I picked up the challenge.

Other Trellix Demos:
- NextJS - [Ryan's reaction](https://x.com/ryanflorence/status/1765179463497892117?s=20)
- [Svelte](https://github.com/Rich-Harris/sveltekit-movies-demo) - [Ryan's reaction](https://x.com/ryanflorence/status/1766124524444250124?s=20)
- [Tanstack](https://github.com/tkdodo/trellix-query) - [Ryan's reaction](https://x.com/ryanflorence/status/1767245924299071718?s=20)
- [Replicache](https://t.co/TmEO7l3mXa) - [Ryan's reaction](https://x.com/ryanflorence/status/1767656588360421454?s=20)

## Goal: Zero Dependancies

I am not a framework author, so the goal with this demo is to see if I can make it without a framework. One further, I thought I could make it without a build step. I wanted to see if I could do this with zero dependancies. Not even tailwind! 

And I did it. There are zero (production) dependancies. Just development dependancies for typescript for the bun server, and prettier because I'm not a mad man. 

I used [bun](https://bun.sh/) for my backend and only used the built in APIs. Admittedly this is kind of cheating since it has a lot built in, including SQLite. So maybe this would be better called Trellix-Bun ¯\\\_(ツ)\_/¯

One final note: Remix is awesome. Don't make things like this. Make them with Remix.

Obviously.

## Live Demo

Take a look at the live demo: https://trellix-vanilla.fly.dev/

And roast me on twitter if I does't live up to Ryan's demo: [@kbitgood](https://twitter.com/kbitgood)

## Some Changes/Improvements

I noticed Ryan's Trellix demo was missing some features. I'd give his demo an A- 😉. So I added a couple things. Most notably the ability to delete columns from a board. (How can you use this without that?) And I also added the ability to reorder columns with drag and drop.

## Future Possibilities

I would love to come back to this and add a couple improvements as a challenge to myself:

- [ ] Client side routing
   - All the building blocks are there to make the page navigations client side. I don't think this would take much and would make it even snappier. 
- [ ] Make it local first
   - I love the idea of an app like this being able to completely work on my machine with my network disconnected. All the functionality is local with optimistic updates anyway.
- [ ] Make it work with javascript disabled
   - This one is almost there. Try it! You can delete items and columns without JS. If I tweak the forms hidden behind buttons and make a fallback for the drag and drop it wouldn't be too much more.

## Run It Locally
Install [bun](https://bun.sh/docs/installation) then run:
```
bun i
bun run dev
```

## Deploy with Fly
Thank you to Andrea Giammarchi for the [deploy help](https://github.com/WebReflection/fly-bun-sqlite/tree/main)
```
Deploy with fly
# login via GitHub or Google or .. whatever
fly auth login

# be sure the region is correct and/or free to use
# be sure you use 1x CPU with 256MB machine for free tier
fly launch

# for free tier use just 1 volume
fly volume create litefs -r $REGION -n 1

# deploy this and have fun
fly deploy
```
