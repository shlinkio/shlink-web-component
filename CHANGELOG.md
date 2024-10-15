# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#475](https://github.com/shlinkio/shlink-web-component/issues/475) Fix one extra empty dot being displayed in time/line charts.


## [0.8.1] - 2024-10-09
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#461](https://github.com/shlinkio/shlink-web-component/issues/461) Ensure `shortUrlsList.confirmDeletion` setting is `true` in any case, except when explicitly set to `false`.
* [#237](https://github.com/shlinkio/shlink-web-component/issues/237) Set darker color for previous period in charts, when light theme is enabled.
* [#246](https://github.com/shlinkio/shlink-web-component/issues/246) Fix selected date range not reflected in visits comparison date range selector, when selecting it in the line chart via drag'n'drop.


## [0.8.0] - 2024-10-07
### Added
* Document how `<ShlinkWebSettings />` is used.
* [#411](https://github.com/shlinkio/shlink-web-component/issues/411) Add support for `ip-address` redirect conditions when Shlink server is >=4.2
* [#196](https://github.com/shlinkio/shlink-web-component/issues/196) Allow active date range to be changed by selecting a range in visits and visits-comparison line charts.
* [#307](https://github.com/shlinkio/shlink-web-component/issues/307) Add new setting to disable short URL deletions confirmation.
* [#435](https://github.com/shlinkio/shlink-web-component/issues/435) Allow toggling between displaying raw user agent and parsed browser/OS in visits table.
* [#197](https://github.com/shlinkio/shlink-web-component/issues/197) Allow line charts to be expanded to the full size of the viewport, both in individual visits views, and when comparing visits.
* [#382](https://github.com/shlinkio/shlink-web-component/issues/382) Initialize QR code modal with all params unset, so that they fall back to the server defaults. Additionally, allow them to be unset if desired.

### Changed
* Update to `@shlinkio/eslint-config-js-coding-standard` 3.0, and migrate to ESLint flat config.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#331](https://github.com/shlinkio/shlink-web-component/issues/331) Fix short URL deletion confirmation modal getting closed when deleting the short URL failed.


## [0.7.0] - 2024-05-20
### Added
* Add new `@shlinkio/shlink-web-client/settings` entry point, to expose a component rendering the settings form and all settings-related types.

### Changed
* Update dependencies

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.6.2] - 2024-04-17
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* Make sure project dependencies are not bundled with package.
* [#244](https://github.com/shlinkio/shlink-web-component/issues/244) Display `visitedUrl` in visits table if the visit object has it, regardless of it being an orphan visit or not.
* [#327](https://github.com/shlinkio/shlink-web-component/issues/327) Ensure orphan visits type is sent to the server, to enable server-side filtering when consumed Shlink supports it.


## [0.6.1] - 2024-04-10
### Added
* [#293](https://github.com/shlinkio/shlink-web-component/issues/293) Allow redirect rules to be ordered via drag'n'drop, when using a desktop device.

### Changed
* Update JS coding standard

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#302](https://github.com/shlinkio/shlink-web-component/issues/302) Hide short URLs paginator while loading, so that it doesn't display outdated info.
* [#294](https://github.com/shlinkio/shlink-web-component/issues/294) Hide "validate URL" control when consuming Shlink >=4.0, as it is ignored in that case.


## [0.6.0] - 2024-03-17
### Added
* [#271](https://github.com/shlinkio/shlink-web-component/issues/271) Add support for redirect rules when consuming Shlink 4.0.0.

### Changed
* [#249](https://github.com/shlinkio/shlink-web-component/issues/249) Replace `react-datepicker` with native `input[type="date"]` and `input[type="datetime-local"]` elements.
* [#257](https://github.com/shlinkio/shlink-web-component/issues/257) Remove dependency on `react-copy-to-clipboard`.
* [#278](https://github.com/shlinkio/shlink-web-component/issues/278) Update to `@shlinkio/shlink-js-sdk` v1.0.0.

### Deprecated
* *Nothing*

### Removed
* [#276](https://github.com/shlinkio/shlink-web-component/issues/276) Drop support for Shlink older than 3.3.0.

### Fixed
* *Nothing*


## [0.5.0] - 2024-01-29
### Added
* [#7](https://github.com/shlinkio/shlink-web-component/issues/7) Allow comparing visits for multiple short URLs, tags or domains.

  When in the tags, domains or short URLs tables, you can now pick up to 5 items to compare their visits. Once selected, you are taken to a section displaying a comparative line chart, which supports all regular visits filtering capabilities.

* [#9](https://github.com/shlinkio/shlink-web-component/issues/9) Allow comparing visits with the previous period.

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#217](https://github.com/shlinkio/shlink-web-component/issues/217) Fix all visits loaded when trying to reset other non-date related filters
* [#22](https://github.com/shlinkio/shlink-web-component/issues/22) Ensure unknown query params are preserved by query-related hooks


## [0.4.1] - 2023-12-09
### Added
* [#117](https://github.com/shlinkio/shlink-web-component/issues/117) Migrate charts from Chart.JS to Recharts.

### Changed
* Update to Redux Toolkit 2.0 and react-redux 9.0
* Update to vitest 1.0.0

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#146](https://github.com/shlinkio/shlink-web-component/issues/146) Make sure selected visits are reset when filtering changes.
* [#123](https://github.com/shlinkio/shlink-web-component/issues/123) Do not reset short URL creation form if saving failed.


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
