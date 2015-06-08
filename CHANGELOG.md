# Changelog

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
