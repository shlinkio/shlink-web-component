# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org).

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
