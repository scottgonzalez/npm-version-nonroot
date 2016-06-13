# npm-version-nonroot

[`npm version`](https://docs.npmjs.com/cli/version) for packages in subdirectories of git repositories

## Use case

I've started building projects that utilize [Docker](https://www.docker.com/) and organizing the repositor
ies based on the Docker containers. A simple project might have the following structure:

```
project
├── db
|   ├── Dockerfile
|   └── schema.sql
├── web
|   ├── Dockerfile
|   ├── package.json
|   └── server.js
├── docker-compose.yml
└── README.md
```

Because `package.json` is not in the root of the git repository, `npm vesion` will not perform any of the git-related commands, such as committing and tagging. This module makes `npm version` work as expected.

## Usage

Add `nvn-preversion` and `nvn-version` as part of npm's `preversion` and `version` scripts, respectively.

```json
"scripts": {
  "pre-version": "nvn-preversion",
  "version": "nvn-version"
}
```

## Implementation details

`nvn-preversion` runs the following steps. All differences from standard `npm preversion` behavior are noted.

1. Check if the git working directory is clean.
  * `npm version` would normally do this before running the `preversion` script.
  * `nvn-version` does not yet support the `--force` flag to prevent this check.

`nvn-version` runs the following steps. All differences from standard `npm version` behavior are noted:

1. Update `npm-shrinkwrap.json` if it exists.
  * `npm version` would normally run this, and all following steps *after* the `version` script and before the `postversion` script.
1. Commit the changes to git.
1. Create the tag in git.
  * `nvn-version` does not yet check for an existing tag of the same name.

## License

Copyright Scott González. Released under the terms of the MIT license.
