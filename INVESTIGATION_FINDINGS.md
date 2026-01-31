# Investigation Findings: Missing 1.32 to 1.4 from ChangeLog

**Date**: 2026-01-29
**Issue**: #36 - Missing 1.32 to 1.4 from ChangeLog  
**Triggered by**: Review comment on PR #35 by @NZWEBAPPSBot

## Executive Summary

The investigation reveals a **version sequencing error** in the `api-server/structure-changelog.md` file. The structure version history incorrectly jumps from version **1.32 directly to 1.4**, skipping intermediate versions (1.33, 1.34, etc.). This creates a conflict with PR #35, which attempts to document changes as version "1.32 → 1.33", but this comes AFTER the already-documented "1.32 → 1.4" entry.

## Root Cause

The issue originated in commit **8400e566a659611f73e2eb025ea647ca354ecdc5** (Jan 17, 2026) which incorrectly labeled the version transition as **"1.3 → 1.4"** instead of **"1.32 → 1.33"** or a subsequent incremental version.

### Timeline of Version Progression

1. **Versions 1.0 → 1.3**: Standard sequential versioning
2. **Version 1.3 → 1.31**: Minor version bump (Jan 16, 2026)
3. **Version 1.31 → 1.32**: Minor version bump (Jan 16, 2026)
4. **❌ Version 1.3 → 1.4**: **ERROR** - Original commit 8400e56 (Jan 17, 2026)
   - This should have been labeled "1.32 → 1.33" to maintain sequence
5. **Partial Fix in commit 9cadbc0** (Jan 18, 2026):
   - Fixed the **table** to show "1.32 → 1.4" 
   - ❌ **But left the JSON** showing "1.3_to_1.4" and "version": "1.3 → 1.4"
6. **PR #35 conflict**: Now attempting to add "1.32 → 1.33" which conflicts with existing "1.32 → 1.4"

## Evidence

### 1. Current State (main branch)
From `/api-server/structure-changelog.md`:

```markdown
| 1.31 → 1.32 | Fri 16 Jan 2026 17:31:56 NZDT | Added | `CHANGELOG.md` | Added back at root level of api-server |
| 1.31 → 1.32 | Fri 16 Jan 2026 17:31:56 NZDT | Added | `structure-changelog.md` | Added at root level of api-server |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `src/tests/_support/testEnvLoader.js` | Test environment loader utility for loading test configuration |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `src/tests/README-TESTS.md` | Comprehensive test documentation and guidelines |
```

Note: The table shows "1.32 → 1.4" but in the JSON section below, it still shows:
```json
"1.3_to_1.4": {
  "version": "1.3 → 1.4",
  "date": "Sun 18 Jan 2026 12:28:13 NZDT",
```

### 2. Original Error (Commit 8400e56 - Jan 17, 2026)
The commit that added test documentation incorrectly labeled the version as "1.3 → 1.4" when it should have been "1.32 → 1.33" (or similar).

### 3. Partial Fix (Commit 9cadbc0 - Jan 18, 2026)
Updated the markdown table to show "1.32 → 1.4" but failed to update:
- JSON key: Still `"1.3_to_1.4"` (should be `"1.32_to_1.4"`)
- JSON version field: Still `"version": "1.3 → 1.4"` (should be `"version": "1.32 → 1.4"`)

### 4. PR #35 Review Comment
Review by @NZWEBAPPSBot on structure-changelog.md line 65:
> "We are out of sequence? What happened to the work for 1.4?"

**Context**: PR #35 is attempting to add version "1.32 → 1.33", but the changelog already contains "1.32 → 1.4", creating a logical impossibility in the version sequence.

## Impact

1. **Version History Confusion**: The structure changelog now has a non-sequential version jump that makes it unclear what versions exist
2. **PR Conflicts**: PR #35 cannot properly add "1.32 → 1.33" when "1.32 → 1.4" already exists
3. **Documentation Integrity**: The inconsistency between the markdown table and JSON representation creates confusion
4. **Traceability Lost**: The skipped versions (1.33, 1.34, etc. up to 1.39) are not documented

## What Actually Happened

The changes documented under "1.32 → 1.4" (or originally "1.3 → 1.4") actually represent work done between version 1.32 and what should have been version 1.33 (or 1.321, 1.322, etc. depending on the versioning scheme).

**Changes included in the incorrectly-labeled "1.32 → 1.4":**
- Added `src/tests/_support/testEnvLoader.js`
- Added `src/tests/README-TESTS.md`
- Added `structure-changelog.md` to structure tree
- Added `documentation/00-history/structure1_4.md`

These changes were committed on Jan 17-18, 2026, and should have been labeled as a minor increment from 1.32 (e.g., 1.33 or 1.321).

## Recommendations

### Option 1: Retroactive Relabeling (Most Accurate)
Relabel the existing "1.32 → 1.4" entry to "1.32 → 1.33" to restore proper version sequencing:
- Update both the markdown table AND the JSON section
- Keep structure1_4.md as a historical artifact but note the version discrepancy
- Allow PR #35 to use "1.33 → 1.34" or subsequent version

### Option 2: Accept the Jump (Document the Gap)
Keep "1.32 → 1.4" but add a note explaining the version jump:
- Add documentation explaining versions 1.33-1.39 were skipped
- PR #35 becomes "1.4 → 1.41" or "1.4 → 1.5"
- Add a "Known Issues" section to structure-changelog.md

### Option 3: Reset to Sequential (Most Disruptive)
Reset all versions after 1.32 to follow sequential numbering:
- Current "1.32 → 1.4" becomes "1.32 → 1.33"
- Rename structure1_4.md to structure1_33.md
- PR #35 becomes "1.33 → 1.34"
- Update all references

## Conclusion

The "missing 1.32 to 1.4" issue is actually a **version labeling error** where the version should have been incrementally labeled (1.33) but was instead labeled 1.4, creating a gap in the version sequence. The work documented under "1.32 → 1.4" does exist and was committed to the repository; it was simply mislabeled.

**The work is not missing - the version number is wrong.**

---

## Investigation Methodology

1. ✅ Examined local repository structure
2. ✅ Reviewed CHANGELOG.md and structure-changelog.md files
3. ✅ Analyzed git commit history via GitHub API
4. ✅ Traced specific commits (8400e56, 9cadbc0) related to version 1.4
5. ✅ Reviewed PR #35 and associated review comments
6. ✅ Compared file states across different commits
7. ✅ Identified the version labeling inconsistency

## Artifacts Referenced

- `api-server/CHANGELOG.md` - Main product changelog
- `api-server/structure-changelog.md` - Structure version tracking (contains the error)
- Commit 8400e566 (Jan 17, 2026) - Original mislabeling
- Commit 9cadbc0 (Jan 18, 2026) - Partial fix attempt
- PR #35 - Current PR blocked by version conflict
- Structure files: `structure1_31.md`, `structure1_32.md`, `structure1_4.md`

