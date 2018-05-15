# ImageRight CLI

> The command line interface for the ImageRight API (Beta)

## Installation

```bash
npm install -g imageright-cli
```

## Usage

```bash
imageright-cli$ help

  Commands:

    help [command...]                 Provides help for a given command.
    exit                              Exits application.
    authenticate [options]            Authenticates with the ImageRight API and generates a AccessToken
    create page [options] <filePath>  creates a new page using a file

imageright-cli$

```

```bash
imageright-cli$ authenticate --help

  Usage: authenticate [options]

  Authenticates with the ImageRight API and generates a AccessToken

  Options:

    --help                     output usage information
    -B, --baseURL <baseURL>    ImageRight API Base URL location
    -U, --username <username>  ImageRight User Account Name
    -P, --password <password>  ImageRight Password

imageright-cli$

```

```bash
imageright-cli$ create page --help

  Usage: create page [options] <filePath>

  creates a new page using a file

  Options:

    --help                    output usage information
    -D, --docId <docId>       ImageRight Document Object ID
    -n, --desc <description>  Page Description

imageright-cli$

```

## About

Written as a demo application for [NetVU Accelerate 2018](https://www.netvu.org/web/Accelerate18)

[ImageRight](https://www.vertafore.com/products/imageright) is a product of Vertafore, Inc.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).