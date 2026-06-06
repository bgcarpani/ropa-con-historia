Review all staged and unstaged changes in the working tree, then commit and push them to GitHub with a descriptive commit message.

Steps:
1. Run `git status` to see what files have changed.
2. Run `git diff` (and `git diff --cached` if there are staged changes) to understand what changed and why.
3. Run `git log --oneline -5` to match the existing commit message style.
4. Stage all changed files with `git add` (use specific file names, not `-A`, to avoid accidentally including `.env` or secrets).
5. Write a concise, descriptive commit message in the imperative mood that explains *why* the changes were made (not just what). Follow the existing style from git log.
6. Commit using a heredoc so formatting is preserved, appending: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
7. Push to the current remote branch (`git push`). If the branch has no upstream yet, use `git push -u origin HEAD`.
8. Report the commit hash and pushed branch.

Do not skip hooks (`--no-verify`). Do not force-push. If `git push` fails because the remote has new commits, say so and ask the user how to proceed rather than rebasing or resetting on their behalf.
