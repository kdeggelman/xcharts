# xCharts Site Templates

This branch is intended as a medium for building a static site for GitHub's `gh-pages` feature.

## Testing Changes

1. Run `make` to get all dependencies.
2. Build and retrieve the xCharts JavaScript files from the master branch with `make get-xcharts`
3. Launch the dev server with `make run`
4. Your browser should open directly to the home page
5. Any changes made in the `views` directory will automatically be picked up when you refresh.

## Deploying

To deploy the static site to `gh-pages`, run `make build` from your command line.

This command will build all pages and xCharts JavaScript files, commit to the `gh-pages` branch, and push to GitHub.
