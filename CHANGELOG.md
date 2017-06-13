# Changelog

## 2.5.1
Bug fixes:
* Direct session login via link or QR Code now works reliably.
* MotDs are now listed and created for the correct session when MotDs for
  another session were managed before.

## 2.5
Major features:
* Evaluation of free text answers
* The flashcards UI has been overhauled. They are now handled separately from
  questions.
* Question duplication and import from other sessions

Minor features and changes:
* The number of comments is now shown in presentation mode
* New use case including only comments
* Export of answer statistics to CSV format
* Export of questions to arsnova.click format
* Export/import of flashcards to/from arsnova.cards format
* Proxy support for WebSocket connections
* Reduced the amount of API requests sent
* Usability improvements and bug fixes

With this release we have completely overhauled our [documentation](README.md).
Additionally, we now provide
[Docker images](https://github.com/thm-projects/arsnova-docker/).

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Tom "tekay" Käsler  
Contributions: Robin Drangmeister, Daniel "dhx" Haag, Dennis Schönhof  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen)


## 2.4.5
Bug fixes:
* Fixed button visibility problems in Chrome 57+.
* Fixed skipping of login service selection (if only one is enabled for the
  role).
* Fixed activation toggling of votes for all preparation questions.

## 2.4.4
Bug fixes:
* Fix layout problems in Firefox 49+

## 2.3.4
Bug fixes:
* Fix layout problems in Firefox 49+
* ARSnova no longer hangs because of a `ReferenceError` when loading for the
  first time on slow connections.

## 2.4.3
Bug fixes:
* Buttons of the question format bar are now correctly shown or hidden when
  switching use cases.
* Flipping of flashcards is no longer inhibited.

## 2.4.2
Bug fixes:
* Fixed a JavaScript `TypeError` which occured when presenting questions with
  enabled slides feature and required a reload to make ARSnova usable again.
* Button descriptions now adjust correctly when slides are enabled.
* ARSnova no longer hangs because of a `ReferenceError` when loading for the
  first time on slow connections.

## 2.4.1
Bug fixes:
* Theme variable `tabbar-button-icon-color` works again.

## 2.4
Major features:
* Slides: A new content format without any answer options has been added.
* Interactive keynote: A new use case including the 'slides' format has been
  added. It replaces the 'All-inclusive' use case.

Minor features and changes:
* An overlay showing count of new student's questions and average feedback has
  been added to presentation mode.
* Student's questions and comments are now directly displayed instead of a list
  of subjects.
* JSON export and import now include session info and feature settings.

Bug fixes:
* Editor buttons now add new lines when necessary to produce correct Markdown.
* New lines in Markdown content are now displayed as is.
* All question formats apart from 'grid' are now correctly exported to CSV.

New variables for theming:
* `carousel-indicator-unanswered-question-color`
* `icon-danger-color`
* `icon-warning-color`
* `list-header-txt-color`
* `list-header-unread-color`
* `tooltip-background-color`
* `tooltip-text-color`

Changes for developers:
* Initial support for localization variations has been implemented.

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Tom "tekay" Käsler  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen)


## 2.3.3
Bug fixes:
* Fixes JavaScript errors occuring with `question.answer-option-limit` set to
  values other than `8`.
* Fixes charset errors in German i18n of dates.
* Fixes opening of external pages (blog, privacy, legal info) when they can not
  be embedded in Firefox

## 2.3.2
This patch release improves browser compatibility.

Minor changes:
* Improved browser detection

Bug fixes:
* Fixes scrolling with touch devices for Edge browser
* Fixes numerous usability and rendering errors with Internet Explorer

## 2.3.1
Bug fixes:
* Fixes a regression leading to incorrect detection of Safari.

## 2.3
Major features:
* Use case scenarios: To simplify the user interface, question types and
  functions are now enabled on a per session basis. Unused features are hidden
  and no longer distract from the workflow.
* Improved UI theming: Theming has been simplified by providing a variables
  file. Deep knowledge of CSS, SCSS and ARSnova's HTML structure is no longer
  required for color adjustments. Additionally, the default theme got a refresh.
* Message of the Day: It is now possible to display a message to all users per
  session or globally.
* New question type "Ask the audience": four options A, B, C, and D without
  question text.
* CSV export/import (experimental): Questions and their answers can now be
  exported to a simple CSV file.

Minor features and changes:
* Improved formatting: New formatting options (GitHub Flavored Markdown) are
  available.
* New templates for opinion polls have been added.
* Chrome's "pull-to-refresh" action is now longer triggered in text fields.
* Text selection in multiline editors no longer triggers scrolling.
* It is now possible to freeze live feedback.
* Image uploads except for hot spot questions and image answers are no longer
  available. Images on external servers can still be embedded via Markdown.
* Usability improvements and bug fixes

Bug fixes:
* Image scaling and rotation have been fixed.

