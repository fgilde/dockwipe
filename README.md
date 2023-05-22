# DockWipe

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Configuration File](#configuration-file)
- [Contributing](#contributing)
- [License](#license)

## Introduction
DockWipe is a command line tool for deleting Docker images with specific tags. It provides an interactive interface as well as file and command line configurations to manage your Docker images.

## Installation
To install DockWipe, you can use npm:

```bash
npm install -g @fgilde/dockwipe
```

## Usage
To use DockWipe, you can run it directly from the command line, providing the necessary options either directly as command line arguments, or using a configuration file.

#### Command Line Options:
- `--file` or `-f`: Path to the configuration file.
- `--registry` or `-r`: The Docker registry.
- `--image` or `-i`: The Docker image.
- `--username` or `-u` or `--user`: The username for the Docker registry.
- `--password` or `-p` or `--pass`: The password for the Docker registry.
- `--tags` or `-t`: The tags to delete. Use commas to separate multiple tags.

To start DockWipe, simply run the `dockwipe` command:

```
dockwipe
```

## Examples
To delete a tag 'tag1' from an image, use:

```
dockwipe --registry=yourRegistry --image=yourImage --username=yourUsername --password=yourPassword --tags=tag1
```

Or you can use the configuration file:

```
dockwipe --file=yourConfigFile.json
```

## Configuration File
You can specify a configuration file to provide the options. The file should be in JSON format:

```
{
"registry": "docker-registry.services.yourserver.de",
"image": "path/yourimage",
"username": "username",
"password": "yourPassword",
    "defaults": {
        "registry": "docker-registry.services.yourserver.de",
        "image": "path/yourimage"
    }
}
```

The 'defaults' field can be used to specify default values. 
If the corresponding option is not provided in the command line, the default value is pre filled but can changed in the UI.
If a value is provided in the command line args or the config file, it overrides the default value and no UI is showing up to specify different values.

[//]: # ()
[//]: # (## Contributing)

[//]: # (Please read [CONTRIBUTING.md]&#40;https://github.com/fgilde/dockwipe/blob/main/CONTRIBUTING.md&#41; for details on our code of conduct, and the process for submitting pull requests.)

## License
This project is licensed under the GPL-3.0 License - see the [LICENSE.md](https://github.com/fgilde/dockwipe/blob/main/LICENSE.md) file for details
