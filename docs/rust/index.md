# Rust

This page is Rust-related documentation for the medical-forms monorepo.

## Rust sscache

For Rust projects, we recommend using a Rust cache for dependencies.

- We recommend the Rust cache program `sscache`.

- We recommend sscache configuration via environment variables, or in an environment file such as `~/.bashrc` or `~/.zshenv`, or in the cargo config file for the user `~/.cargo/config.toml` or project `.cargo/config.toml`.

- We recommend increasing the cache size from the default 10G to much larger such as 100G, if you have enough drive space.

```sh
export RUSTC_WRAPPER="sccache"
export SCCACHE_CACHE_SIZE="100G"
```

How to show stats:

```sh
sccache --show-stats
```

In particular, look for the "Max cache size" line near the bottom.

If the sccache server is already running, and you want to change the max cache size, then you must stop the server, then set the new max cache size, then start the server:


```sh
sccache --stop-server
export SCCACHE_CACHE_SIZE="100G"
sccache --start-server
```
