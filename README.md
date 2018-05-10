# Hand-Pong

**Server Status**<br/>
[![Build Status](https://travis-ci.org/Thomas1995/Hand-Pong.svg?branch=master)](https://travis-ci.org/Thomas1995/Hand-Pong)

##### Description 
Classic game of [Pong](https://en.wikipedia.org/wiki/Pong "Pong Wikipedia page") but played using hand detection 
on your webcam (move hand up or down to move the pallet)

##### Usage (Linux)

1. `conda create -n hand_pong python=3.5`
2. `source activate hand_pong`
3. `git clone https://github.com/Thomas1995/Hand-Pong`
4. `cd Hand-Pong`
5. `pip install requirements`
6. `python Server/server.py localhost`
7. open Client/home.html in your browser

##### Requirements

* Python >= 3.5.0
* Web Cam

##### References
* Big thanks to [victordibia](https://github.com/victordibia "GitHub profile") for his project about [hand tracking](https://github.com/victordibia/handtracking)
* [hand tracking](https://github.com/heppu/Hand-recognition)
