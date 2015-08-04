# Changelog

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

Bugfixes:
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
