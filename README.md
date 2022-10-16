# PDF Outliner

This microservice is aimed to convert any PDF that have text to the outline form.

## Table of contents
1. [Architecture](#architecture)
2. [OS dependencies](#operational-system-dependencies)
   1. [How to build and run](#how-to-build-and-run)
      1. [On production](#on-production)
      2. [On development](#on-development)
3. [How to check healthy](#how-to-check-healthy)
4. [How to test](#how-to-test)
5. [How to contribute](#how-to-contribute)
6. [How to run it on Docker](#how-to-run-it-on-docker)


## Architecture

![image](https://user-images.githubusercontent.com/1340046/195879934-f9ca1045-ed27-4092-947a-d5b85fcdc69e.png)


## Operational system dependencies

You must run it on Linux and must assure that the package GhostScript (GS) is proper installed.
```bash
$ sudo apt install ghostscript
$ gs --version
### OUTPUT ###
9.55.0
```
**Note:** the `NODE_ENV` is not mandatory, if you don't have it, then the default values will be used as production mode.

## How to build and run

### On production

1. To build this to production you must export the env environments

    ```dotenv
    # Those are de default values if there's no env at all
    NODE_ENV=production
    NODE_PORT=3000
    NODE_ROOT='/'
    NODE_IN_FOLDER=/tmp/pdf-outliner/input
    NODE_OUT_FOLDER=/tmp/pdf-outliner/outupt
    # In minutes
    NODE_TIMEOUT=10
    ```

2. Install the dependencies and run
    ```bash
    $ yarn deploy:prod
    $ yarn prod
    ### OUTPUT ###
    yarn run v1.22.17
    $ node src
    Server on port 3000
    ```

### On development

1. To build this to production you must export the env environments
    ```dotenv
    NODE_ENV=development

    # Defaults to 3000
    NODE_PORT=3000
    NODE_ROOT='/'

    # Place to read and save the file, usually a shared one
    NODE_IN_FOLDER=/tmp/pdf-outliner/input
    NODE_OUT_FOLDER=/tmp/pdf-outliner/output
    # In minutes
    NODE_TIMEOUT=10
    ```

2. Install the dependencies and start in `nodemon` mode
    ```bash
    $ yarn dev
    ### OUTPUT ###
    yarn run v1.22.17
    $ yarn install && nodemon src
    [1/4] Resolving packages...
    success Already up-to-date.
    [nodemon] 2.0.20
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching path(s): *.*
    [nodemon] watching extensions: js,mjs,json
    [nodemon] starting `node src`
    Server on port 3000
    ```

## How to check healthy

Use this as container healthy check. To check if the API is healthy

```bash
$ curl -f localhost:3000/ping
### OUTPUT ###
{"message":"pong","success":true,"time":0}
```

## How to test

1. Test a failed API call
    ```bash
    $ curl -X POST localhost:3000/pdf-outliner -d file=test.pdf
    ### OUTPUT ###
    {"message":"file not found","success":false,"time":0}
    ```

2. Add a `test.pdf` file on `NODE_IN_FOLDER` and test a successful API call
    ```bash
    $ curl -X POST localhost:3000/pdf-outliner -d file=test.pdf
    ### OUTPUT ###
    {"message":"/tmp/pdf-outliner/output/test.pdf","success":true,"time":1.606}
    ```

3. Check if the file was created as expected
    ```bash
    $ ls -lh /tmp/pdf-outliner/*
    ### OUTPUT ###
    /tmp/pdf-outliner/input:
    total 636K
    -rw-rw-r-- 1 thyarles thyarles 633K Oct 14 20:29 test.pdf

    /tmp/pdf-outliner/output:
    total 988K
    -rw-rw-r-- 1 thyarles thyarles 988K Oct 15 20:40 test.pdf
    ```

## How to contribute

Let's keep the application as simple as possible by following the best practices for code style. We know every developer have your way, but when working together the code must have standards on the code style that must be followed by all.

To do this job, we relly on [ESlint](https://eslint.org/) and you should lint your application before the pull requests, otherwise your PR will be deleted. To do so, install `yarn dev` packages and work as usual. 

When you try to commit the code, the tool [Husky](https://www.npmjs.com/package/husky) will do a lint check and if it finds any error, your commit will be denied.

```bash
$ yarn install
### OUTPUT ###
yarn install v1.22.17
[1/4] Resolving packages...
success Already up-to-date.
Done in 0.22s.

$ git commit -m "test: checking if husky will block the commit due a unused const"
### OUTPUT ###
yarn run v1.22.17
$ eslint --ext js,jsx,ts,tsx .

/media/thyarles/LinuxData/bitcot/pdf-outliner/src/index.js
  22:7  error  'testLint' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)

error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
husky - pre-commit hook exited with code 1 (error)
```

So you need to look into do error, fix it and try another commit. The most common IDEs will warn you about those errors in real time.

Most of the code style errors can be automatically fixed, you just need to call like that:

```bash
$ yarn lint:format
### OUTPUT ###
yarn run v1.22.17
$ prettier --write '**/*.{ts,tsx,js,jsx,json}'
.eslintrc.json 54ms
package.json 7ms
src/index.js 73ms
Done in 0.51s.
```

## How to run it on Docker

If you believe in me and don't want to install a thing, just use the Docker image:

### Run in frontend mode (you can see the logs)
```bash
$ docker run --init -p 3000:3000 -v /tmp/pdf-outliner:/tmp/pdf-outliner thyarles/pdf-outliner:latest
### OUTPUT ###
yarn run v1.22.19
$ node src
Server on port 3000
```

### Run in backend mode (you can't see the logs)
```bash
$ docker run --detach --restart unless-stopped --publish 3000:3000 --volume /tmp/pdf-outliner:/tmp/pdf-outliner thyarles/pdf-outliner:latest
```

If you don't believe in me (you shouldn't) you can read the code, change it and generate your own image:
```bash
$ docker build -t thyarles/pdf-outliner .
### OUTPUT ###
Sending build context to Docker daemon  95.23kB
Step 1/8 : FROM node:18-alpine
 ---> 867dce98a500
Step 2/8 : WORKDIR /app
 ---> Using cache
 ---> 93fd34abb1ea
Step 3/8 : COPY . .
 ---> 1e233562376f
Step 4/8 : RUN apk update  && apk add curl ghostscript  && mkdir /efs  && chown node:node -R /app /efs  && yarn deploy:prod
 ---> Running in 8f92ab604ac7
fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/main/x86_64/APKINDEX.tar.gz
fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/community/x86_64/APKINDEX.tar.gz
v3.16.2-299-ga2e2d92ef8 [https://dl-cdn.alpinelinux.org/alpine/v3.16/main]
v3.16.2-299-ga2e2d92ef8 [https://dl-cdn.alpinelinux.org/alpine/v3.16/community]
OK: 17036 distinct packages available
(1/29) Installing ca-certificates (20220614-r0)
(2/29) Installing brotli-libs (1.0.9-r6)
(3/29) Installing nghttp2-libs (1.47.0-r0)
(4/29) Installing libcurl (7.83.1-r3)
(5/29) Installing curl (7.83.1-r3)
(6/29) Installing dbus-libs (1.14.4-r0)
(7/29) Installing libintl (0.21-r2)
(8/29) Installing avahi-libs (0.8-r6)
(9/29) Installing gmp (6.2.1-r2)
(10/29) Installing nettle (3.7.3-r0)
(11/29) Installing libffi (3.4.2-r1)
(12/29) Installing p11-kit (0.24.1-r0)
(13/29) Installing libtasn1 (4.18.0-r0)
(14/29) Installing libunistring (1.0-r0)
(15/29) Installing gnutls (3.7.7-r0)
(16/29) Installing cups-libs (2.4.2-r0)
(17/29) Installing expat (2.4.9-r0)
(18/29) Installing libbz2 (1.0.8-r1)
(19/29) Installing libpng (1.6.37-r1)
(20/29) Installing freetype (2.12.1-r0)
(21/29) Installing fontconfig (2.14.0-r0)
(22/29) Installing jbig2dec (0.19-r0)
(23/29) Installing libjpeg-turbo (2.1.3-r1)
(24/29) Installing lcms2 (2.13.1-r0)
(25/29) Installing xz-libs (5.2.5-r1)
(26/29) Installing libwebp (1.2.3-r0)
(27/29) Installing zstd-libs (1.5.2-r1)
(28/29) Installing tiff (4.4.0-r0)
(29/29) Installing ghostscript (9.56.1-r0)
Executing busybox-1.35.0-r17.trigger
Executing ca-certificates-20220614-r0.trigger
Executing fontconfig-2.14.0-r0.trigger
OK: 91 MiB in 45 packages
yarn run v1.22.19
$ yarn install --production --frozen-lockfile
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 5.34s.
Removing intermediate container 8f92ab604ac7
 ---> 57d0b208c8f9
Step 5/8 : USER node
 ---> Running in 3b8da584016b
Removing intermediate container 3b8da584016b
 ---> 4c75d08f78d8
Step 6/8 : EXPOSE 3000
 ---> Running in 375207bb9c59
Removing intermediate container 375207bb9c59
 ---> 5f5c7a435d19
Step 7/8 : VOLUME /efs
 ---> Running in b79da9e57105
Removing intermediate container b79da9e57105
 ---> 591fff7f0b5f
Step 8/8 : CMD ["yarn", "prod"]
 ---> Running in 7cf971a682f2
Removing intermediate container 7cf971a682f2
 ---> 2cddd5495a66
Successfully built 2cddd5495a66
Successfully tagged thyarles/pdf-outliner:latest

```

# Next steps
1. Enforce lint as branch protection on GitHub Actions (unfortunately Husky allow developer bypass local test, so best make sure)
2. Do static analysis check using [SonarCloud](https://sonarcloud.io) and block code with low quality gate, with any bugs or with any security issues
3. Add unit tests
4. Add integration tests
5. Block pull requests that doesn't meet the minimum of 60% of coverage using [SonarCloud](https://sonarcloud.io)
