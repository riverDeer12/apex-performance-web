# apex-performance-web

Angular 19 admin/coach/client frontend for the Apex Performance fitness-coaching app.
Production: https://apex-performance.fit — Test: https://test.apex-performance.fit

## Branches

- `production` — the working branch. Make changes here.
- `test` — deploys to test.apex-performance.fit via the "Deploy to Test" GitHub Action, no approval needed.
- Pushing to `production` triggers "Deploy to Production", which requires a manual approval on the
  `production` GitHub Environment before it runs (the repo owner approves it in GitHub's UI).

## Required workflow for any change

Never push straight to `production` without going through `test` first:

1. Make the change on `production` (the working tree).
2. `git stash push -u` the changed files (or just the ones relevant to this change).
3. `git checkout test && git pull origin test --ff-only`
4. `git stash pop`
5. Commit, then `git push origin test`.
6. Wait for the "Deploy to Test" GitHub Action to finish (`gh run list --branch test`, poll with `gh run view <id>`).
7. Verify the change on https://test.apex-performance.fit before going further — actually load the page and
   check the change is real (logged-in views need a real login; do not fabricate verification).
8. `git checkout production && git pull origin production --ff-only && git merge test --no-edit`
9. `git push origin production`. If this is blocked by a permission prompt, stop and ask the user how
   they'd like to proceed rather than retrying it yourself.
10. Tell the user the deploy is waiting on their manual approval of the GitHub Environment gate.
11. Wait for the user to say they approved it, then re-verify with `gh run view <id> --json status,conclusion`
    — do not assume the approval took effect just because the user said so; if the run is still `waiting`,
    say so and wait for them to actually approve it in GitHub.
12. Once the run is `completed`/`success`, verify the live change on https://apex-performance.fit.

## Known gotchas

- `dist/` and `.angular/` are tracked in git despite being build output. After any local `ng build`,
  run `git checkout -- dist/ .angular/` before committing so build artifacts don't pollute the diff.
- The Claude Browser pane can serve a stale cached bundle/HTML for a URL it already visited. Force a
  fresh load by appending a unique `?cb=<random>` query string when navigating after a deploy or rebuild.
- Local `ng build` configurations: `production` points at the real production API
  (`https://apex-performance.fit/api`) and `test` points at the test API
  (`https://test.apex-performance.fit/api`) — use `--configuration test` for local verification builds
  so you don't exercise the production backend by accident.
- Active/inactive semantics differ by model: `Client`/`Coach`/`Administrator`/`User`/`Role` use
  `isDeleted: boolean` (true = inactive); `TimeSlot`/`RecurringAppointment` use `status: boolean`
  (true = active). `GET /api/time-slots/all` (admin-scoped) does not return a `status` field at all,
  unlike the coach-scoped `GET /api/time-slots` — don't filter the admin endpoint's data on `.status`.
- i18n is hand-rolled: `TranslationService` (signal-based, `localStorage['lang']`, default `'hr'`),
  `TranslatePipe` (`"translate"`), keys live in `src/app/i18n/translations.ts` as dot-namespaced strings
  for both `en` and `hr` — add both when adding a new key.
