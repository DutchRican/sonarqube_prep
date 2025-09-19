#!/usr/bin/env node
// Proxy CLI to compiled build entrypoint.
// This file is the `bin` script; load and run the built ESM entrypoint so users
// invoking the CLI via `sq_prep` execute the compiled code from `build/index.js`.
import '../build/index.js';
