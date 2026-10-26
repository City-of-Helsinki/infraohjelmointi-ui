# Changelog

## [1.13.0](https://github.com/City-of-Helsinki/infraohjelmointi-ui/compare/infraohjelmointi-ui-v1.12.0...infraohjelmointi-ui-v1.13.0) (2026-10-22)


### Features

* Add accordions to show filled fields for project programme section cards (IO-938) ([#554](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/554)) ([505c8ab](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/505c8ab987f95908790a175ed2e78ffac8b739c1))
* Add change-history info tooltip and field labels (IO-881) ([8fc8ec5](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/8fc8ec5f7a0ac0442f073a58c9d1b51d74e0a1d7))
* Add coordination view report (IO-884) ([#580](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/580)) ([b59e22f](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/b59e22f32d02c7031af427a7d21f9b570d6e569d))
* Add draft state notification for project programme (IO-924) ([#549](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/549)) ([43363d7](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/43363d72a726b868a02864cff3a8854ba3b4b807))
* Confirm the linked pw project before saving an hkrid (IO-935) ([90c5250](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/90c5250242cccddd3b6d6c88862de1ceaf613325))
* **construction-handover:** Add attachments and links section (IO-856) ([#607](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/607)) ([fb57496](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/fb57496619ae5d19a2b0467a1d07d2b8c2701120))
* Implement adding, viewing and deleting project note image attachments (IO-786) ([#536](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/536)) ([441ca14](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/441ca148eaab11c755a8d111478bce16a99071fb))
* **ui:** Added confirmation to return complete programme to draft ([#617](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/617)) ([bf6d536](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/bf6d5363478299dea78f3942532f2c74f277c89f))
* **ui:** Added new fields to traffic changes section ([#569](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/569)) ([5b453a1](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/5b453a14e81008f45d898b9f72beada2a59f23d0))
* **ui:** Adds construction start column also to planning table ([#598](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/598)) ([fba3867](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/fba3867d17732d7c402594f8beaf2ed01e467781))
* **ui:** Renamed program field in project to additionalInformation ([#589](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/589)) ([342b871](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/342b87189263d663467f3a16a7100cbf110f0b2d))


### Bug Fixes

* Add planning end column to MyWorkLoad table construction projects (IO-926) ([#553](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/553)) ([b5a32d9](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/b5a32d9690d41e6d5b5199a681a6a091c8c7a411))
* Change tooltip position for submit to programmer and construction buttons (IO-859) ([#550](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/550)) ([507bc8c](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/507bc8ca59520100c7621f4f3789e762be00e97d))
* Check restricted access with class ids from who-am-i (IO-756) ([e31b5fb](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/e31b5fb79682819691b4948244235e40a8383504))
* Close review gaps in the pw link confirmation (IO-935) ([ad52996](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/ad529964981aad4b8fd01d8af5708cf3ac15a083))
* **construction-handover:** Hide save draft button from responsible person (IO-849) ([#611](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/611)) ([457e93e](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/457e93e210f088b0800dfff1ff61de1a40051b1a))
* Detect restricted programmers by the api flag, not the group name (IO-756) ([c83b347](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/c83b3472cc2ba44ee48bd926462584075605d54b))
* Explain an unsaved hkrid in the save toast (IO-935) ([8701a4b](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/8701a4b6465508295ebec0ba1733014c4f5445e6))
* Fetch select lists in parallel and tolerate individual failures (IO-946) ([#600](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/600)) ([40d72cf](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/40d72cfa8d84a62aa0fd89073731079898442272))
* Fix PDF reports download (IO-884) ([#597](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/597)) ([1f5ef31](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/1f5ef315ddf986df5cd31f8a456596c29e4e719a))
* Fix project search in group dialog (IO-944) ([#568](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/568)) ([d715eac](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/d715eaca7a7be6455e47b153df1b5945e2ef49a0))
* Fixes according to testing comments (IO-805) ([#551](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/551)) ([8709f37](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/8709f37e1ef2172747265feede54f1a7ae5d1600))
* Fixes to MyWorkloadTasks according to testing comments (IO-899) ([#552](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/552)) ([9a9c921](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/9a9c9210aa1a93c5f5922aa4094973dc24f68a66))
* Give restricted programmers their own role instead of viewer (IO-756) ([ad4b1fe](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/ad4b1fe3ff43af01eead5a12747e06758583a122))
* Hide actions restricted programmers can't use (IO-756) ([83d8c38](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/83d8c3855efee9ef4051a029bd0245dd43441601))
* Keep the typed hkrid when the pw link is cancelled (IO-935) ([e599714](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/e599714f28c7eb8e66618c6dd68c54d0ae531849))
* Place change-history info tooltip next to the button (IO-881) ([c9ebfda](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/c9ebfda68bb9f26b008ad4067e5976a7cf00722d))
* **ui:** Enabled open groups button for coordination view ([#609](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/609)) ([ef1afba](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/ef1afba4666ffa0805462c548ffe777ae5483265))
* **ui:** Fix ui tests in a way that removes unnecessary console.errors ([#603](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/603)) ([8b55598](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/8b55598a447e8510fc476be161a5dc12da45a641))
* **ui:** Fixed bug in gap years in strategy (and -f2f) reports ([#612](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/612)) ([4f248d8](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/4f248d8e00fc4e453b97765edaaa0f5d24388d2b))

## [1.12.0](https://github.com/City-of-Helsinki/infraohjelmointi-ui/compare/infraohjelmointi-ui-v1.11.1...infraohjelmointi-ui-v1.12.0) (2026-09-17)


### Features

* Update info texts in AdminForcedToFrame.tsx (IO-900) ([#518](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/518)) ([df4e4c1](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/df4e4c15ad89f68f3009cf03eb8a4e6bce3d9814))


### Bug Fixes

* Fix text in forced to frame budget data update dialog (IO-900) ([#537](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/537)) ([cd1c0f6](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/cd1c0f6c55ce117ef0c91a862830a4f476bd1234))
* **ui:** Added styling to break long text in notes ([#540](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/540)) ([0ad1f1f](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/0ad1f1fcf2c00002ccc00f0d8d90b6bc45607d60))
* **ui:** Fixed validation for phase detail ([#534](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/534)) ([2fc0ee5](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/2fc0ee55b7134f11ec96fa0f56287a023b3e8552))
* **ui:** Replaced break-all with better css style option ([#542](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/542)) ([2afa776](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/2afa776f6ee992009280faaf8ce69a620d05b76b))

## [1.11.1](https://github.com/City-of-Helsinki/infraohjelmointi-ui/compare/infraohjelmointi-ui-v1.11.0...infraohjelmointi-ui-v1.11.1) (2026-08-20)


### Bug Fixes

* Add required prop to NumberField for release build (IO-863) ([e27b148](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/e27b148e7deb92593f023db4d04dd4f6a2db8757))

## [1.11.0](https://github.com/City-of-Helsinki/infraohjelmointi-ui/compare/infraohjelmointi-ui-v1.10.5...infraohjelmointi-ui-v1.11.0) (2026-08-20)


### Features

* IO-863 Merge planning phases into one Suunnittelu phase, update labels & icon ([#519](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/519)) ([4b0d78e](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/4b0d78e337da6a63c4b847608d0c2498abe1a63b))
* Remove Phase and Phase-detail editing from the admin view (IO-927) ([#528](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/528)) ([c845cb0](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/c845cb06878310d08f631fa94ac73cdaaa4272c9))


### Bug Fixes

* IO-865 Scan hkrId array for PW code instead of indexing first item ([9571f7c](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/9571f7c7e39b49456142e612ae68f736a3d96b1a))
* IO-865 Show localized toast when PW-hanketunnus is not found in PW ([b928209](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/b9282091725ef42427ff146ec9ac44cbe09855dc))
* Remove warrantyIncomplete translation (IO-863) ([#532](https://github.com/City-of-Helsinki/infraohjelmointi-ui/issues/532)) ([a519f7a](https://github.com/City-of-Helsinki/infraohjelmointi-ui/commit/a519f7acc5833f22d58e25b6264474fc4be3e7fd))
