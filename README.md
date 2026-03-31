# odin-book-backend-top

> [!IMPORTANT]
> This is only the **backend** part of the project. Be sure to also visit the [frontend](https://github.com/Isutomu/messaging-app-frontend-top) part. (There's also the openapi spec repo. Potentially on npm)

## Pointlessly long preface

This project is referent to the [Project: Odin-Book](https://www.theodinproject.com/lessons/node-path-nodejs-odin-book) of [The Odin Project](https://www.theodinproject.com). The extra credits functionalities were also considered upon conception.

The planing phase was done, as per usual, in the form of scribbles on paper that can be found [insert link here after update](). Potentially there are even more documents there if I deemed necessary to add it, so I invite you to check it out!

There are sooooo many things that I decided to work with on this project that I had not used before that these next paragraphs will be a complement to the frontend's preface. Yup, I bit way more than I could chew, but we must keep moving!
First, I decided to settle for a file structure for the next few projects (commercial too) and so I went digging for examples of 'not huge' projects. Something modest, let's put it like that.

I. Should. Not. Have. Taken. This. Long. On. This!
Just like how unnecessary the previous sentence is, I got into my head that it needed to be at least pretty good. At the end of the day I ended up with something pretty standard. Only notable (maybe) is 'controllers' and 'prisma'. The first one is more commonly replaced with a versioning structure, so 'api/1.0' or something like that. Since I don't need to maintain versions I went with 'controllers' instead because I think is more accurate (after all, they are indeed controllers ^^). The second one was because even though 'models' is more common I'm doing everything through prisma instead of using directly postgresql, and since prisma is reasonably well known I don't see any harm on calling it that.

Next, I decided to implement tests. At first, only integration (so strictly limited to the routes) but later unit too.
I know we are 50/50 on not doing unit tests, but I reached a point that I could not deal with trying to implement it on login so we just gonna pretend that I did that one. (it's... it's not worth all the mocking)
I was really inexperienced with...everything regarding tests (besides the general concepts of TDD), so that one was also a long road to trail. Fortunately I think I don't need to do another "deep dive" on this topic until a more demanding project (I mean on how to really write instead of conceptually. This I will be studying more regardless).
The tests will be limited to routes still though. If I really need to do something for lib or middlewares we'll cross that bridge when need be.

A quick comment: using paths for the imports was a headache and I just settled for erasable syntax only to run everything through node (a check is done before production starts though). Did I say that this is my first TS project? Is it noticeable? I hope it's not! (probably is)

I also figured out how to (more) properly deal with the db when testing, and we are using openapi spec for front+back type checking.
Both of these, but specially the last one, were utter nightmares to go through. My pipeline for the spec is still a mess (I have to do it manually) but I also got tired so we're dealing with this after the official conclusion of the project.
...seriously, the whole openapi thing was too much for my peanut brain, but I REALLY wanted the type checking. It's one of the things that I hated the most on my previous projects, so I had to make it work!

I probably will update this section once the project ends, maybe even make a blog post about it on this very project! But know that if you read all this: thank you <3. That was indeed pointleslly long.

## Features to implement

> [!IMPORTANT]
> Modifiers ("not priority" and the like) don't imply importance. Most of the time they simply mean that I thought they were too difficult to tackle for now.

-

## Features in consideration

-
