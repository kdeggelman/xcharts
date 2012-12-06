# Contributing to xCharts

At tenXer, we love open source, which is why we've published xCharts back to the community. As always, thank you for contributing! Before you get started, please note that we also value high quality code, so we have a few recommendations that help us keep things that way.

## Reporting Issues

The best issue report is able to be reproduced immediately, 100% of the time. Do your best to include the following:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior

[gh-3](https://github.com/tenXer/xcharts/issues/3) is a simple example of any easy to follow and reproduce issue.

## Pull Requests

After cloning your fork, **the first step you should take is to run `make` inside the repo**. This will ensure dependencies are met (with the exception of PhantomJS) and install commit hooks that will help warn you about broken tests.

If you are adding new functionality, be sure to write tests and commit new documentation to the `site-templates` branch

### JavaScript

We use JSLint to keep our code tidy. JSLint will hurt your feelings, but it will very clearly point out what's wrong and how to fix it.

To test for lint issues, run `make lint` from the repo directory.

If you've properly set up the repo by running `make`, you will be prevented from committing any code that does not follow the defined configuration.

### Test-Driven

Most of xCharts functionality is covered by tests. Any added features, changed behaviors, or bug fixes should have tests added and/or changed as necessary. This helps us assert behavior without any manual testing.
