# Splitting the embedded app assets

Disease Atlas currently keeps its application styles and JavaScript inline in `index.html`. The repository also has a separate `style.css`, so the extraction helper deliberately writes to `disease-atlas.css` and does not overwrite that file.

To split the inline assets while preserving their contents and behavior, run from the repository root:

```sh
python3 scripts/split-app.py
```

This produces `disease-atlas.css` and `disease-atlas.js`, updates `index.html` to load them, and saves the original as `index.html.bak`. The script checks that it finds exactly one inline style and script block and refuses to overwrite existing output files unless `--force` is provided.

After running it, test the site locally and review the generated files before committing. The extraction is intentionally mechanical; it does not yet reorganize application logic, replace inline event handlers, or change rendering behavior.
