# Rust

This page is Rust-related documentation for the medical-forms monorepo.

## Rust sscache

For Rust projects, we recommend using a Rust cache for dependencies.

- We recommend the Rust cache program `sscache`.

- We recommend sscache configuration via environment variables, or in an environment file such as `~/.bashrc` or `~/.zshenv`, or in the cargo config file for the user `~/.cargo/config.toml` or project `.cargo/config.toml`.

- We recommend increasing the cache size from the default 10G to 50G, if you have enough drive space.

```sh
export RUSTC_WRAPPER="sccache"
export SCCACHE_CACHE_SIZE="50G"
```
