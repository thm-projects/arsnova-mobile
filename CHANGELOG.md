# Changelog

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
Sponsoring: [AG QLS](https://www.thm.de/zqe/qmnetzwerk/agqls),
[HMWK](https://wissenschaft.hessen.de/wissenschaft/it-neue-medien/kompetenznetz-e-learning-hessen),
[@LLZ](http://llz.uni-halle.de/)  

## 1.0
**The initial release of ARSnova is brought to you by:**  
Project management: Klaus Quibeldey-Cirkel  
Design & programming: Christian Thomas Weber  
