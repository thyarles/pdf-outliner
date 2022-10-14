# PDF Outliner

## Purpose

This tool is aimed to convert any PDF that have text to the outline form using API.

## OS Dependencies

You must run it on Linux and must assure that the package GhostScript (GS) is proper installed.
```bash
$ sudo apt install ghostscript
```

## Build and run

### Production

1. To build this to production you must export the env environments
    ```dotenv
    # Just for compabilities
    NODE_ENV=production
    NODE_PORT=3000
    NODE_ROOT='/'
    NODE_IN_FODER=/tmp/input
    NODE_OUT_FODER=/tmp/outupt
    # In minutes
    NODE_TIMEOUT=10
    ```

2. Install the dependencies and run
    ```bash
    $ yarn prod
    ```

### Development
1. To build this to production you must export the env environments
    ```dotenv
    # Just for compabilities
    NODE_ENV=development

    # Defaults to 3000
    NODE_PORT=3000
    NODE_ROOT='/'

    # Place to read and save the file, usually a shared one
    NODE_IN_FODER=/tmp/input
    NODE_OUT_FODER=/tmp/outupt
    # In minutes
    NODE_TIMEOUT=10
    ```

2. Install the dependencies and start nodemon
    ```bash
    $ yarn run dev
    ```
