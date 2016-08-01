# ipblocker


# Ip Blacklist

The ipset and netset files contain a bunch of ip addresses and network ranges. My goal here was to be able to efficiently find out if an ip address matched any of the given ip addresses or if it fell in any of the network ranges.

The task stated that this service would be used on every login request and would affect its latency. The blocklists also weren't incredibly large. It was because of this that I decided to go with an in-memory version of the blacklist because hitting a database on every login request would be terrible for latency in comparison.

I decided to go with a hashmap since most lookups are done in constant time.

Matching an ip address to its equivalent in the blacklist was simple. However, things became slightly more tricky when thinking about network ranges.

I realized that for any ip address there were only 31 subnets that it could belong to which I could find by zero'ing bits starting from the right. However, this would give me the canonical form of the subnets and I don't think the entries in the blocklists were guaranteed to be in this form. Therefore, I normalized all the network ranges to their canonical forms before placing them into the blacklist.

Therefore, I'm able to determine if an ip address is in the blacklist or not in 32 lookups or less in a hashmap which should be pretty fast on any modern machine.

I also considered placing a bloom filter in front of this (I've read about them but I've never used one before) since it would speed up the code path for allowed ip addresses (which the majority of requests will probably include) most of the time. This would've been especially helpful since the code path for allowed ip addresses given the method above is the slowest.

However, the more I thought about it, the more I felt that it would've been less efficient because of the K hash functions that I'd need to compute on every request. I could be wrong about this being slower but it's something I could play with if my current method turns out to be too slow during the load tests.

# Reading in ipset and netset files.

Originally, when working on this part, I just went with synchronous file reads I knew it was a bad idea at the time but I was just playing around with it and was wondering how long it would actually take to read all the files and populate the blacklist on my machine. Turns out it took about 8 seconds on average to read from 276 files containing about 4 million entries. This only included the ipset files. However, once I started doing the reloads, the synchronous file reads would block the event loop and stall all incoming requests for as long as it would take to read the files. I then switched over to streams. This was a big improvement since requests were still getting processed efficiently even when a reload was taking place.



# Why I chose to clone the repo when building the docker image instead of doing it programmatically.

I decided on using nodegit because it seemed to be the most popular module for interacting with git repositories using node and there was a fair amount of documentation and there were also a bunch of examples in their git repository which was really nice.

I originally wrote code that would do the cloning using nodegit. However, I found no way to make the library give me updates on the cloning progress and I didn't think it was worth it to fork it and do it myself when compared to the alternative. This was a deal breaker because the repo was around 1.4Gb.

So I added the cloning process to my Dockerfile so that the repository would already exist and only the service would only be necessary for fetching and merging updates.


# Git Repo Monitor

I would've liked to have a webhook that fires on every new commit to the repo's master branch but that wasn't a possibility. Webhooks can only be set by the repo administrators. Therefore, I ended up polling. I just created an event emitter that fires an event when the sha1 hash of the HEAD changes.

This made it really easy to decouple the repository monitoring and blocklist reloading and made it easy to test.



# Git Repo Updater

Once again, since a webhook wasn't an option, this module just tries to fetch and merge updates periodically.


# Choice of http package

I originally went with Hapi as a web framework because I saw the name mentioned in some of auth0's repositories and I wanted to get something out quickly. However, after doing some research I found out that Hapi was often the worst framework among the mainstream frameworks when considering requests/sec. The leaders were restify and node's http module with node's http winning by a small margin. I figured that the API for this service would probably stay pretty small and even if it started growing more than expected, it wouldn't be very difficult to switch over to restify from the http module. Therefore I went with the http module for now.

I know I'm overlooking a lot here since accepting requests / serving results over HTTP definitely isn't the only option. I figured that if during load testing, using HTTP turned out to be a bad decision, I could always switch over to something that should be more efficient (protocol buffers, flat buffers, etc) and run the load tests again.
