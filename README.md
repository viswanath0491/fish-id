# Fish-ID

Fish-ID is a lightweight prototype interface for a final year project focused on automated fish species identification. The UI demonstrates:

- Image upload and mock identification
- Live camera capture and mock identification
- Detailed species information cards
- Regional habitat mapping on an interactive map

## Run locally

You can serve the static site with any web server. For example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## Notes

The current implementation simulates model inference with sample species profiles in `app.js`. Replace this logic with your trained model and API integration when available.
