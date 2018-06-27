# RoverFront

## Build
```
yarn build
```

The build target is the `build` folder. There's then a postbuild script that copies the files to `../static`, which is the folder hosted by the tornado web server.