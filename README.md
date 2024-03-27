# Assignment for Ctruh

### Date : 27/03/2024

## Description

-   **Problem Statement** : Use Babylon js to create a custom camera controller which has two behaviours, Orbit controls and FPS controls
    Default implementation of Babylon js has both behaviours but with two different cameras unlike three js where you can switch behaviour on same camera
    Your task is to create a same camera control layer as three js in Babylon js camera system where one camera can have multiple behaviours and can be switched between using flags
-   Press 'T', To toggle between the cameras
-   Keep an eye on console logs to see which camera is currently in use.

#### Created by [Rushikesh Vinod Ghatage](https://www.linkedin.com/in/rushikesh-ghatage-477489222/) :smiley:

## Setup

#### Download [Node.js](https://nodejs.org/en/download/).

#### Run following commands:

-   To install dependencies (only the first time)
    ```bash
    npm install
    ```
-   To run the local server at localhost:5173
    ```bash
    npm run dev
    ```
-   To build for production in the directory

    ```bash
    npm run build
    ```

#### Bugs :

-   Camera zoom-in zoom-out does not work in ArcRotateCamera mode.
-   Camera movement in ArcRotateCamera mode is not smooth.
