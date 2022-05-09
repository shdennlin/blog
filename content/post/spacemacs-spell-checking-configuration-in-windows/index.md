+++
title = "Spacemacs - Spell Checking Configuration in Windows"
author = ["Shawn Dennis Lin"]
date = 2022-05-09T00:00:00+08:00
lastmod = 2022-05-09T14:21:44+08:00
tags = ["emacs", "spell-checking"]
categories = ["Editor"]
draft = false
math = false
slug = "spacemacs-spell-checking-in-windows"
image = "image.jpeg"
+++

This post will introduce how to install **Spell Checking** on [spacemacs](https://develop.spacemacs.org/) in windows. <br/>

I will use [hunspell](https://github.com/hunspell/hunspell) instead to [flyspell](https://www-sop.inria.fr/members/Manuel.Serrano/flyspell/flyspell.html) on windows. <br/>


## Install Step {#install-step}

1.  In spacemacs init.el add `spell-checking` layer. <br/>
2.  Download the [hunspell win32 binairy here](https://sourceforge.net/projects/ezwinports/files/?source=navbar), look for hunspell-1.3.2-3-w32-bin.zip (ex: ctrl+F hunspell) <br/>
3.  Unzip it, and copy to location (ex: **d:\application\hunspell-1.3.2-3-w32-bin\bin\hunspell.exe**) <br/>
4.  Add this to your init.el file **dotspacemacs/user-config block**: <br/>
    
    ```lisp
    (setq-default ispell-program-name "d:/application/hunspell-1.3.2-3-w32-bin/bin/hunspell.exe")
    ```
    
    note that the **\\** have change into **/**. <br/>


## Ref {#ref}

1.  [aspell with emacs 26.1 on ms windows](https://emacs.stackexchange.com/a/57842)  <br/>