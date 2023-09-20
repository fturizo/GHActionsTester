module.exports = async ({github, context, core}) => {
    const {owner, repo} = context.repo;

    let votingLabel = "Status: Voting";
    let parsedDays = parseFloat(process.env.daysInterval);

    // Query all GH issues for Voting
    let response = await github.rest.issues.listForRepo({
        owner,
        repo,
        labels: votingLabel,
        state: 'open',
    });

    //response has all the issues labeled with Voting.
    if (response.data.length === 0) {
        core.debug('No issues marked for voting found. Exiting.');
        return;
    }

    let now = new Date().getTime();
    for (let issue of response.data) {
        core.debug(`Processing issue #${issue.number}`);
        core.debug(`Issue was created ${issue.created_at}`);

        let createdDate = new Date(issue.created_at).getTime();
        let daysSinceCreated = (now - createdDate) / 1000 / 60 / 60 / 24;

        let reactions = issue.reactions['+1'];
        core.debug(`reaction is ${reactions}`);

        if (reactions < 2 && daysSinceCreated > parsedDays) {
            core.debug(`Closing #${issue.number} because it hasn't received enough votes after ${parsedDays} days`);

            const message = `
                Greetings,
                  This issue has been open for community voting for more than ${parsedDays} days and sadly it hasn't received enough votes to be considered for its implementation according to our community policies.
                  As there is not enough interest from the community we'll proceed to close this issue.
                `;

            await github.rest.issues.removeLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                name: votingLabel,
            });

            await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                body: message,
            });

            await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                state: 'closed',
            });
        }
    }
}
