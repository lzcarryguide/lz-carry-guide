LZ CARRY WEBSITE
================

PROJECT OVERVIEW
----------------
LZ Carry is a static, responsive Last Z community guide and gaming-assistance
website. It uses original LZ Carry-authored public content and tools. Community
websites may be consulted for research and cross-checking, but their wording,
layouts, graphics, and guide presentation must not be copied or closely
reproduced.

CURRENT WEBSITE FEATURES
------------------------
- Homepage introducing LZ Carry and its main sections.
- "Watch Our Videos" homepage section linking directly to the LZ Carry
  YouTube channel: https://www.youtube.com/@Queen_WANGEL
- Searchable guide directory with category and player-stage filtering.
- Beginner, research/progression, heroes/troops, and events/rewards sections.
- HQ progression planner covering HQ upgrade steps, prerequisite buildings,
  resource requirements, source comparisons, range totals, and a locally
  saved completion checklist.
- Weekly Pilot service information:
    * Weekly Pilot — $30 (Sunday–Saturday)
    * Weekly + Canyon Clash — $35 (Sunday–Saturday)
- Responsive styling for desktop and mobile screens.
- Unpublished or unverified guide entries are not presented as published
  advice.

CURRENT PROJECT STRUCTURE
-------------------------
index.html                       Homepage and Watch Our Videos section
guides.html                      Searchable guide directory
beginner.html                    Beginner content and HQ progression planner
research.html                    Research and progression category
heroes.html                      Heroes, troops, and power category
events.html                       Events and rewards category
pilot.html                        Service packages and booking information
style.css                         Shared responsive visual design
assets/
  weeping-angel.png               Site artwork
  js/
    guide-library.js              Guide search, filtering, and rendering
    hq-planner.js                 HQ planner logic and progress storage
data/
  guides.json                     Guide directory records and publication status
  hq-requirements.json             Structured HQ requirements and research data
docs/
  lz-carry-expansion-plan.md      Expansion scope and implementation notes
  guide-database-schema.md        Guide record schema and publishing rules
  hq-requirements-data-spec.md    HQ data format and interpretation
  hq-source-review.md             Research references and discrepancy notes
  phase1-preview-test-report.md   Earlier preview and test notes
tests/
  branch-preview.spec.js          Navigation, page, content, and responsive checks
  hq-planner.spec.js               HQ planner behavior and data checks
playwright.config.js               Browser-test configuration
.github/workflows/
  branch-preview.yml               Automated branch browser-test workflow

RESEARCH AND CONTENT POLICY
---------------------------
- Write public guides, explanations, tables, and tools in LZ Carry's own
  wording, structure, and visual style.
- Use external websites only as research references and for cross-checking.
- Do not copy or closely reproduce another site's wording, page layout,
  graphics, or guide structure.
- Do not add unnecessary external guide-site links to public guide pages.
- Keep source attribution, reported values, dates checked, and disagreements
  documented in the research records and structured data.
- Clearly label community-reported figures; the in-game upgrade panel is the
  final check for account-specific requirements and costs.
- Do not publish draft or unverified guide entries as completed advice.
- Only add videos supplied or approved by the LZ Carry channel owner.

SERVICE AND CONTACT STATUS
--------------------------
The service page currently describes package scope and booking preparation.
A direct contact button is intentionally absent until an official contact
destination is supplied. The website does not process bookings or payments
automatically.

DEVELOPMENT AND TESTING
-----------------------
The project is plain HTML, CSS, and JavaScript. Browser tests use Playwright
and are run by the GitHub Actions workflow on the expansion branch.

To run the tests locally in an environment with Node.js and dependencies
installed:

  npx playwright test

Review the test configuration and workflow for the required browser setup.
The browser tests check navigation and key page content, guide search and
filtering, HQ planner calculations and checklist behavior, and responsive
mobile layout.

BRANCH AND RELEASE SAFETY
-------------------------
Current development branch: lz-carry-expansion

Keep feature work on the expansion branch until the release owner has reviewed
the preview and explicitly approved the merge. Do not merge into main or
configure/deploy production as part of routine preview testing. A successful
browser-test run is not itself release approval.

IMPORTANT SECURITY NOTES
------------------------
- This is a public static website. Do not place passwords, login codes,
  recovery codes, private client information, or other secrets in the repo.
- The site does not provide automatic booking, payment processing, or
  authenticated account management.
- Check the game's rules and account-security options before arranging any
  account assistance.
