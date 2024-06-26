# console-1

A demonstration of a simulation of the Atari 800 command line console, running on a web page, just for fun...but using bitmapped graphics (NOT HTML text) rendered on a canvas!

It currently includes a lower case font, keyboard "click" sounds, text scrolling, cursor shapes, and blinking cursors.

It's based on several-year old JavaScript I wrote several years ago; hence I am in the process of modernizing it to current JavaScript documentation and coding conventions.

To run, just set up a web server (a simple Node/JavaScript server will do) to serve the repo folder on a particular port (say 8888), and then point your web browser to the index.html file using that port (http://localhost:8888//index.html).

The fun for me was creating routines to convert the eight 8-bit values representing each character glyph/bitmap, converting them to drawable shapes, and drawing them to a canvas layer.

For example, the letter "A" bitbap is [0, 24, 60, 102, 102, 126, 102, 0], stored as 8-bit values; each 8-bit value encoded the "on" or "off" pixels in each row of the letter's image:

```
0 0 0 0 0 0 0 0
0 0 0 1 1 0 0 0
0 0 1 1 1 1 0 0
0 1 1 0 0 1 1 0
0 1 1 0 0 1 1 0
0 1 1 1 1 1 1 0
0 1 1 0 0 1 1 0
0 0 0 0 0 0 0 0 
```

![Screenshot 2024-06-17 at 1 09 36 AM](https://github.com/rgmarquez/console-1/assets/943586/8f04293e-8e3c-48df-be06-72aeb65cd8ce)


UPDATE: Added a demonstration app (guess.html) showing how to print to the console, as well as how to get text input from the console (ie from the user).  Using the console's input() method waits for the user to enter their data, but in a non-blocking way (using a returned Promise and 'await').

guess.html:

![Screenshot 2024-06-18 at 12 00 49 AM](https://github.com/rgmarquez/console-1/assets/943586/ce896a2a-e99a-4398-a7a7-796177edfa58)
