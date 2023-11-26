# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org).

## [0.4.0] - 2023-11-26
### Added
* [#12](https://github.com/shlinkio/shlink-web-component/issues/12) and [#13](https://github.com/shlinkio/shlink-web-component/issues/13) Add new "Visits options" section for arbitrary visit stats options. Add section to delete short URL and orphan visits there.

  This section is only visible if short URL visits deletion or orphan visits deletion are supported by connected Shlink server.

* [#10](https://github.com/shlinkio/shlink-web-component/issues/10) Improve general accessibility.

### Changed
* The project no longer depends on ramda
* Replace `classnames` package with `clsx`
* Enable react hooks linting rules and fix cases where they are not fulfilled.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.3.5] - 2023-09-30
### Added
* [#10](https://github.com/shlinkio/shlink-web-component/issues/10) Add accessibility tests, fix accessibility issues and enable accessibility linting rules.

### Changed
* [#49](https://github.com/shlinkio/shlink-web-component/issues/49) Enable and address react-hooks linting rules.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.3.4] - 2023-09-05
### Added
* *Nothing*

### Changed
* Improve components DI.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.3.3] - 2023-08-29
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* Fix more unpacked methods from `ShlinkApiClient`, in visits reducers.


## [0.3.2] - 2023-08-29
### Added
* *Nothing*

### Changed
* Replace copy-pasted `ShlinkApiClient` used in dev, with official JS SDK.
* Add `@shlinkio/shlink-js-sdk` as an optional peer dependency.

### Deprecated
* *Nothing*

### Removed
* Remove `api-contract` types. Now the `/api-contract` entry point re-exposes types from `@shlinkio/shlink-js-sdk/api-contract`.

### Fixed
* Do not unpack methods from `ShlinkApiClient`, and instead invoke them from the object itself, to avoid loosing binding to `this`.


## [0.3.1] - 2023-08-27
### Added
* *Nothing*

### Changed
* [#34](https://github.com/shlinkio/shlink-web-component/issues/34) Decouple `TagsSelector` from `tagsList` reducer.
* [#37](https://github.com/shlinkio/shlink-web-component/issues/37) Replace `react-colorful` with native color input for tag colors.
* Consolidate and decouple API contract from other models and helpers.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.3.0] - 2023-08-19
### Added
* [#5](https://github.com/shlinkio/shlink-web-component/issues/5) Add basic documentation in README file.

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* Remove `ui` settings from this component's contract, as theme is implicit by "surrounding" styles.
* Do not require `baseUrl` and `apiKey` on `ShlinkApiClient` implementors. That's an implementation detail which depends on the specific use case.

### Fixed
* [#14](https://github.com/shlinkio/shlink-web-component/issues/14) Fix error in `OpenMapModalBtn`.
* [#8](https://github.com/shlinkio/shlink-web-component/issues/8) Fix tags not getting reloaded from `APIClient.listTags`, except when loading tags list section.


## [0.2.0] - 2023-08-17
### Added
* [#4](https://github.com/shlinkio/shlink-web-component/issues/4) Add dev sandbox to test component

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#1](https://github.com/shlinkio/shlink-web-component/issues/1) Avoid tag removal on TagsSelector when adding a duplicated tag


## [0.1.1] - 2023-08-14
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* Register Chart.js charts
* Add leaflet helper function to fix icons
* Add missing package.json reference in exports definition


## [0.1.0] - 2023-08-13
### Added
* First release

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*
