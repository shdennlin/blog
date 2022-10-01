---
title: "Prevent SSH from disconnecting from timing out"
author: ["Shawn Dennis Lin"]
date: 2022-05-09T00:00:00+08:00
tags: ["Linux"]
categories: ["Software Engineering"]
slug: "prevent-ssh-from-disconnecting-from-timing-out"
# image: "image.jpeg"
---

When you use ssh to connect the remote server, but there is no operation for a long time, it's annoying issue that disconnects from timing out.

You can prevent it by adding the following line to your `~/.ssh/config` file head.

```shell
Host *
  ServerAliveInterval 30
  ServerAliveCountMax 2
```

I Hope this can resolve your problem.
