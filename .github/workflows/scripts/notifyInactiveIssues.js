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

    const issuesResponseData = inactiveIssues.map((issue) => issue.number);
    if (issuesResponseData.length > 0) {
        const issueList =  issuesResponseData.toString();
        core.info(`The issues to update are : `);
        core.info(issuesResponseData.toString());
        return issueList;
    }
}