Changes for developers:
* The `grunt run` build task has been improved to display important messages by
  Sencha Cmd. Verbose output for debugging purposes is displayed when parameter
  `-v` is used.
* Maven builds are now deprecated for the frontend. Please use Grunt instead.
* Version information is now saved with builds and is accessible via `Version`
  controller.

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Tom "tekay" Käsler,
Christoph Thelen  
Contributions: Daniel Haag (University of Innsbruck), Juan Markowich,
Marco Schäfer  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen)


## 2.2
Major features:
* Peer Instruction: A question can now be answered again in a second round.
  To limit the answering time, a countdown timer can be activated.
* Full screen mode: The browser automatically enters full screen mode when
  presenting questions. Additionally, a theme optimized for projections is used
  in this case. The font size can be adjusted.
* Learning analytics: Multiple calculation options for learning progress have
  been introduced.
* Image answers (experimental): Free text answers can now be answered with an
  image (the feature has to be enabled explicitly for a question).
* Performance: A lot of improvements have been introduced to make the UI more
  responsive

Minor features and changes:
* Simplified text formatting: A formatting tool bar has been introduced.
* Video embedding from YouTube and Vimeo
* Code syntax highlighting in questions
* Hint & solution for questions
* Session info: The previously with public pools introduced session info is now
  available for all sessions.
* QR Code: It is now possible to generate and display QR Codes for a sessions
  directly from ARSnova Mobile.
* Role switching: Switching between speaker to student views is now possible
  without leaving a session or logging out.
* Embedded pages: External websites are now embedded in ARSnova (if possible)
  instead of opening a new browser tab.
* Usability improvements and bug fixes

Bug fixes:
* Fixed a rendering bug with latest Chrome versions (43+) which made question
  answering impossible.

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Christoph Thelen  
Contributions: Simon Hauck, Marcel Hedderich, Dominik Hikade, Nicola Justus,
Tom Käsler, Maximilian Klingelhöfer, Franciska Periša, Simeon "EinBaum" Perlov,
Björn Pfarrreis, Sviatlana Plakhina, Dennis Schönhof, Katharina Staden,
Max Steinwachs  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen)  


## 2.1
Major features:
* Modern theme: The ARSnova theme has been completely overhauled. The new theme
  uses scalable, single colored icons and plain colors instead of
  gradients.
* Export and import of sessions (experimental): It is now possible to export
  sessions with their questions and answers. Exported data can be imported into
  a new session.
* Public Pool (experimental): It is now possible to share sessions with other
  users in a pool of public sessions. Other users can create their own copies of
  shared sessions.

Minor features and changes:
* The usability on non-mobile devices has been improved. It is now possible to
  scroll via mouse wheel.
* Buttons linking to a manual, blog, imprint and privacy policy have been added
  to the bottom toolbar. The URLs can be set up in the backend's configuration.
* It is now possible to integrate the analytics software
  [Piwik](http://piwik.org). The tracking parameters are set up in the backend's
  configuration.

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Christoph Thelen  
Contributions: Felix Schmidt, Artjom Siebert, Daniel Vogel  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen)  


## 2.0.2
This is a security and bug fix release. It introduces the following changes:
* Fix XSS vulnerability in panels with Markdown and MathJax support
* Fix rendering issue with MathJax caused by an updated version delivered via
  CDN. ARSnova Mobile now explicitly requests MathJax 2.4.

## 2.0.1
This is a security and bug fix release. It introduces the following changes:
* HTML code is always filtered for skill questions
* MathJax's safe mode is enabled
* Line breaks are displayed even if Markdown is disabled
* The Presenter button uses the path from configuration and is hidden for
  guests

## 2.0
ARSnova 2.0 has been in development for more than two years. Further releases
can be expected much more frequently.

The second major release finally introduces compatibility for non-webkit
browsers. Starting with this version, ARSnova Mobile no longer has direct
access to the database. It now depends on the separate ARSnova Backend
software, which introduces more options for access control. Furthermore ARSnova
Mobile has got support for additional question formats and a new theme.

**This version is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Lead programming: Andreas Gärtner, Daniel Gerhardt, Christoph Thelen,
Paul-Christian Volkmer  
Contributions: Colin Appel, Sören Gutzeit, Julian Hochstetter, Jan Kammer,
Daniel Knapp, Alexander Nadler, Julian Rossback, Karolina Rozanka, Jannik
Schaaf, Felix Schmidt, Artjom Siebert, Daniel Vogel  
Testing & Feedback: Kevin Atkins, Kathrin Jäger  
Sponsoring: [AG QLS](https://www.thm.de/site/en/hochschule/service/ag-qls.html),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen),
[@LLZ](http://llz.uni-halle.de/)  


## 1.0
**The initial release of ARSnova is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Design & programming: Christian Thomas Weber  
