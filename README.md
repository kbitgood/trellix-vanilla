This is a demo app because I couldn't resist trying. I saw the challenge that [Ryan Florence](https://x.com/remix_run/status/1747711520510038035?s=20) put out for other framework authors, or anyone, to remake his [Trellix](https://github.com/remix-run/example-trellix) demo (inspired by Trello) and see if they can make it better than [Remix](https://remix.run/). No one was making anything quite as Ryan's demo (or at least enough to get an A from him). So I picked up the challenge.

Other Trellix Demos:

- Next.js - [Ryan's reaction](https://x.com/ryanflorence/status/1765179463497892117?s=20)
- [Tanstack](https://github.com/tkdodo/trellix-query) - [Ryan's reaction](https://x.com/ryanflorence/status/1767245924299071718?s=20)
- [Replicache](https://github.com/vimtor/trellix-replicache) - [Ryan's reaction](https://x.com/ryanflorence/status/1767656588360421454?s=20)

## Goal: Zero Dependencies

I am not a framework author, so the goal with this demo is to see if I can make it without a framework. One further, I thought I could make it without a build step. I wanted to see if I could do this with zero dependencies. Not even tailwind!

And I did it. There are zero (production) dependencies. Just development dependencies for typescript for the bun server, and prettier because I'm not a mad man.

I used [bun](https://bun.sh/) for my backend and only used the built in APIs. Admittedly this is kind of cheating since it has a lot built in, including SQLite. So maybe this would be better called Trellix-Bun ¯\\\_(ツ)\_/¯

One final note: Remix is awesome. Don't make things like this. Make them with Remix.

Obviously.

## Live Demo

Take a look at the live demo: https://trellix-vanilla.fly.dev/

And roast me on Twitter if I don't live up to Ryan's demo: [@kbitgood](https://twitter.com/kbitgood)

## Some Changes/Improvements

I noticed Ryan's Trellix demo was missing some features. I'd give his demo an A- 😉. So I added a couple of things.

- I added ability to delete columns from a board. 
  - How can you use this without that?
- I also added the ability to reorder columns with drag and drop. 
- I made it work without javascript! 
  - I was inspired by Remix's use of forms. If everything is a form then this is easy peasy. I just had to do some css trickery with `focus-within` instead of buttons that show forms. 
- I made it work without an internet connection! 
  - It's not fully local-first or a PWA, but if you disconnect, everything will still work and it will sync up when you reconnect.

## Run It Locally

Install [bun](https://bun.sh/docs/installation) then run:

```
# 👇 not needed! zero dependancies baby!
# bun install

bun run dev
```
