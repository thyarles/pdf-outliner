# PDF Outliner

This microsservice is aimed to convert any PDF that have text to the outline form.

## Arquitecture


![image](https://user-images.githubusercontent.com/1340046/195879934-f9ca1045-ed27-4092-947a-d5b85fcdc69e.png)


## OS Dependencies

You must run it on Linux and must assure that the package GhostScript (GS) is proper installed.
```bash
$ sudo apt install ghostscript
```

## Build and run

### Production

1. To build this to production you must export the env environments
    ```dotenv
    # Those are de default values if there's no env at all
    NODE_ENV=production
    NODE_PORT=3000
    NODE_ROOT='/'
    NODE_IN_FODER=/tmp/pdf-outliner/input
    NODE_OUT_FODER=/tmp/pdf-outliner/outupt
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
    NODE_ENV=development

    # Defaults to 3000
    NODE_PORT=3000
    NODE_ROOT='/'

    # Place to read and save the file, usually a shared one
    NODE_IN_FODER=/tmp/pdf-outliner/input
    NODE_OUT_FODER=/tmp/pdf-outliner/outupt
    # In minutes
    NODE_TIMEOUT=10
    ```

2. Install the dependencies and start nodemon
    ```bash
    $ yarn run dev
    ```

## TODO

Add docker stack
