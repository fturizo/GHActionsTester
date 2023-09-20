module.exports = async ({github, context, core, daysInterval}) => {
    const { owner, repo } = context.repo;
    const openLabel = "Status: Open";

    const parsedDays = parseFloat(daysInterval);
    const timeThreshold = parsedDays * 24 * 60 * 60 * 1000;

    // Query all GH issues that are open
    const response = await github.rest.issues.listForRepo({
        owner,
        repo,
        labels: openLabel,
        state: "open",
    });
    core.debug(`Inactive interval days is set to ${parsedDays}`);
    let inactiveIssues = response.data.filter((issue) => ((new Date().getTime() - new Date(issue.updated_at).getTime()) > timeThreshold ));

    core.debug(`${inactiveIssues.length} issues detected to be inactive`);

    if (inactiveIssues.length > 0) {
        return inactiveIssues.map((issue) => {
            return {
                number : issue.number,
                title : issue.title,
                url: issue.html_url,
                assignee: issue.assignees.length ? selectedIssue.assignees[0].login : null
            }
        });
    }
}
