## 1.3.0 - 2021-01-09

- fix missing exported classes: `Count`, `TimestampRange`
- add missing parameters on `TS.CREATE` -- `chunkSize`, `duplicatepolicy`
- add missing parameters on `TS.ADD` -- `chunksize`, `onDuplicate`
- add `TS.REVRANGE` and `TS.MREVRANGE`
- bump dependencies to latest versions
- fix vulnerabilities
- add tests for new changes
- adds `UNCOMPRESSED` option on `.create()`, .`add()`, .`alter()` methods
- adds `tsdoc` with usage examples on public classes, functions, enums, interfaces for better intellisense
- updates `README.md` to reflect the latest changes

## 1.2.3 - 2020-03-15

- update dependencies

## 1.2.2 - 2020-02-04

- used `redislabs/redistimeseries:latest` image as default
- when data are not found in a `multiRange` query, the response still will return a sample with value = 0, but now the timestamp = first timestamp found which will be 0 if the time-series has no data stored

## 1.2.1 - 2020-01-28

- added Travis CI
- changed RedisLabs docker image from `latest` to `edge` tag for running test and CI
- added badgets

## 1.2.0 - 2020-01-27

- updates for compatibility with `redislabs/redistimeseries` version 1.2.2

## 1.1.1 - 2020-01-25

- update dependencies

## 1.1.0 - 2020-01-09

- added RedisTimeFactory and ConnectionOptions to index.d.ts

## 1.0.2 - 2020-01-08

- first implementation
