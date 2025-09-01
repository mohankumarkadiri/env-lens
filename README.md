# env-lens

A lightweight VS Code extension that provides **inline hover previews** for environment variables used via `process.env.*`.

## Features
- Hover over `process.env.VAR_NAME` to see the value of `VAR_NAME` from your `.env` file.
- Automatically loads variables from a `.env` file in your workspace root.
- Works with JavaScript projects (Node.js, frontend, backend).

## Examples:

> ### Variable is defined in .env
![Defined Example](/images/defined_example.png)

> ### Variable is not defined in .env
![Undefined Example](/images/undefined_example.png)
