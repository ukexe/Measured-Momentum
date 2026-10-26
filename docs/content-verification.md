# Content verification

**Canonical status:** mandatory publication gate  
**Evidence cutoff:** 25 October 2026  
**Detailed register:**
[`drafts/content-verification.md`](drafts/content-verification.md)

The detailed register is preserved as the claim-by-claim evidence record. This
file is the release-facing rule: a polished page, source link or directory
entry does not by itself authorise publication.

## Status rule

- **U — Unverified:** do not publish.
- **P — Partially verified:** do not publish the broad claim; approve only a
  narrower sentence supported by the retained evidence.
- **V — Verified:** the exact sentence, source, consent/rights record, verifier,
  approval date and next review date are retained.
- **D — Disputed:** do not publish pending a resolved record and accountable
  sign-off.
- **E — Expired:** remove or reverify.
- **N/A — Not used:** the claim will not appear.

Every material published statement must map to a detailed register ID and be
`V` for the intended channel. Do not silently broaden or paraphrase approved
wording.

## Current controlled facts

- WRRC’s India directory entry is for **Acrobatic Rock'n'Roll Federation of
  India** and says **“On Hold.”**
- WDSF’s separate India entry is for **Amateur DanceSport Federation of India
  (ADSFI)** and says **“Full”** and **“Recognised by NOC: No.”**
- Those records do not establish identity, relationship, succession,
  delegation, recognition or affiliation between the two entities or with
  this proposal.
- “Full” is a WDSF membership status; it is not a government/NOC recognition
  claim. “On Hold” must not be given an inferred meaning.
- No reviewed record verifies the proposed organisation’s legal identity,
  relationship to either entity, recognition or governing authority.

The source analysis and cautious limits are in
[`research-and-governance.md`](research-and-governance.md).

## Claims currently blocked

The detailed register marks the following groups unverified:

- organisation name, legal form, registration, tax/banking status, scope and
  authority (`ORG-*`, `LEGAL-*`);
- every founder identity, role, biography, chronology, competition claim,
  placement, title and qualification (`FOUNDER-*`, `EXP-*`, `TITLE-*`,
  `PLACEMENT-*`, `QUAL-*`, `OFFICE-*`);
- affiliation, recognition, NOC, WRRC, WDSF and ADSFI status (`AFF-*`);
- public email, phone, WhatsApp, address, contact person and office hours
  (`CONTACT-001`);
- logos, national/official-looking marks, photographs, video, likeness consent
  and caption accuracy (`LOGO-*`, `PHOTO-*`);
- events, results, sanctioning, safety, safeguarding and participant claims
  (`EVENT-*`, `RESULT-*`);
- constitution, complaints, conflicts, anti-doping, privacy, fundraising,
  memberships and refunds as adopted/operational policies (`POLICY-*`).

Empty people, competition and news collections in the application are
therefore intentional. Draft evidence and placeholder material must not be
copied into them.

## Evidence required for a verified item

Retain at minimum:

1. the exact approved public sentence;
2. primary source or issuer confirmation, instrument/event date and current
   status;
3. access/verification date, verifier and accountable approver;
4. scope, territory, conditions, expiry and next review date;
5. consent and copyright/logo/photo licence where a person or asset is used;
6. an archived copy or screenshot where lawful;
7. a correction, withdrawal and takedown route.

Self-authored CVs, social posts, travel evidence, photographs, medals or
unsourced certificates may corroborate but do not independently prove
representation of India, a title, result, qualification, affiliation or legal
status.

## Legal and policy content

The `/privacy/` and `/terms/` routes are implementation-specific engineering
drafts, are page-level `noindex`, and display:

> **DRAFT — REQUIRES PROFESSIONAL LEGAL REVIEW; NOT LEGAL ADVICE**

That label must remain until the real operator, controller, activities,
providers, jurisdiction, retention, rights process and contact route are
verified and qualified Indian legal/privacy professionals approve the text.
The same rule applies to any cookie, safeguarding, consent/release, complaints,
fundraising, membership, refund or data-retention wording. A draft page is not
evidence of compliance.

## Release gate

Before each release:

1. inventory every factual claim, name, role, event, result, relationship,
   contact and media asset changed or newly visible;
2. map each item to the detailed register and confirm `V`;
3. re-open current-status sources on the release date;
4. confirm approved wording, consent, licence and review period;
5. verify that proposed-status and non-claim wording remains visible;
6. obtain professional review for all legal/policy text;
7. record reviewer, approval date, next review date and correction owner;
8. remove or correct a claim immediately if the source changes or the issuer
   objects.

Any missing evidence leaves the content blocked. Technical test success cannot
override this gate.

## External blockers

No production approval should imply resolution of the following until records
exist:

- approved legal identity and accountable operator/controller;
- founder and office-bearer evidence;
- verified public contact details;
- direct affiliation/recognition determinations;
- approved domain and public name;
- Cloudflare/Supabase ownership and credentials;
- logo, photo, video and likeness rights;
- live Supabase migration plus RLS/grant execution evidence;
- approved retention, deletion, safeguarding, complaints and incident
  operations.
